'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Blog {
  id: number;
  title: string;
  excerpt: string;
  published_at: string;
}

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch('/api/blogs');
        if (!res.ok) {
          throw new Error('Failed to fetch blogs');
        }
        const data = await res.json();
        setBlogs(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchBlogs();
  }, []);

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900 dark:text-gray-100">Latest Insights</h2>
        {loading && <p className="text-center text-gray-500">Loading posts...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <motion.article
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group overflow-hidden rounded-xl border bg-white dark:bg-gray-900 dark:border-white/10 hover:shadow-lg transition"
              >
                <div className="relative h-36 bg-gradient-to-br from-primary/10 to-secondary/10">
                  <div className="absolute top-3 left-3 rounded-full bg-white/90 dark:bg-gray-800/90 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-200 shadow">
                    {new Date(blog.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-primary transition">{blog.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{blog.excerpt}</p>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(blog.published_at).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </div>
                </div>
              </motion.article>
            ))}
            {blogs.length === 0 && <p className="text-center col-span-full text-gray-500">No blog posts found.</p>}
          </div>
        )}
      </div>
    </section>
  );
}

