import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { UnderConstruction } from '@/components/under-construction'

export const metadata = {
  title: 'About Us - Airlangga Travel',
  description: 'Informasi mengenai Airlangga Travel, penyedia jasa perjalanan terpercaya untuk Open Trip, Private Trip, dan Sewa Mobil.',
}

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navbar />
        {/* Padding top is applied to offset the fixed navbar */}
        <div className="pt-20">
          <UnderConstruction type="about" />
        </div>
      </div>
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
