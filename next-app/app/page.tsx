import Hero from '@/components/Hero';
import AboutSection from '@/components/AboutSection';
import JobList from '@/components/JobList';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <AboutSection />
      <JobList />
    </div>
  );
}