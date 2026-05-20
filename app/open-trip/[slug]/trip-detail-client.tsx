'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  ChevronLeft,
  MapPin,
  Clock,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  ChevronDown,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { BookingForm } from '@/components/booking-form'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Trip } from '@/lib/types'

interface TripDetailPageClientProps {
  trip: Trip
}

export default function TripDetailPageClient({ trip }: TripDetailPageClientProps) {
  const [selectedImage, setSelectedImage] = useState(0)
  const [openItinerary, setOpenItinerary] = useState<number | null>(0)

  const images = trip.images && trip.images.length > 0 ? trip.images : [trip.image]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Breadcrumb */}
      <div className="bg-secondary pt-24 pb-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">
              Home
            </Link>
            <span className="text-muted-foreground">/</span>
            <Link href="/open-trip" className="text-muted-foreground hover:text-primary">
              Open Trip
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-foreground font-medium">{trip.title}</span>
          </div>
        </div>
      </div>

      {/* Back Button */}
      <div className="bg-secondary pb-4">
        <div className="container mx-auto px-4">
          <Button asChild variant="ghost" className="gap-2 px-0 hover:bg-transparent">
            <Link href="/open-trip">
              <ChevronLeft className="w-4 h-4" />
              Kembali ke Open Trip
            </Link>
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Trip Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Image Gallery */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="relative aspect-video rounded-2xl overflow-hidden"
                >
                  <Image
                    src={images[selectedImage]}
                    alt={trip.title}
                    fill
                    className="object-cover"
                    priority
                  />
                  {trip.availableSlots <= 5 && (
                    <Badge
                      variant="destructive"
                      className="absolute top-4 left-4 border-0"
                    >
                      Sisa {trip.availableSlots} Slot
                    </Badge>
                  )}
                </motion.div>

                {images.length > 1 && (
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {images.map((img, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(index)}
                        className={`relative w-24 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                          selectedImage === index
                            ? 'border-primary'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <Image
                          src={img}
                          alt={`${trip.title} ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Trip Info */}
              <div className="space-y-4">
                <h1 className="font-serif font-bold text-3xl md:text-4xl text-foreground text-balance">
                  {trip.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <span>{trip.destination}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    <span>{trip.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    <span>{trip.availableSlots}/{trip.totalSlots} Slot</span>
                  </div>
                </div>

                {/* Meeting Point */}
                <div className="p-4 bg-secondary rounded-xl">
                  <p className="text-sm text-muted-foreground mb-1">Meeting Point</p>
                  <p className="font-medium text-foreground">{trip.meetingPoint}</p>
                </div>

                {/* Available Dates */}
                <div>
                  <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Jadwal Keberangkatan
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {trip.departureDates.map((date) => (
                      <Badge
                        key={date}
                        variant="outline"
                        className="border-primary/30 text-foreground"
                      >
                        {format(new Date(date), 'd MMM yyyy', { locale: id })}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Itinerary */}
              <div>
                <h3 className="font-serif font-semibold text-xl text-foreground mb-4">
                  Itinerary
                </h3>
                <div className="space-y-3">
                  {trip.itinerary.map((day, index) => (
                    <motion.div
                      key={day.day}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border border-border rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setOpenItinerary(openItinerary === index ? null : index)
                        }
                        className="w-full p-4 flex items-center justify-between bg-card hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <span className="w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold flex items-center justify-center">
                            {day.day}
                          </span>
                          <div className="text-left">
                            <h4 className="font-semibold text-card-foreground">
                              {day.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              {day.description}
                            </p>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-5 h-5 text-muted-foreground transition-transform ${
                            openItinerary === index ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                      <AnimatePresence>
                        {openItinerary === index && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 pt-0 border-t border-border">
                              <ul className="space-y-2 mt-4">
                                {day.activities.map((activity, i) => (
                                  <li
                                    key={i}
                                    className="flex items-start gap-2 text-sm text-muted-foreground"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-2" />
                                    {activity}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Includes/Excludes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 bg-success/5 border border-success/20 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-success" />
                    Include
                  </h3>
                  <ul className="space-y-2">
                    {trip.includes.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <CheckCircle className="w-4 h-4 text-success shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-6 bg-destructive/5 border border-destructive/20 rounded-xl">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-destructive" />
                    Exclude
                  </h3>
                  <ul className="space-y-2">
                    {trip.excludes.map((item, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <XCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Form */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                {/* Price Card */}
                <div className="bg-card rounded-2xl border border-border p-6 mb-4">
                  <div className="flex items-end gap-2 mb-2">
                    <span className="font-mono text-3xl font-bold text-primary">
                      {formatPrice(trip.price)}
                    </span>
                    <span className="text-muted-foreground mb-1">/pax</span>
                  </div>
                  {trip.originalPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(trip.originalPrice)}
                    </span>
                  )}
                </div>

                <BookingForm trip={trip} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton message={`Halo, saya tertarik dengan trip ${trip.title}`} />
    </main>
  )
}
