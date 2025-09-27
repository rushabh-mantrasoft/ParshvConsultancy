export async function GET() {
  // In a real application, fetch blog posts from a CMS or database.
  const blogs = [
    {
      id: 1,
      title: 'How to prepare for your next interview',
      excerpt: 'Discover essential tips to succeed in your interviews and land the job of your dreams.',
      published_at: '2025-09-20',
    },
    {
      id: 2,
      title: 'Top hiring trends in 2025',
      excerpt: 'Explore the latest recruitment trends shaping the job market in 2025.',
      published_at: '2025-09-15',
    },
    {
      id: 3,
      title: 'Building a winning resume',
      excerpt: 'Learn how to craft a resume that stands out to employers and recruiters.',
      published_at: '2025-09-10',
    },
  ];
  return Response.json(blogs);
}