'use client';

import { motion } from 'framer-motion';

const services = [
  {
    title: 'Executive Search',
    desc: 'Targeted leadership hiring for high-impact roles.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5l9 4.5 9-4.5-9-4.5-9 4.5z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9 4.5 9-4.5M3 16.5l9 4.5 9-4.5" />
      </svg>
    ),
  },
  {
    title: 'IT Recruitment',
    desc: 'Engineering, data, and product talent at scale.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h6M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Contract Staffing',
    desc: 'Flexible workforce solutions for fast-moving teams.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h10M7 11h10M7 15h6" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H8L5 6v13a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'HR Advisory',
    desc: 'Compensation, org design, and talent strategy.',
    icon: (
      <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 22a10 10 0 110-20 10 10 0 010 20z" />
      </svg>
    ),
  },
];

export default function Services() {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">What We Do</h2>
          <p className="text-gray-600 mt-3">End-to-end recruitment built for speed and quality.</p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border bg-white p-6 shadow-sm hover:shadow-md transition"
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 text-primary mb-4">
                {s.icon}
              </div>
              <h3 className="font-semibold text-lg mb-1">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

