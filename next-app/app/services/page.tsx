"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';

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

const steps = [
  { title: 'Discovery', desc: 'We define goals, role specs, and success criteria.' },
  { title: 'Sourcing', desc: 'Targeted outreach through networks and platforms.' },
  { title: 'Assessment', desc: 'Structured interviews and skill verification.' },
  { title: 'Shortlist', desc: 'Curated candidates aligned to your bar.' },
  { title: 'Offer & Close', desc: 'Compensation guidance and acceptance support.' },
];

export default function ServicesPage() {
  return (
    <div className="bg-white dark:bg-gray-950">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
        <div className="container mx-auto px-4 py-20 text-white">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Recruitment Services</h1>
          <p className="mt-3 max-w-2xl text-white/90">Flexible, high-quality hiring solutions across leadership, technology, and business functions.</p>
          <div className="mt-6">
            <Link href="/contact" className="inline-flex items-center rounded-full bg-white px-5 py-2 text-gray-900 font-semibold shadow hover:opacity-95">Talk to us</Link>
          </div>
        </div>
      </section>

      {/* Offerings */}
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

      {/* Process */}
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

      {/* CTA */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="relative overflow-hidden rounded-2xl p-10 bg-gradient-to-r from-primary to-secondary text-white shadow">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Let’s build your hiring plan</h3>
            <p className="mt-2 text-white/90 max-w-2xl">Tell us about your goals and timelines—we’ll tailor a plan to fit.</p>
            <div className="mt-6">
              <Link href="/contact" className="inline-flex items-center rounded-full bg-white px-5 py-2 text-gray-900 font-semibold shadow hover:opacity-95">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
