'use client';

import { motion } from 'framer-motion';

const stats = [
  { label: 'Candidates Placed', value: '1,200+' },
  { label: 'Client Companies', value: '150+' },
  { label: 'Avg. Time to Hire', value: '14 days' },
  { label: 'Offer Acceptance', value: '92%' },
];

export default function Stats() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary/5 to-secondary/5">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="rounded-lg bg-white p-6 text-center shadow-sm border"
            >
              <div className="text-2xl font-extrabold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-600 mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

