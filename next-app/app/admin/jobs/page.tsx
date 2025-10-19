'use client';

import { useState } from 'react';

type JobPayload = {
  title: string;
  description: string;
  location: string;
  salary?: string;
};

const API_BASE_URL = (() => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
  return base.endsWith('/') ? base.slice(0, -1) : base;
})();

const jobsEndpoint = `${API_BASE_URL}/api/jobs`;

export default function AdminJobsPage() {
  const [form, setForm] = useState<JobPayload>({
    title: '',
    description: '',
    location: '',
    salary: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!form.title.trim() || !form.description.trim() || !form.location.trim()) {
      setError('Please fill in title, description, and location.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(jobsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          salary: form.salary?.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || 'Failed to create job');
      }

      setMessage('Job created successfully. It is now visible on the Jobs page.');
      setForm({ title: '', description: '', location: '', salary: '' });
    } catch (err: any) {
      setError(err.message ?? 'Unable to create job');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Admin: Add Job</h1>

        {message && (
          <div className="mb-4 p-4 rounded bg-green-50 text-green-700 border border-green-200">
            {message}
          </div>
        )}
        {error && (
          <div className="mb-4 p-4 rounded bg-red-50 text-red-700 border border-red-200">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded shadow">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={onChange}
              className="mt-1 block w-full rounded border-gray-300 focus:border-primary focus:ring-primary"
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              rows={6}
              value={form.description}
              onChange={onChange}
              className="mt-1 block w-full rounded border-gray-300 focus:border-primary focus:ring-primary"
              placeholder="Role overview, responsibilities, requirements..."
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={onChange}
                className="mt-1 block w-full rounded border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="e.g., Mumbai, IN or Remote"
                required
              />
            </div>
            <div>
              <label htmlFor="salary" className="block text-sm font-medium text-gray-700">Salary (optional)</label>
              <input
                id="salary"
                name="salary"
                type="text"
                value={form.salary}
                onChange={onChange}
                className="mt-1 block w-full rounded border-gray-300 focus:border-primary focus:ring-primary"
                placeholder="e.g., ₹12–15 LPA"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center px-4 py-2 rounded bg-primary text-white hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? 'Creating...' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

