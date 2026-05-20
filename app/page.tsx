import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { HeroSection } from '@/components/sections/hero'
import { StatsSection } from '@/components/sections/stats'
import { FeaturedTripsSection } from '@/components/sections/featured-trips'
import { FeaturesSection } from '@/components/sections/features'
import { TestimonialsSection } from '@/components/sections/testimonials'
import { CTABannerSection } from '@/components/sections/cta-banner'

import { getTrips, getTestimonials } from '@/lib/db-fallback'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const [trips, testimonials] = await Promise.all([
    getTrips(),
    getTestimonials(),
  ])

  return (
    <main className="min-h-screen">
      <Navbar />
      <HeroSection />
      <StatsSection />
      <FeaturedTripsSection initialTrips={trips} />
      <FeaturesSection />
      <TestimonialsSection initialTestimonials={testimonials} />
      <CTABannerSection />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
