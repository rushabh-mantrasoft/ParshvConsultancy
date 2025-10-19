'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPost, apiPut, apiDelete, apiGetWithHeaders } from '@/lib/api';

type Resume = {
  id: number;
  candidate_name: string;
  email: string;
  phone: string;
  skills?: string;
  education?: string;
  resume_path: string;
  created_at?: string;
};

const API_BASE_URL = (() => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
  return base.endsWith('/') ? base.slice(0, -1) : base;
})();

export default function AdminResumesPage() {
  const router = useRouter();

  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // search
  const [q, setQ] = useState('');
  const [skillQuery, setSkillQuery] = useState('');
  const PAGE_SIZE = 20;
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState<number | null>(null);
  const [uploadOpen, setUploadOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try { const v = localStorage.getItem('admin_upload_open'); return v ? v === '1' : true; } catch { return true; }
  });
  const [expSkills, setExpSkills] = useState<Record<number, boolean>>({});
  const [expEdu, setExpEdu] = useState<Record<number, boolean>>({});

  // upload form
  const [form, setForm] = useState({
    candidate_name: '',
    email: '',
    phone: '',
    skills: '',
    education: '',
    file: null as File | null,
  });
  const [uploading, setUploading] = useState(false);
  const [previewing, setPreviewing] = useState(false);

  // edit
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    candidate_name: '',
    email: '',
    phone: '',
    skills: '',
    education: '',
  });

  // auth check
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;
    if (!t) {
      router.push('/admin/login');
      return;
    }
    void fetchResumes(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchResumes = async (reset = false) => {
    setLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set('limit', String(PAGE_SIZE));
      qs.set('offset', String(reset ? 0 : offset));
      const base = q || skillQuery ? '/api/resumes/search' : '/api/resumes';
      if (q) qs.set('q', q);
      if (skillQuery) qs.set('skills', skillQuery);
      const { data, headers } = await apiGetWithHeaders<Resume[]>(`${base}?${qs.toString()}`);
      setResumes((prev) => (reset ? data : [...prev, ...data]));
      setHasMore(data.length === PAGE_SIZE);
      setOffset((prev) => (reset ? data.length : prev + data.length));
      const t = headers.get('X-Total-Count');
      if (t) setTotal(parseInt(t, 10));
    } catch (e: any) {
      setError(e.message ?? 'Failed to load resumes');
    } finally {
      setLoading(false);
    }
  };

  const onUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    if (!form.file) {
      setError('Please choose a resume file to upload');
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('candidate_name', form.candidate_name);
      fd.append('email', form.email);
      fd.append('phone', form.phone);
      if (form.skills) fd.append('skills', form.skills);
      if (form.education) fd.append('education', form.education);
      fd.append('resume', form.file);
      await apiPost('/api/resumes', fd);
      setMessage('Resume uploaded');
      setForm({ candidate_name: '', email: '', phone: '', skills: '', education: '', file: null });
      await fetchResumes(true);
    } catch (e: any) {
      setError(e.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onPreview = async () => {
    setError(null);
    setMessage(null);
    if (!form.file) {
      setError('Please choose a resume file to preview');
      return;
    }
    setPreviewing(true);
    try {
      const fd = new FormData();
      fd.append('resume', form.file);
      const data = await apiPost<{ candidate_name: string; email: string; phone: string; skills: string; education: string }>(
        '/api/resumes/preview',
        fd
      );
      setForm((prev) => ({
        ...prev,
        candidate_name: prev.candidate_name || data.candidate_name || '',
        email: prev.email || data.email || '',
        phone: prev.phone || data.phone || '',
        skills: prev.skills || data.skills || '',
        education: prev.education || data.education || '',
      }));
      setMessage('Parsed fields applied. Please review and click Save.');
    } catch (e: any) {
      setError(e.message ?? 'Preview failed');
    } finally {
      setPreviewing(false);
    }
  };

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setOffset(0);
    await fetchResumes(true);
  };

  const startEdit = (r: Resume) => {
    setEditId(r.id);
    setEditForm({
      candidate_name: r.candidate_name || '',
      email: r.email || '',
      phone: r.phone || '',
      skills: r.skills || '',
      education: r.education || '',
    });
  };

  const saveEdit = async (id: number) => {
    try {
      await apiPut(`/api/resumes/${id}`, editForm);
      setMessage('Resume updated');
      setEditId(null);
      await fetchResumes(true);
    } catch (e: any) {
      setError(e.message ?? 'Update failed');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await apiDelete(`/api/resumes/${id}`);
      setMessage('Resume deleted');
      await fetchResumes(true);
    } catch (e: any) {
      setError(e.message ?? 'Delete failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };
  
  // infinite scroll observer
  useEffect(() => {
    const el = document.getElementById('sentinel');
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      const entry = entries[0];
      if (entry.isIntersecting && hasMore && !loading) {
        fetchResumes(false);
      }
    }, { rootMargin: '200px' });
    obs.observe(el);
    return () => { obs.disconnect(); };
  }, [hasMore, loading, q, skillQuery, offset]);


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin: Resumes</h1>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin/jobs" className="text-sm px-3 py-1.5 rounded border dark:border-white/10">Jobs</Link>
          <Link href="/admin/resumes" className="text-sm px-3 py-1.5 rounded bg-primary text-white">Resumes</Link>
        </div>

        {message && <div className="mb-4 p-3 rounded bg-green-50 text-green-700 border border-green-200">{message}</div>}
        {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}

        {/* Upload form (collapsible, full width) */}
        <div className="bg-white dark:bg-gray-900 border dark:border-white/10 rounded mb-4">
          <div className="flex items-center justify-between px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upload Resume</h2>
            <button
              type="button"
              onClick={() => { setUploadOpen((v) => { const nv = !v; try { localStorage.setItem('admin_upload_open', nv ? '1' : '0'); } catch {}; return nv; }); }}
              className="text-sm underline"
            >
              {uploadOpen ? 'Hide' : 'Show'}
            </button>
          </div>
          {uploadOpen && (
            <form onSubmit={onUpload} className="space-y-3 px-6 pb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">Leave fields blank to auto-fill using the resume parser.</p>
          <input placeholder="Candidate name (optional)" className="w-full rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={form.candidate_name} onChange={(e) => setForm({ ...form, candidate_name: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input placeholder="Email (optional)" type="email" className="w-full rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            <input placeholder="Phone (optional)" className="w-full rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <input placeholder="Skills (comma separated, optional)" className="w-full rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <input placeholder="Education (optional)" className="w-full rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
          <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />
          <div className="flex items-center gap-3">
            <button type="button" onClick={onPreview} disabled={previewing || !form.file} className="rounded border dark:border-white/10 px-4 py-2">
              {previewing ? 'Parsing...' : 'Parse & Preview'}
            </button>
            <button disabled={uploading} className="rounded bg-primary text-white px-4 py-2">{uploading ? 'Saving...' : 'Save Resume'}</button>
          </div>
            </form>
          )}
        </div>

        {/* Search */}
        <form onSubmit={onSearch} className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-3 bg-white dark:bg-gray-900 border dark:border-white/10 p-4 rounded">
          <input className="md:col-span-3 rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" placeholder="Search text (name, email, education)" value={q} onChange={(e) => setQ(e.target.value)} />
          <input className="md:col-span-2 rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" placeholder="Skills (comma separated)" value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} />
          <button className="md:col-span-1 rounded bg-primary text-white px-4 py-2">Search</button>
        </form>

        {/* List (full width) */}
        <div className="bg-white dark:bg-gray-900 border dark:border-white/10 p-6 rounded">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">All Resumes</h2>
            <div className="text-sm text-gray-500">
              {typeof total === 'number' && (
                <span>Showing {resumes.length} of {total}</span>
              )}
              {loading && <span className="ml-3">Loading...</span>}
            </div>
          </div>
          <div className="divide-y dark:divide-white/10">
            {!loading && resumes.length === 0 && (
              <p className="text-gray-500">No resumes yet.</p>
            )}
            {resumes.map((r) => (
              <div key={r.id} className="py-4">
                {editId === r.id ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input className="rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={editForm.candidate_name} onChange={(e) => setEditForm({ ...editForm, candidate_name: e.target.value })} />
                      <input className="rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input className="rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                      <input className="rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={editForm.education} onChange={(e) => setEditForm({ ...editForm, education: e.target.value })} />
                    </div>
                    <input className="rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" placeholder="Skills" value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} />
                    <div className="space-x-2">
                      <button className="px-3 py-1 rounded bg-primary text-white" onClick={() => saveEdit(r.id)}>Save</button>
                      <button className="px-3 py-1 rounded border dark:border-white/10" onClick={() => setEditId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-gray-100">{r.candidate_name}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">{r.email} - {r.phone}</div>
                      {r.education && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className={expEdu[r.id] ? '' : 'line-clamp-2'}>Education: {r.education}</span>
                          {r.education.length > 160 && (
                            <button className="ml-2 text-primary underline text-xs" onClick={() => setExpEdu((m) => ({ ...m, [r.id]: !m[r.id] }))}>
                              {expEdu[r.id] ? 'Show less' : 'Show more'}
                            </button>
                          )}
                        </div>
                      )}
                      {r.skills && (() => {
                        const items = r.skills.split(',').map((s) => s.trim()).filter(Boolean);
                        const limit = 6;
                        const showAll = !!expSkills[r.id];
                        const visible = showAll ? items : items.slice(0, limit);
                        const hiddenCount = Math.max(items.length - visible.length, 0);
                        return (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {visible.map((s) => (
                              <span key={s} className="text-xs rounded-full px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border dark:border-white/10">{s}</span>
                            ))}
                            {hiddenCount > 0 && !showAll && (
                              <button className="text-xs underline text-primary" onClick={() => setExpSkills((m) => ({ ...m, [r.id]: true }))}>+{hiddenCount} more</button>
                            )}
                            {showAll && items.length > limit && (
                              <button className="text-xs underline text-primary" onClick={() => setExpSkills((m) => ({ ...m, [r.id]: false }))}>Show less</button>
                            )}
                          </div>
                        );
                      })()}
                      <div className="mt-2">
                        <a href={`${API_BASE_URL}/uploads/${r.resume_path}`} target="_blank" rel="noreferrer" className="text-sm text-primary underline">Download resume</a>
                      </div>
                    </div>
                    <div className="shrink-0 space-x-2">
                      <button className="px-3 py-1 rounded border dark:border-white/10" onClick={() => startEdit(r)}>Edit</button>
                      <button className="px-3 py-1 rounded border border-red-300 text-red-600" onClick={() => remove(r.id)}>Delete</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div id="sentinel" className="h-8" />
        </div>
      </div>
    </div>
  );
}

