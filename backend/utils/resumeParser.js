const fs = require('fs');
const path = require('path');

// Lazy require heavy deps to avoid cost when not used
let pdfParse = null;
let mammoth = null;
let OpenAIClient = null;

function safeLoadPdfParse() {
  try {
    if (!pdfParse) pdfParse = require('pdf-parse');
    return pdfParse;
  } catch (e) {
    return null;
  }
}

function safeLoadMammoth() {
  try {
    if (!mammoth) mammoth = require('mammoth');
    return mammoth;
  } catch (e) {
    return null;
  }
}

function safeLoadOpenAI() {
  try {
    if (!OpenAIClient) OpenAIClient = require('openai');
    return OpenAIClient;
  } catch (e) {
    return null;
  }
}

function extractEmail(text) {
  const re = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const m = text.match(re);
  return m ? m[0] : null;
}

function extractPhone(text) {
  // Generic international-ish phone finder
  const re = /(\+?\d{1,3}[\s-]?)?(\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{4}/g;
  const candidates = (text.match(re) || []).map((s) => s.trim());
  // Heuristic: prefer numbers with 10+ digits
  const normalized = candidates
    .map((s) => s.replace(/[^\d]/g, ''))
    .filter((s) => s.length >= 10);
  if (normalized.length) {
    return candidates[normalized.findIndex((n) => n.length >= 10)] || candidates[0];
  }
  return candidates[0] || null;
}

function extractName(text) {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  const blacklist = ['resume', 'curriculum vitae', 'cv'];
  for (let i = 0; i < Math.min(lines.length, 20); i++) {
    const line = lines[i];
    const lower = line.toLowerCase();
    if (blacklist.some((b) => lower.includes(b))) continue;
    if (line.match(/@/) || line.match(/\d/)) continue;
    // 2-5 words, letters only-ish
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length >= 2 && words.length <= 5) {
      return line;
    }
  }
  return null;
}

const SKILL_DICT = [
  'javascript','typescript','react','next.js','node','node.js','express','mysql','postgres','mongodb','graphql',
  'aws','gcp','azure','docker','kubernetes','ci','cd','python','django','flask','java','spring','kotlin','go',
  'php','laravel','c#','dotnet','.net','html','css','tailwind','redux','zustand','ngrx','vue','angular','svelte',
  'redis','rabbitmq','kafka','elasticsearch','jest','mocha','cypress','playwright','testing','git'
];

function extractSkills(text) {
  const lower = text.toLowerCase();
  const found = new Set();
  for (const key of SKILL_DICT) {
    const re = new RegExp(`(^|[^a-z])${key.replace('.', '\\.') }([^a-z]|$)`, 'i');
    if (re.test(lower)) found.add(key);
  }
  return Array.from(found).sort().join(', ');
}

function extractEducation(text) {
  const lines = text.split(/\r?\n/).map((l) => l.trim());
  const eduIdx = lines.findIndex((l) => /education|academics|qualification/i.test(l));
  if (eduIdx !== -1) {
    const block = lines.slice(eduIdx, eduIdx + 8).filter(Boolean);
    return block.join(' | ');
  }
  // fallback: find degrees anywhere
  const degrees = lines.filter((l) => /(b\.?tech|b\.?e\.?|m\.?tech|bsc|msc|bca|mca|b\.com|m\.com|mba|phd|bachelor|master)/i.test(l));
  if (degrees.length) return degrees.slice(0, 3).join(' | ');
  return '';
}

async function extractText(filePath, mimeType) {
  const ext = path.extname(filePath).toLowerCase();
  if (mimeType === 'application/pdf' || ext === '.pdf') {
    const pdf = safeLoadPdfParse();
    if (pdf) {
      const data = await pdf(fs.readFileSync(filePath));
      return data.text || '';
    }
  }
  if (
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    ext === '.docx'
  ) {
    const m = safeLoadMammoth();
    if (m) {
      const { value } = await m.extractRawText({ path: filePath });
      return value || '';
    }
  }
  // Fallback: treat as plain text
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return '';
  }
}

async function parseResume(filePath, mimeType) {
  const text = await extractText(filePath, mimeType);
  if (!text) {
    return { rawText: '', name: null, email: null, phone: null, skills: '', education: '' };
  }

  // Heuristic parse first (for fallback/merge)
  const heur = {
    email: extractEmail(text),
    phone: extractPhone(text),
    name: extractName(text),
    skills: extractSkills(text),
    education: extractEducation(text),
  };

  // If OpenAI API key available, ask AI to parse
  const apiKey = process.env.OPENAI_API_KEY;
  const OpenAI = safeLoadOpenAI();
  if (apiKey && OpenAI) {
    try {
      const client = new OpenAI({ apiKey });
      const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
      // Limit text length to keep token usage reasonable
      const limited = text.slice(0, 20000);
      const system = 'You are a resume parsing assistant. Extract key fields precisely.';
      const user = `Extract the following fields from the resume text and return ONLY JSON with keys: name (string), email (string), phone (string), skills (array of strings), education (string).\nIf a field is unknown, use empty string or empty array.\nResume Text:\n---\n${limited}\n---`;

      let completion;
      try {
        completion = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
          temperature: 0,
          response_format: { type: 'json_object' },
        });
      } catch (err) {
        // Some models may not support response_format; retry without it
        completion = await client.chat.completions.create({
          model,
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: `${user}\nReturn only valid minified JSON.` },
          ],
          temperature: 0,
        });
      }

      const content = completion.choices?.[0]?.message?.content || '';
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch {
        parsed = {};
      }

      const aiName = (parsed.name || '').toString().trim() || heur.name || null;
      const aiEmail = (parsed.email || '').toString().trim() || heur.email || null;
      const aiPhone = (parsed.phone || '').toString().trim() || heur.phone || null;
      const aiSkillsArr = Array.isArray(parsed.skills) ? parsed.skills : [];
      const aiSkills = (aiSkillsArr.join(', ') || heur.skills || '').trim();
      const aiEducation = (parsed.education || '').toString().trim() || heur.education || '';

      return { rawText: text, name: aiName, email: aiEmail, phone: aiPhone, skills: aiSkills, education: aiEducation };
    } catch (e) {
      console.warn('AI parsing failed, falling back to heuristics:', e.message || e);
      // fall through to heuristics
    }
  }

  return { rawText: text, name: heur.name, email: heur.email, phone: heur.phone, skills: heur.skills, education: heur.education };
}

module.exports = { parseResume };
