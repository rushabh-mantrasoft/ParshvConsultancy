'use client';

import { motion } from 'framer-motion';

const testimonials = [
  {
    quote:
      'Parshv delivered top-tier candidates within days. The process was smooth and highly professional.',
    name: 'A. Sharma',
    title: 'CTO, Fintech Co.',
  },
  {
    quote:
      'They truly understand our culture and hiring bar. Our acceptance rates improved significantly.',
    name: 'R. Mehta',
    title: 'Head of Talent, SaaS Startup',
  },
  {
    quote: 'Exceptional speed and quality. We scaled our engineering team ahead of schedule.',
    name: 'K. Iyer',
    title: 'VP Engineering, HealthTech',
  },
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Trusted by Leaders</h2>
          <p className="text-gray-600 mt-3">What our clients and candidates say about us.</p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.blockquote
              key={t.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-white p-6 shadow-sm"
            >
              <p className="text-gray-700">“{t.quote}”</p>
              <footer className="mt-4 text-sm text-gray-600">— {t.name}, {t.title}</footer>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

