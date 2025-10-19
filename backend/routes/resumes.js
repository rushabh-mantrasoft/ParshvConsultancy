const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fsPromises = fs.promises;
const db = require('../config/db');
const { requireAuth } = require('../middleware/auth');
const { body, query, validationResult } = require('express-validator');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      const error = new Error('Unsupported resume file type.');
      error.code = 'UNSUPPORTED_FILE_TYPE';
      cb(error);
    }
  },
});

async function removeFileIfExists(filePath) {
  try {
    await fsPromises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.warn('Failed to remove uploaded file', err);
    }
  }
}

// GET /api/resumes - list all resumes
// Admin-only list resumes
router.get('/', requireAuth, async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM resumes ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/resumes - upload a resume
// Expects multipart/form-data with fields: candidate_name, email, phone, resume (file)
router.post(
  '/',
  requireAuth,
  (req, res) => {
  upload.single('resume')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Resume file is too large (max 5 MB)' });
      }
      if (err.code === 'UNSUPPORTED_FILE_TYPE') {
        return res.status(400).json({ message: 'Only PDF or Word documents are accepted' });
      }
      console.error('Resume upload failed', err);
      return res.status(500).json({ error: 'File upload failed' });
    }

    const { candidate_name, email, phone, skills, education } = req.body || {};
    const file = req.file;

    if (!candidate_name || !email || !phone || !file) {
      if (file) {
        await removeFileIfExists(file.path);
      }
      return res
        .status(400)
        .json({ message: 'Candidate name, email, phone and resume file are required' });
    }

    try {
      const [result] = await db.query(
        'INSERT INTO resumes (candidate_name, email, phone, skills, education, resume_path, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
        [
          candidate_name.trim(),
          email.trim(),
          phone.trim(),
          (skills || '').toString().trim(),
          (education || '').toString().trim(),
          path.basename(file.filename),
        ]
      );

      res.status(201).json({
        id: result.insertId,
        candidate_name: candidate_name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        skills: (skills || '').toString().trim(),
        education: (education || '').toString().trim(),
        resume_path: path.basename(file.filename),
      });
    } catch (dbError) {
      console.error('Failed to store resume record', dbError);
      if (file) {
        await removeFileIfExists(file.path);
      }
      res.status(500).json({ error: 'Database error' });
    }
  });
}
);

// PUT /api/resumes/:id - update resume metadata (no file)
router.put(
  '/:id',
  requireAuth,
  [
    body('candidate_name').optional().isString().trim(),
    body('email').optional().isString().trim(),
    body('phone').optional().isString().trim(),
    body('skills').optional().isString().trim(),
    body('education').optional().isString().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }
    const { id } = req.params;
    const { candidate_name, email, phone, skills, education } = req.body || {};
    const fields = [];
    const params = [];
    if (candidate_name !== undefined) { fields.push('candidate_name = ?'); params.push(candidate_name); }
    if (email !== undefined) { fields.push('email = ?'); params.push(email); }
    if (phone !== undefined) { fields.push('phone = ?'); params.push(phone); }
    if (skills !== undefined) { fields.push('skills = ?'); params.push(skills); }
    if (education !== undefined) { fields.push('education = ?'); params.push(education); }
    if (fields.length === 0) {
      return res.status(400).json({ message: 'No updatable fields provided' });
    }
    try {
      const [result] = await db.query(`UPDATE resumes SET ${fields.join(', ')} WHERE id = ? LIMIT 1`, [...params, id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: 'Resume not found' });
      }
      res.json({ id: Number(id), candidate_name, email, phone, skills, education });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
);

// DELETE /api/resumes/:id - delete resume and file
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params;
  try {
    const [[row]] = await db.query('SELECT resume_path FROM resumes WHERE id = ?', [id]);
    const [result] = await db.query('DELETE FROM resumes WHERE id = ? LIMIT 1', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Resume not found' });
    }
    if (row && row.resume_path) {
      await removeFileIfExists(path.join(uploadsDir, row.resume_path));
    }
    res.json({ message: 'Resume deleted', id: Number(id) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/resumes/search - search by query and/or skills
// query params: q (text), skills (comma separated)
router.get(
  '/search',
  requireAuth,
  [
    query('q').optional().isString().trim(),
    query('skills').optional().isString().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: 'Invalid input', errors: errors.array() });
    }
    const { q, skills } = req.query;
    const where = [];
    const params = [];
    if (q) {
      where.push('(candidate_name LIKE ? OR email LIKE ? OR phone LIKE ? OR education LIKE ?)');
      for (let i = 0; i < 4; i++) params.push(`%${q}%`);
    }
    if (skills) {
      const tokens = skills.split(',').map((s) => s.trim()).filter(Boolean);
      for (const token of tokens) {
        where.push('skills LIKE ?');
        params.push(`%${token}%`);
      }
    }
    const sql = `SELECT * FROM resumes ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY created_at DESC`;
    try {
      const [rows] = await db.query(sql, params);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
);

module.exports = router;
