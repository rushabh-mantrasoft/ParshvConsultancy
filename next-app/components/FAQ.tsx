'use client';

const faqs = [
  {
    q: 'Which roles do you hire for?',
    a: 'We specialize in technology and business roles across engineering, product, data, design, sales, and leadership.'
  },
  {
    q: 'How fast can you deliver candidates?',
    a: 'Most shortlists are delivered within 3–7 days, depending on seniority and specificity.'
  },
  {
    q: 'Do you support contract staffing?',
    a: 'Yes, we offer both permanent and contract staffing with flexible terms.'
  },
];

export default function FAQ() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-center">FAQs</h2>
        <div className="mt-8 mx-auto max-w-3xl divide-y rounded-xl border bg-white shadow-sm">
          {faqs.map((item) => (
            <details key={item.q} className="group p-6">
              <summary className="flex cursor-pointer list-none items-center justify-between">
                <h3 className="font-semibold text-gray-900">{item.q}</h3>
                <span className="ml-4 text-gray-500 group-open:rotate-180 transition-transform">⌄</span>
              </summary>
              <p className="mt-2 text-gray-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

