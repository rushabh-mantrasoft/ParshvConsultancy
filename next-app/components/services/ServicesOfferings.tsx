"use client";

import { motion } from 'framer-motion';

const offerings = [
  {
    title: 'Executive Search',
    points: [
      'C-suite and senior leadership hires',
      'Rigorous market mapping and outreach',
      'Calibrated candidate assessments',
    ],
  },
  {
    title: 'Technology Hiring',
    points: [
      'Backend, frontend, full-stack engineers',
      'Data science, ML, analytics',
      'Product management, design, QA',
    ],
  },
  {
    title: 'Contract Staffing',
    points: [
      'Short and long-term assignments',
      'Rapid ramp-ups for projects',
      'Onsite, remote, or hybrid',
    ],
  },
  {
    title: 'HR Advisory',
    points: [
      'Compensation benchmarking',
      'Org design and leveling',
      'Employer branding',
    ],
  },
];

export default function ServicesOfferings() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">What We Offer</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {offerings.map((o, i) => (
            <motion.div
              key={o.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-white dark:bg-gray-900 dark:border-white/10 p-6 shadow-sm"
            >
              <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100 mb-3">{o.title}</h3>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                {o.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

