import Link from 'next/link';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-white/70 bg-white/80 border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
          Parshv Consultancy
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-gray-700 hover:text-primary">Home</Link>
          <Link href="/about" className="text-gray-700 hover:text-primary">About</Link>
          <Link href="/blog" className="text-gray-700 hover:text-primary">Blog</Link>
          <Link href="/jobs" className="text-gray-700 hover:text-primary">Jobs</Link>
          <Link href="/contact" className="text-gray-700 hover:text-primary">Contact</Link>
          <Link href="/admin/jobs" className="text-gray-700 hover:text-primary">Admin</Link>
        </nav>
        <Link href="/contact" className="ml-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-primary to-secondary shadow hover:opacity-95">
          Hire Talent
        </Link>
      </div>
    </header>
  );
}
