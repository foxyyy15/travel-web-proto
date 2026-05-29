import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import ContactClient from './contact-client'

export const metadata = {
  title: 'Hubungi Kami - Airlangga Travel',
  description: 'Hubungi Airlangga Travel untuk konsultasi perjalanan, pemesanan tiket open trip, private trip, atau sewa mobil.',
}

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navbar />
        {/* Padding top is applied to offset the fixed navbar */}
        <div className="pt-20">
          <ContactClient />
        </div>
      </div>
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
