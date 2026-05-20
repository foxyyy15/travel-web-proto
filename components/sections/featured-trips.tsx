'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TripCard } from '@/components/trip-card'
import { trips as staticTrips } from '@/lib/data'
import type { Trip } from '@/lib/types'

export function FeaturedTripsSection({ initialTrips }: { initialTrips?: Trip[] }) {
  const displayTrips = initialTrips || staticTrips
  const featuredTrips = displayTrips.filter((trip) => trip.featured).slice(0, 3)

  return (
    <section className="py-20 bg-secondary">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
            Open Trip
          </span>
          <h2 className="font-serif font-bold text-3xl md:text-4xl text-foreground mb-4 text-balance">
            Featured Destinations
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Pilihan destinasi terbaik dengan jadwal keberangkatan yang sudah ditentukan. 
            Bergabung dengan traveler lain dan nikmati perjalanan seru bersama!
          </p>
        </div>

        {/* Trip Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredTrips.map((trip, index) => (
            <TripCard key={trip.id} trip={trip} index={index} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-full px-8"
          >
            <Link href="/open-trip">
              Lihat Semua Trip
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
