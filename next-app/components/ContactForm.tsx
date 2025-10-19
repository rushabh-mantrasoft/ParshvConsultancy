'use client';
import { useState } from 'react';

const API_BASE_URL = (() => {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';
  return base.endsWith('/') ? base.slice(0, -1) : base;
})();

const contactEndpoint = `${API_BASE_URL}/api/contact`;

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch(contactEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      if (!res.ok) {
        const errorBody = await res.json().catch(() => null);
        const messageFromApi = errorBody?.message ?? errorBody?.error;
        throw new Error(messageFromApi || 'Failed to send message');
      }

      setName('');
      setEmail('');
      setMessage('');
      setSubmitted(true);
    } catch (err: any) {
      setError(err.message ?? 'Failed to send message');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return <p className="text-center text-green-600">Thank you! We'll get back to you soon.</p>;
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
        className="px-6 py-2 bg-primary text-white rounded hover:bg-primary-light transition disabled:opacity-70"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
