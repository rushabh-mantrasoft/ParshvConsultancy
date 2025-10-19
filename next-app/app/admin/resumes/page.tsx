'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

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
    void fetchResumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchResumes = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiGet<Resume[]>('/api/resumes');
      setResumes(data);
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
    if (!form.candidate_name || !form.email || !form.phone || !form.file) {
      setError('Name, email, phone, and resume file are required');
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
      await fetchResumes();
    } catch (e: any) {
      setError(e.message ?? 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (skillQuery) params.set('skills', skillQuery);
      const data = await apiGet<Resume[]>(`/api/resumes/search?${params.toString()}`);
      setResumes(data);
    } catch (e: any) {
      setError(e.message ?? 'Search failed');
    }
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
      await fetchResumes();
    } catch (e: any) {
      setError(e.message ?? 'Update failed');
    }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this resume?')) return;
    try {
      await apiDelete(`/api/resumes/${id}`);
      setMessage('Resume deleted');
      await fetchResumes();
    } catch (e: any) {
      setError(e.message ?? 'Delete failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

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

        {/* Search */}
        <form onSubmit={onSearch} className="mb-6 grid grid-cols-1 md:grid-cols-6 gap-3 bg-white dark:bg-gray-900 border dark:border-white/10 p-4 rounded">
          <input className="md:col-span-3 rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" placeholder="Search text (name, email, education)" value={q} onChange={(e) => setQ(e.target.value)} />
          <input className="md:col-span-2 rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" placeholder="Skills (comma separated)" value={skillQuery} onChange={(e) => setSkillQuery(e.target.value)} />
          <button className="md:col-span-1 rounded bg-primary text-white px-4 py-2">Search</button>
        </form>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upload form */}
          <form onSubmit={onUpload} className="space-y-3 bg-white dark:bg-gray-900 border dark:border-white/10 p-6 rounded">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upload Resume</h2>
            <input placeholder="Candidate name" className="w-full rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={form.candidate_name} onChange={(e) => setForm({ ...form, candidate_name: e.target.value })} required />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <input placeholder="Email" type="email" className="w-full rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <input placeholder="Phone" className="w-full rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            </div>
            <input placeholder="Skills (comma separated)" className="w-full rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
            <input placeholder="Education" className="w-full rounded border-gray-300 dark:bg-gray-950 dark:border-white/10" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
            <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />
            <button disabled={uploading} className="rounded bg-primary text-white px-4 py-2">{uploading ? 'Uploading...' : 'Upload'}</button>
          </form>

          {/* List */}
          <div className="bg-white dark:bg-gray-900 border dark:border-white/10 p-6 rounded">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">All Resumes</h2>
              {loading && <span className="text-sm text-gray-500">Loading...</span>}
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
                        {r.education && <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Education: {r.education}</div>}
                        {r.skills && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {r.skills.split(',').map((s) => (
                              <span key={s} className="text-xs rounded-full px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border dark:border-white/10">{s.trim()}</span>
                            ))}
                          </div>
                        )}
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
          </div>
        </div>
      </div>
    </div>
  );
}

