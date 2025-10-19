import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Parshv Consultancy
        </Link>
        <nav className="space-x-4">
          <Link href="/" className="text-gray-700 hover:text-primary">Home</Link>
          <Link href="/about" className="text-gray-700 hover:text-primary">About</Link>
          <Link href="/blog" className="text-gray-700 hover:text-primary">Blog</Link>
          <Link href="/jobs" className="text-gray-700 hover:text-primary">Jobs</Link>
          <Link href="/contact" className="text-gray-700 hover:text-primary">Contact</Link>
          <Link href="/admin/jobs" className="text-gray-700 hover:text-primary">Admin</Link>
        </nav>
      </div>
    </header>
  );
}
