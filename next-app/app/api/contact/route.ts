export async function POST(request: Request) {
  const data = await request.json();
  // In a production environment, send an email or store the message in a database.
  console.log('Contact form submission:', data);
  return Response.json({ message: 'Received' });
}