'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function CTA() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-2xl p-10 bg-gradient-to-r from-primary to-secondary text-white shadow"
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <h3 className="text-2xl md:text-3xl font-extrabold tracking-tight">Ready to build your dream team?</h3>
          <p className="mt-2 text-white/90 max-w-2xl">Partner with us to access pre-vetted, high-caliber candidates matched to your exact requirements.</p>
          <div className="mt-6">
            <Link href="/contact" className="inline-flex items-center rounded-full bg-white px-5 py-2 text-gray-900 font-semibold shadow hover:opacity-95">Talk to us</Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

