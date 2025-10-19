"use client";

import { motion } from 'framer-motion';

const steps = [
  { title: 'Discovery', desc: 'We define goals, role specs, and success criteria.' },
  { title: 'Sourcing', desc: 'Targeted outreach through networks and platforms.' },
  { title: 'Assessment', desc: 'Structured interviews and skill verification.' },
  { title: 'Shortlist', desc: 'Curated candidates aligned to your bar.' },
  { title: 'Offer & Close', desc: 'Compensation guidance and acceptance support.' },
];

export default function ServicesProcess() {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">How We Hire</h2>
        <div className="grid gap-6 md:grid-cols-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-white dark:bg-gray-950 dark:border-white/10 p-5 shadow-sm"
            >
              <div className="text-sm font-semibold text-primary">Step {i + 1}</div>
              <div className="font-semibold text-gray-900 dark:text-gray-100">{s.title}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{s.desc}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

