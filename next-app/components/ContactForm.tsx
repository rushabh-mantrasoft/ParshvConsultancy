'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (!res.ok) {
        throw new Error('Failed to send message');
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (submitted) {
    return <p className="text-center text-green-600">Thank you! We’ll get back to you soon.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
      {error && <p className="text-red-500 text-center">{error}</p>}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          required
        />
      </div>
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full p-2 border rounded"
          rows={5}
          required
        />
      </div>
      <button
        type="submit"
        className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-light transition"
      >
        Submit
      </button>
    </form>
  );
}