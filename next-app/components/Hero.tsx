'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-primary via-primary/80 to-secondary" />
      <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

      <div className="container mx-auto px-4 py-24 text-center text-white">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4"
        >
          Hire Faster. Grow Smarter.
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-lg md:text-2xl mb-10 max-w-3xl mx-auto text-white/90"
        >
          We connect ambitious companies with exceptional talent across technology and business functions.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            href="/contact"
            className="px-6 py-3 rounded-full bg-white text-gray-900 font-semibold shadow hover:opacity-95"
          >
            Hire Talent
          </Link>
          <Link
            href="/jobs"
            className="px-6 py-3 rounded-full border border-white/60 text-white hover:bg-white/10"
          >
            Explore Jobs
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
