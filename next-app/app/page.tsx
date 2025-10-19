import Hero from '@/components/Hero';
import Partners from '@/components/Partners';
import Services from '@/components/Services';
import Stats from '@/components/Stats';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CTA from '@/components/CTA';
import JobList from '@/components/JobList';

export default function HomePage() {
  return (
    <div>
      <Hero />
      <Partners />
      <Services />
      <Stats />
      <JobList />
      <Testimonials />
      <FAQ />
      <CTA />
    </div>
  );
}
