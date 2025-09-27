import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <div className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Contact Us</h2>
        <ContactForm />
      </div>
    </div>
  );
}