'use client';

import { useEffect, useState, useRef } from 'react';
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
  
  const clearSearch = async () => {
    setQ('');
    setSkillQuery('');
    setOffset(0);
    await fetchResumes(true);
  };

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
  // bulk upload progress
  const [bulkUploading, setBulkUploading] = useState(false);
  const [bulkProcessed, setBulkProcessed] = useState(0);
  const [bulkUploaded, setBulkUploaded] = useState(0);
  const [bulkSkipped, setBulkSkipped] = useState(0);
  const [bulkFailed, setBulkFailed] = useState(0);
  const [bulkQueue, setBulkQueue] = useState<File[]>([]);
  const bulkQueueRef = useRef<File[]>([]);
  const [bulkIndex, setBulkIndex] = useState(0);
  const [bulkModalOpen, setBulkModalOpen] = useState(false);
  const [bulkParsing, setBulkParsing] = useState(false);
  const [bulkCurrentFile, setBulkCurrentFile] = useState<File | null>(null);
  const [bulkForm, setBulkForm] = useState({
    candidate_name: '',
    email: '',
    phone: '',
    skills: '',
    education: '',
  });

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

  // Bulk flow helpers
  const loadPreviewIntoBulkForm = async (file: File) => {
    setBulkParsing(true);
    try {
      const fdPrev = new FormData();
      fdPrev.append('resume', file);
      const preview = await apiPost<{
        candidate_name: string; email: string; phone: string; skills: string; education: string;
      }>('/api/resumes/preview', fdPrev);
      setBulkForm({
        candidate_name: preview?.candidate_name || '',
        email: preview?.email || '',
        phone: preview?.phone || '',
        skills: preview?.skills || '',
        education: preview?.education || '',
      });
    } catch {
      setBulkForm({ candidate_name: '', email: '', phone: '', skills: '', education: '' });
    } finally {
      setBulkParsing(false);
    }
  };

  const processNextBulk = async (idx: number) => {
    const queue = bulkQueueRef.current;
    if (idx >= queue.length) {
      // done
      setBulkUploading(false);
      await fetchResumes(true);
      setMessage(`Bulk upload finished. Uploaded: ${bulkUploaded} | Skipped: ${bulkSkipped} | Failed: ${bulkFailed}.`);
      return;
    }
    const file = queue[idx];
    setBulkIndex(idx);
    setBulkCurrentFile(file);
    await loadPreviewIntoBulkForm(file);
    setBulkModalOpen(true);
  };

  // Entry point: user selects multiple files
  const onBulkFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    setMessage(null);
    setBulkProcessed(0);
    setBulkUploaded(0);
    setBulkSkipped(0);
    setBulkFailed(0);
    const queue = Array.from(files);
    setBulkQueue(queue);
    bulkQueueRef.current = queue;
    setBulkUploading(true);
    await processNextBulk(0);
  };

  // Modal actions
  const submitBulkUpload = async () => {
    const file = bulkCurrentFile;
    if (!file) return;
    try {
      const fd = new FormData();
      if (bulkForm.candidate_name) fd.append('candidate_name', bulkForm.candidate_name);
      if (bulkForm.email) fd.append('email', bulkForm.email);
      if (bulkForm.phone) fd.append('phone', bulkForm.phone);
      if (bulkForm.skills) fd.append('skills', bulkForm.skills);
      if (bulkForm.education) fd.append('education', bulkForm.education);
      fd.append('resume', file);
      await apiPost('/api/resumes', fd);
      setBulkUploaded((v) => v + 1);
    } catch {
      setBulkFailed((v) => v + 1);
    } finally {
      setBulkProcessed((v) => v + 1);
      setBulkModalOpen(false);
      await processNextBulk(bulkIndex + 1);
    }
  };

  const skipBulkUpload = async () => {
    setBulkSkipped((v) => v + 1);
    setBulkProcessed((v) => v + 1);
    setBulkModalOpen(false);
    await processNextBulk(bulkIndex + 1);
  };

  const cancelBulkUpload = () => {
    setBulkModalOpen(false);
    setBulkUploading(false);
    setMessage(`Bulk upload cancelled. Processed: ${bulkProcessed}, Uploaded: ${bulkUploaded}, Skipped: ${bulkSkipped}, Failed: ${bulkFailed}.`);
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
          <div><h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">Admin: Resumes</h1><p className="text-sm text-gray-500 dark:text-gray-400">Upload, parse, search and manage candidate resumes.</p></div>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
        </div>

        <div className="mb-6 flex items-center gap-3">
          <Link href="/admin/jobs" className="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10">Jobs</Link>
          <Link href="/admin/resumes" className="inline-flex items-center gap-2 rounded-md bg-primary text-white px-3 py-1.5 text-sm shadow hover:opacity-95">Resumes</Link>
        </div>

        {message && <div className="mb-4 p-3 rounded bg-green-50 text-green-700 border border-green-200">{message}</div>}
        {error && <div className="mb-4 p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}

        {/* Sticky toolbar */}
        <div className="sticky top-16 z-20 mb-4">
          <div className="flex items-center gap-2 bg-white/90 dark:bg-gray-900/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 border dark:border-white/10 rounded-full px-3 py-2 shadow">
            <a href="#upload" className="text-sm px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10">Upload</a>
            <a href="#search" className="text-sm px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10">Search</a>
            <a href="#results" className="text-sm px-3 py-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10">Results</a>
          </div>
        </div>

        {/* Upload form (collapsible, full width) */}
        <div id="upload" className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-900 shadow-sm mb-6 scroll-mt-24">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-white/10">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Upload Resume</h2>
            <button
              type="button"
              onClick={() => { setUploadOpen((v) => { const nv = !v; try { localStorage.setItem('admin_upload_open', nv ? '1' : '0'); } catch {}; return nv; }); }}
              className="inline-flex items-center gap-2 rounded-md border border-black/10 dark:border-white/10 px-3 py-1.5 text-sm hover:bg-black/5 dark:hover:bg-white/10"
            >
              {uploadOpen ? 'Hide' : 'Show'}
            </button>
          </div>
          {uploadOpen && (
            <form onSubmit={onUpload} className="px-6 py-5 grid gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Leave fields blank to auto-fill using the resume parser.</p>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Candidate name</label>
          <input placeholder="e.g., Priya Sharma" className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={form.candidate_name} onChange={(e) => setForm({ ...form, candidate_name: e.target.value })} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input placeholder="name@company.com" type="email" className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input placeholder="+91 98765 43210" className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          </div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Skills</label>
          <input placeholder="comma separated (auto-filled on preview)" className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} />
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Education</label>
          <input placeholder="e.g., B.Tech, IIT Bombay (2018)" className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={form.education} onChange={(e) => setForm({ ...form, education: e.target.value })} />
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Resume file (PDF/DOC/DOCX)</label>
          <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={(e) => setForm({ ...form, file: e.target.files?.[0] || null })} />

          {/* Bulk upload (multiple files) */}
          <div className="mt-3 grid gap-2">
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Bulk upload (multiple files)</label>
            <input
              id="bulkInput"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => onBulkFilesSelected(e.target.files)}
              className="hidden"
            />
            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={bulkUploading}
                onClick={() => document.getElementById('bulkInput')?.click()}
                className="rounded border dark:border-white/10 px-4 py-2 text-sm"
              >
                {bulkUploading ? 'Processing�' : 'Select Multiple Resumes'}
              </button>
              {bulkUploading && (
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  Processed: {bulkProcessed} � Uploaded: {bulkUploaded} � Skipped: {bulkSkipped} � Failed: {bulkFailed}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" onClick={onPreview} disabled={previewing || !form.file} className="rounded border dark:border-white/10 px-4 py-2">
              {previewing ? 'Parsing...' : 'Parse & Preview'}
            </button>
            <button disabled={uploading} className="rounded bg-primary text-white px-4 py-2">{uploading ? 'Saving...' : 'Save Resume'}</button>
          </div>
            </form>
          )}
        </div>

        {/* Bulk confirmation modal */}
        {bulkModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={cancelBulkUpload} />
            <div className="relative z-10 w-[95vw] max-w-2xl rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 shadow-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Confirm Resume Upload</h3>
                <button className="text-sm text-gray-500 hover:underline" onClick={cancelBulkUpload}>Cancel all</button>
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400 mb-3">
                {bulkCurrentFile ? `File ${bulkIndex + 1} of ${bulkQueue.length}: ${bulkCurrentFile.name}` : ''}
              </div>
              <div className="grid gap-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Candidate name</label>
                    <input className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={bulkForm.candidate_name} onChange={(e) => setBulkForm({ ...bulkForm, candidate_name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={bulkForm.email} onChange={(e) => setBulkForm({ ...bulkForm, email: e.target.value })} />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                    <input className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={bulkForm.phone} onChange={(e) => setBulkForm({ ...bulkForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Education</label>
                    <input className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={bulkForm.education} onChange={(e) => setBulkForm({ ...bulkForm, education: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Skills (comma separated)</label>
                  <input className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={bulkForm.skills} onChange={(e) => setBulkForm({ ...bulkForm, skills: e.target.value })} />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {bulkParsing ? 'Parsing�' : 'Review and confirm to upload.'}
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" className="rounded-md border dark:border-white/10 px-3 py-1.5 text-sm" onClick={skipBulkUpload}>Skip</button>
                  <button type="button" className="rounded-md bg-primary text-white px-3 py-1.5 text-sm" onClick={submitBulkUpload} disabled={bulkParsing}>Upload</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search */}
        <form
          id="search"
          onSubmit={onSearch}
          className="mb-6 bg-white dark:bg-gray-900 border dark:border-white/10 p-4 rounded-xl shadow-sm scroll-mt-24"
        >
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Text search */}
            <div className="relative flex-1">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                {/* search icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              </span>
              <input
                className="w-full rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                placeholder="Search name, email, education"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            {/* Skills */}
            <div className="relative md:w-80">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                {/* tag icon */}
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-70"><path d="M20.59 13.41L11 3.83a2 2 0 00-1.41-.58H4a2 2 0 00-2 2v5.59a2 2 0 00.59 1.41l9.59 9.59a2 2 0 002.83 0l5.59-5.59a2 2 0 000-2.83z"></path><circle cx="7" cy="7" r="1"></circle></svg>
              </span>
              <input
                className="w-full rounded-full border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 pl-10 pr-4 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
                placeholder="Skills (comma separated)"
                value={skillQuery}
                onChange={(e) => setSkillQuery(e.target.value)}
              />
            </div>
            {/* Actions */}
            <div className="flex gap-2 md:ml-auto">
              <button className="rounded-full bg-primary text-white px-5 py-2 text-sm shadow hover:opacity-95">Search</button>
              <button type="button" onClick={clearSearch} className="rounded-full border border-black/10 dark:border-white/10 px-5 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/10">Clear</button>
            </div>
          </div>
          {(q || skillQuery) && (
            <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              Active filters: {q && <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 border dark:border-white/10 mr-2">text: "{q}"</span>}
              {skillQuery && <span className="rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 border dark:border-white/10">skills: "{skillQuery}"</span>}
            </div>
          )}
        </form>

        {/* List (full width) */}
        <div id="results" className="bg-white dark:bg-gray-900 border dark:border-white/10 p-6 rounded-xl shadow-sm scroll-mt-24">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">All Resumes</h2>
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {typeof total === 'number' && (
                <span className="rounded-full border dark:border-white/10 px-2 py-0.5">{resumes.length} / {total}</span>
              )}
              {loading && <span className="ml-2">Loading�</span>}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {!loading && resumes.length === 0 && (
              <p className="text-gray-500">No resumes found.</p>
            )}
            {resumes.map((r) => (
              <div key={r.id} className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 p-4 shadow-sm hover:shadow transition">
                {editId === r.id ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={editForm.candidate_name} onChange={(e) => setEditForm({ ...editForm, candidate_name: e.target.value })} />
                      <input className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <input className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
                      <input className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" value={editForm.education} onChange={(e) => setEditForm({ ...editForm, education: e.target.value })} />
                    </div>
                    <input className="w-full rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-gray-950 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" placeholder="Skills" value={editForm.skills} onChange={(e) => setEditForm({ ...editForm, skills: e.target.value })} />
                    <div className="flex gap-2">
                      <button className="px-3 py-1.5 rounded-md bg-primary text-white text-sm" onClick={() => saveEdit(r.id)}>Save</button>
                      <button className="px-3 py-1.5 rounded-md border dark:border-white/10 text-sm" onClick={() => setEditId(null)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-gray-900 dark:text-gray-100 truncate max-w-[60vw] md:max-w-none">{r.candidate_name}</div>
                        <a href={`${API_BASE_URL}/uploads/${r.resume_path}`} target="_blank" rel="noreferrer" className="text-xs rounded-full border dark:border-white/10 px-2 py-0.5 text-primary hover:bg-primary/5">Download</a>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 border dark:border-white/10">
                          {/* mail icon */}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16v16H4z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                          {r.email}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 dark:bg-gray-800 px-2 py-0.5 border dark:border-white/10">
                          {/* phone icon */}
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.89.33 1.76.61 2.6a2 2 0 0 1-.45 2.11L8 9a16 16 0 0 0 7 7l.57-1.31a2 2 0 0 1 2.11-.45c.84.28 1.71.49 2.6.61A2 2 0 0 1 22 16.92z"></path></svg>
                          {r.phone}
                        </span>
                      </div>
                      {r.education && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
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
                          <div className="mt-3 flex flex-wrap gap-2">
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
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <button className="px-3 py-1.5 rounded-md border dark:border-white/10 text-sm" onClick={() => startEdit(r)}>Edit</button>
                      <button className="px-3 py-1.5 rounded-md border border-red-300 text-red-600 text-sm" onClick={() => remove(r.id)}>Delete</button>
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





