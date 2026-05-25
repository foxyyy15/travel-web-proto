import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { UnderConstruction } from '@/components/under-construction'

export const metadata = {
  title: 'Contact Us - Airlangga Travel',
  description: 'Hubungi Airlangga Travel untuk konsultasi perjalanan, pemesanan tiket open trip, private trip, atau sewa mobil.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navbar />
        {/* Padding top is applied to offset the fixed navbar */}
        <div className="pt-20">
          <UnderConstruction type="contact" />
        </div>
      </div>
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
