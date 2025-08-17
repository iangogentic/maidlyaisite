import { BookingFlow } from '@/components/booking/booking-flow';
import { Header } from '@/components/marketing/header';
import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Book Your AI-Powered Cleaning Service',
  description: 'Schedule your personalized cleaning service with our AI-powered system. Get real-time pricing, choose your preferences, and book instantly.',
});

export default function BookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <Header />
      <div className="py-8">
        <BookingFlow />
      </div>
    </div>
  );
}
