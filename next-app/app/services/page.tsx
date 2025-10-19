import ServicesHero from '@/components/services/ServicesHero';
import ServicesOfferings from '@/components/services/ServicesOfferings';
import ServicesProcess from '@/components/services/ServicesProcess';
import ServicesCTA from '@/components/services/ServicesCTA';

export default function ServicesPage() {
  return (
    <div className="bg-white dark:bg-gray-950">
      <ServicesHero />
      <ServicesOfferings />
      <ServicesProcess />
      <ServicesCTA />
    </div>
  );
}
