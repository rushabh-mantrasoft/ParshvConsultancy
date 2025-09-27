import { motion } from 'framer-motion';
import Link from 'next/link';

export default function Hero() {
  return (
    <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-4xl md:text-5xl font-bold mb-4"
        >
          Connecting Talent with Opportunities
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
        >
          At Parshv Consultancy, we help businesses find the right people and individuals find the right careers.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex flex-col sm:flex-row justify-center gap-4"
        >
          <Link
            href="/jobs"
            className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            For Companies
          </Link>
          <Link
            href="/jobs"
            className="px-6 py-3 bg-white text-primary font-semibold rounded-lg hover:bg-gray-100 transition"
          >
            For Candidates
          </Link>
        </motion.div>
      </div>
    </section>
  );
}