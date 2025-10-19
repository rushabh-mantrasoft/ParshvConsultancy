"use client";

import Link from 'next/link';
import { useState } from 'react';
import ThemeToggle from '@/components/ThemeToggle';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 dark:bg-gray-900/80 border-b dark:border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Parshv Consultancy
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-700 dark:text-gray-200 hover:text-primary">Home</Link>
          <Link href="/services" className="text-gray-700 dark:text-gray-200 hover:text-primary">Services</Link>
          <Link href="/about" className="text-gray-700 dark:text-gray-200 hover:text-primary">About</Link>
          <Link href="/blog" className="text-gray-700 dark:text-gray-200 hover:text-primary">Blog</Link>
          <Link href="/jobs" className="text-gray-700 dark:text-gray-200 hover:text-primary">Jobs</Link>
          <Link href="/contact" className="text-gray-700 dark:text-gray-200 hover:text-primary">Contact</Link>
          <Link href="/admin/jobs" className="text-gray-700 dark:text-gray-200 hover:text-primary">Admin</Link>
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link href="/contact" className="hidden sm:inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary shadow hover:opacity-95">
            Hire Talent
          </Link>
          <button className="md:hidden inline-flex items-center justify-center rounded p-2 border border-black/10 dark:border-white/20" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              {open ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t dark:border-white/10 bg-white/95 dark:bg-gray-900/95">
          <div className="container mx-auto px-4 py-4 grid gap-3">
            <Link href="/" className="text-gray-800 dark:text-gray-100" onClick={() => setOpen(false)}>Home</Link>
            <Link href="/services" className="text-gray-800 dark:text-gray-100" onClick={() => setOpen(false)}>Services</Link>
            <Link href="/about" className="text-gray-800 dark:text-gray-100" onClick={() => setOpen(false)}>About</Link>
            <Link href="/blog" className="text-gray-800 dark:text-gray-100" onClick={() => setOpen(false)}>Blog</Link>
            <Link href="/jobs" className="text-gray-800 dark:text-gray-100" onClick={() => setOpen(false)}>Jobs</Link>
            <Link href="/contact" className="text-gray-800 dark:text-gray-100" onClick={() => setOpen(false)}>Contact</Link>
            <Link href="/admin/jobs" className="text-gray-800 dark:text-gray-100" onClick={() => setOpen(false)}>Admin</Link>
            <Link href="/contact" className="inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary shadow hover:opacity-95" onClick={() => setOpen(false)}>
              Hire Talent
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
