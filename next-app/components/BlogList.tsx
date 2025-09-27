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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">Our Blog</h2>
        {loading && <p className="text-center text-gray-500">Loading posts…</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        {!loading && !error && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {blogs.map((blog) => (
              <motion.div
                key={blog.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="p-6 bg-gray-50 rounded-lg shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{blog.excerpt}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(blog.published_at).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </motion.div>
            ))}
            {blogs.length === 0 && <p className="text-center col-span-full text-gray-500">No blog posts found.</p>}
          </div>
        )}
      </div>
    </section>
  );
}