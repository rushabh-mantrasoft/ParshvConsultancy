'use client';

import { motion } from 'framer-motion';

export default function AboutSection() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <motion.h2
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-3xl md:text-4xl font-bold mb-4 text-center"
        >
          About Us
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          className="text-center text-gray-600 max-w-2xl mx-auto"
        >
          Parshv Consultancy is dedicated to bridging the gap between employers and job seekers mainly in Computer and Finance field. With a focus on integrity and efficiency, we deliver recruitment solutions that meet the unique needs of each client. Our team combines industry expertise with a people‑first approach to ensure success for both companies and candidates.
        </motion.p>
      </div>
    </section>
  );
}