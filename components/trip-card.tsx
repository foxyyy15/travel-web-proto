'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Clock, Users, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Trip } from '@/lib/types'

interface TripCardProps {
  trip: Trip
  index?: number
}

export function TripCard({ trip, index = 0 }: TripCardProps) {
  // Use consistent formatting to avoid hydration mismatch
  const formatPrice = (price: number) => {
    return `Rp${price.toLocaleString('id-ID')}`
  }

  return (
    <div
      className="group bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-border flex flex-col h-full"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative h-52 flex-shrink-0 overflow-hidden">
        <Image
          src={trip.image}
          alt={trip.title}
          fill
          className="object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <Badge className="bg-primary text-primary-foreground border-0">
            {trip.duration}
          </Badge>
          {trip.availableSlots <= 5 && (
            <Badge variant="destructive" className="border-0">
              Sisa {trip.availableSlots} Slot
            </Badge>
          )}
        </div>

        {/* Location */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 text-background">
          <MapPin className="w-4 h-4" />
          <span className="text-sm font-medium">{trip.destination}</span>
        </div>
      </div>

      {/* Content Wrapper */}
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <h3 className="font-serif font-semibold text-lg text-card-foreground line-clamp-2 leading-snug">
            {trip.title}
          </h3>
        </div>

        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-primary" />
              <span>{trip.duration}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4 text-primary" />
              <span>{trip.availableSlots}/{trip.totalSlots}</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-end gap-2">
            <span className="font-mono text-2xl font-bold text-primary">
              {formatPrice(trip.price)}
            </span>
            {trip.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {formatPrice(trip.originalPrice)}
              </span>
            )}
            <span className="text-sm text-muted-foreground">/pax</span>
          </div>

          {/* CTA */}
          <Button
            asChild
            className="w-full bg-primary hover:bg-primary-dark text-primary-foreground rounded-full"
          >
            <Link href={`/open-trip/${trip.slug}`}>Pesan Sekarang</Link>
          </Button>
        </div>

      </div>
    </div>
  )
}

export function TripCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border animate-pulse flex flex-col h-full">
      <div className="h-52 bg-muted flex-shrink-0" />
      <div className="p-5 flex flex-col flex-grow justify-between">
        <div>
          <div className="h-6 bg-muted rounded w-3/4" />
        </div>
        <div className="mt-6 space-y-4">
          <div className="flex gap-4">
            <div className="h-4 bg-muted rounded w-20" />
            <div className="h-4 bg-muted rounded w-16" />
          </div>
          <div className="h-8 bg-muted rounded w-32" />
          <div className="h-10 bg-muted rounded-full" />
        </div>
      </div>
    </div>
  )
}