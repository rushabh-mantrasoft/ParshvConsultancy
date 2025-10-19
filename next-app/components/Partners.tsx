'use client';

const logos = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];

export default function Partners() {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <p className="text-center text-sm uppercase tracking-wider text-gray-500 mb-6">Trusted by teams at</p>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center opacity-80">
          {logos.map((name) => (
            <div key={name} className="h-10 flex items-center justify-center rounded bg-white border shadow-sm text-gray-500 text-sm font-semibold">
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

