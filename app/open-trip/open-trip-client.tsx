'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Calendar, MapPin, Clock } from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { TripCard, TripCardSkeleton } from '@/components/trip-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Trip } from '@/lib/types'

const destinations = ['All', 'East Europe', 'Bromo', 'Yogyakarta', 'Bali', 'Raja Ampat', 'Dieng']
const durations = ['All', '3 Hari', '4 Hari', '5 Hari', '6+ Hari']
const priceRanges = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Under 3 Juta', min: 0, max: 3000000 },
  { label: '3 - 5 Juta', min: 3000000, max: 5000000 },
  { label: '5 - 10 Juta', min: 5000000, max: 10000000 },
  { label: '10+ Juta', min: 10000000, max: Infinity },
]

interface OpenTripClientProps {
  trips: Trip[]
}

export default function OpenTripClient({ trips }: OpenTripClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDestination, setSelectedDestination] = useState('All')
  const [selectedDuration, setSelectedDuration] = useState('All')
  const [selectedPriceRange, setSelectedPriceRange] = useState('All')
  const [isLoading] = useState(false)

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      // Search filter
      if (searchQuery && !trip.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false
      }

      // Destination filter
      if (selectedDestination !== 'All' && !trip.destination.toLowerCase().includes(selectedDestination.toLowerCase())) {
        return false
      }

      // Duration filter
      if (selectedDuration !== 'All') {
        const days = parseInt(trip.duration.split(' ')[0])
        if (selectedDuration === '3 Hari' && days !== 3) return false
        if (selectedDuration === '4 Hari' && days !== 4) return false
        if (selectedDuration === '5 Hari' && days !== 5) return false
        if (selectedDuration === '6+ Hari' && days < 6) return false
      }

      // Price filter
      if (selectedPriceRange !== 'All') {
        const range = priceRanges.find((r) => r.label === selectedPriceRange)
        if (range && (trip.price < range.min || trip.price > range.max)) {
          return false
        }
      }

      return true
    })
  }, [trips, searchQuery, selectedDestination, selectedDuration, selectedPriceRange])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 bg-secondary">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-4 text-balance">
              Explore Our Open Trip Schedule
            </h1>
            <p className="text-muted-foreground leading-relaxed">
              A Budget-Friendly Way to Explore Your Dream Destinations!
              A smart vacation solution for those looking to explore popular destinations, meet new friends, and save money. Various epic destinations await you here, check out the details below!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-8 bg-background sticky top-20 z-30 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative w-full lg:w-auto lg:flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari destinasi atau trip..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-full border-border"
              />
            </div>

            {/* Filter Selects */}
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
              <Select value={selectedDestination} onValueChange={setSelectedDestination}>
                <SelectTrigger className="w-full sm:w-40 data-[size=default]:h-12 h-12 rounded-full">
                  <MapPin className="w-4 h-4 mr-2 text-primary" />
                  <SelectValue placeholder="Destinasi" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((dest) => (
                    <SelectItem key={dest} value={dest}>
                      {dest}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedDuration} onValueChange={setSelectedDuration}>
                <SelectTrigger className="w-full sm:w-36 data-[size=default]:h-12 h-12 rounded-full">
                  <Clock className="w-4 h-4 mr-2 text-primary" />
                  <SelectValue placeholder="Durasi" />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((dur) => (
                    <SelectItem key={dur} value={dur}>
                      {dur}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedPriceRange} onValueChange={setSelectedPriceRange}>
                <SelectTrigger className="w-full sm:w-40 data-[size=default]:h-12 h-12 rounded-full">
                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                  <SelectValue placeholder="Harga" />
                </SelectTrigger>
                <SelectContent>
                  {priceRanges.map((range) => (
                    <SelectItem key={range.label} value={range.label}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedDestination('All')
                  setSelectedDuration('All')
                  setSelectedPriceRange('All')
                }}
                className="h-12 rounded-full px-6"
              >
                <Filter className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trip Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {/* Results count */}
          <p className="text-muted-foreground mb-6">
            Menampilkan <span className="text-foreground font-semibold">{filteredTrips.length}</span> trip
          </p>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <TripCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredTrips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrips.map((trip, index) => (
                <TripCard key={trip.id} trip={trip} index={index} />
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                <Search className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-serif font-semibold text-xl text-foreground mb-2">
                Tidak Ada Trip Ditemukan
              </h3>
              <p className="text-muted-foreground">
                Coba ubah filter pencarian Anda
              </p>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}
