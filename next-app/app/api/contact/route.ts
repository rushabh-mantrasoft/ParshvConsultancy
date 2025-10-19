const CONTACT_SERVICE_BASE = (() => {
  const base =
    process.env.CONTACT_SERVICE_BASE_URL ||
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:4000';
  return base.endsWith('/') ? base.slice(0, -1) : base;
})();

export async function POST(request: Request) {
  const data = await request.json();

  try {
    const response = await fetch(`${CONTACT_SERVICE_BASE}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const body = await response.json().catch(() => ({}));
    return new Response(JSON.stringify(body), {
      status: response.status,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Contact proxy failed', error);
    return new Response(JSON.stringify({ error: 'Unable to process contact submission' }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
