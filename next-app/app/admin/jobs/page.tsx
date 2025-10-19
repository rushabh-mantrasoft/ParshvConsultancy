"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";

type JobPayload = {
  title: string;
  description: string;
  location: string;
  salary?: string;
};

type Job = JobPayload & { id: number };

const jobsEndpoint = `/api/jobs`;

export default function AdminJobsPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  const [form, setForm] = useState<JobPayload>({
    title: "",
    description: "",
    location: "",
    salary: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState<boolean>(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<JobPayload>({
    title: "",
    description: "",
    location: "",
    salary: "",
  });

  useEffect(() => {
    const t = localStorage.getItem("admin_token");
    if (!t) {
      router.push("/admin/login");
      return;
    }
    setToken(t);
  }, [router]);

  // Authorization header is handled by the API client via localStorage token

  const fetchJobs = async () => {
    setLoadingJobs(true);
    try {
      const data = await apiGet<Job[]>(jobsEndpoint);
      setJobs(data);
    } catch (e: any) {
      setError(e.message ?? "Unable to load jobs");
    } finally {
      setLoadingJobs(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

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
      setError("Please fill in title, description, and location.");
      return;
    }
    if (!token) {
      router.push("/admin/login");
      return;
    }

    setSubmitting(true);
    try {
      await apiPost(jobsEndpoint, {
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        salary: form.salary?.trim() || undefined,
      });

      setMessage("Job created successfully. It is now visible on the Jobs page.");
      setForm({ title: "", description: "", location: "", salary: "" });
      await fetchJobs();
    } catch (err: any) {
      setError(err.message ?? "Unable to create job");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (job: Job) => {
    setEditId(job.id);
    setEditForm({
      title: job.title,
      description: job.description,
      location: job.location,
      salary: job.salary || "",
    });
  };

  const cancelEdit = () => {
    setEditId(null);
  };

  const saveEdit = async (id: number) => {
    if (!token) return router.push("/admin/login");
    try {
      await apiPut(`${jobsEndpoint}/${id}`, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        location: editForm.location.trim(),
        salary: editForm.salary?.trim() || undefined,
      });
      setMessage("Job updated.");
      setEditId(null);
      await fetchJobs();
    } catch (e: any) {
      setError(e.message ?? "Unable to update job");
    }
  };

  const deleteJob = async (id: number) => {
    if (!token) return router.push("/admin/login");
    if (!confirm("Delete this job?")) return;
    try {
      await apiDelete(`${jobsEndpoint}/${id}`);
      setMessage("Job deleted.");
      await fetchJobs();
    } catch (e: any) {
      setError(e.message ?? "Unable to delete job");
    }
  };

  const logout = () => {
    localStorage.removeItem("admin_token");
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Admin: Jobs</h1>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
        </div>

        {message && (
          <div className="mb-4 p-4 rounded bg-green-50 text-green-700 border border-green-200">{message}</div>
        )}
        {error && (
          <div className="mb-4 p-4 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form onSubmit={onSubmit} className="space-y-4 bg-white p-6 rounded shadow">
            <h2 className="text-xl font-semibold">Add Job</h2>
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
                {submitting ? "Creating..." : "Create Job"}
              </button>
            </div>
          </form>

          <div className="bg-white p-6 rounded shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">All Jobs</h2>
              {loadingJobs && <span className="text-sm text-gray-500">Loading...</span>}
            </div>
            <div className="divide-y">
              {!loadingJobs && jobs.length === 0 && (
                <p className="text-gray-500">No jobs available.</p>
              )}
              {jobs.map((job) => (
                <div key={job.id} className="py-4">
                  {editId === job.id ? (
                    <div className="space-y-2">
                      <input
                        className="w-full rounded border-gray-300"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      />
                      <textarea
                        className="w-full rounded border-gray-300"
                        rows={4}
                        value={editForm.description}
                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <input
                          className="w-full rounded border-gray-300"
                          value={editForm.location}
                          onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                        />
                        <input
                          className="w-full rounded border-gray-300"
                          placeholder="Salary (optional)"
                          value={editForm.salary}
                          onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })}
                        />
                      </div>
                      <div className="space-x-2">
                        <button className="px-3 py-1 rounded bg-primary text-white" onClick={() => saveEdit(job.id)}>Save</button>
                        <button className="px-3 py-1 rounded border" onClick={cancelEdit}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-gray-600 line-clamp-2">{job.description}</p>
                        <p className="text-sm text-gray-500 mt-1">{job.location} {job.salary ? `• ${job.salary}` : ''}</p>
                      </div>
                      <div className="shrink-0 space-x-2">
                        <button className="px-3 py-1 rounded border" onClick={() => startEdit(job)}>Edit</button>
                        <button className="px-3 py-1 rounded border border-red-300 text-red-600" onClick={() => deleteJob(job.id)}>Delete</button>
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
