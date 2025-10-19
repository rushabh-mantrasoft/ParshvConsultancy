export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">Parshv Consultancy</h3>
          <p className="text-sm text-gray-400">Connecting talent with opportunity through modern, people-first recruitment.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><a className="hover:text-white" href="/about">About</a></li>
            <li><a className="hover:text-white" href="/blog">Blog</a></li>
            <li><a className="hover:text-white" href="/jobs">Jobs</a></li>
            <li><a className="hover:text-white" href="/contact">Contact</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Services</h4>
          <ul className="space-y-2 text-sm">
            <li>Executive Search</li>
            <li>IT Recruitment</li>
            <li>Contract Staffing</li>
            <li>HR Advisory</li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Get in touch</h4>
          <ul className="space-y-2 text-sm">
            <li>Email: info@parshvconsultancy.com</li>
            <li>Mumbai, India</li>
          </ul>
          <a href="/contact" className="inline-flex mt-4 rounded px-3 py-2 bg-white text-gray-900 text-sm font-semibold hover:opacity-90">Contact Us</a>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Parshv Consultancy. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
