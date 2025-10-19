"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ServicesHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
      <div className="container mx-auto px-4 py-20 text-white">
        <motion.h1
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold tracking-tight"
        >
          Recruitment Services
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mt-3 max-w-2xl text-white/90"
        >
          Flexible, high-quality hiring solutions across leadership, technology, and business functions.
        </motion.p>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6">
          <Link href="/contact" className="inline-flex items-center rounded-full bg-white px-5 py-2 text-gray-900 font-semibold shadow hover:opacity-95">Talk to us</Link>
        </motion.div>
      </div>
    </section>
  );
}

