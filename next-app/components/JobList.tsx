
'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { apiGet } from '@/lib/api';

interface Job {
  id: number;
  title: string;
  description: string;
  location: string;
  salary: string;
}

const jobsEndpoint = `/api/jobs`;

export default function JobList() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchJobs() {
      try {
        const data = await apiGet<Job[]>(jobsEndpoint);
        setJobs(data);
      } catch (err: any) {
        setError(err.message ?? 'Unable to load jobs');
      } finally {
        setLoading(false);
      }
    }
    fetchJobs();
  }, []);

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Latest Jobs</h2>
        {loading && <p className="text-center text-gray-500">Loading jobs...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold mb-2">{job.title}</h3>
                <p className="text-gray-600 mb-2 line-clamp-3">{job.description}</p>
                <p className="text-gray-500">{job.location}</p>
                {job.salary && <p className="text-gray-500">{job.salary}</p>}
              </motion.div>
            ))}
            {jobs.length === 0 && (
              <p className="text-center col-span-full text-gray-500">No jobs available at the moment.</p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
