'use client'

import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { UnderConstruction } from '@/components/under-construction'

export default function NotFoundPage() {
  return (
    <main className="min-h-screen bg-background flex flex-col justify-between">
      <div>
        <Navbar />
        {/* Padding top is applied to offset the fixed navbar */}
        <div className="pt-20">
          <UnderConstruction type="404" />
        </div>
      </div>
      <Footer />
      <WhatsAppButton />
    </main>
  )
}
