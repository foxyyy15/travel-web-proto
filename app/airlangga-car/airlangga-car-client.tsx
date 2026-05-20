'use client'

import { useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import {
  Users,
  Fuel,
  Snowflake,
  Music,
  Wifi,
  Tv,
  MessageCircle,
  MapPin,
  Calendar,
  Check,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Car } from '@/lib/types'

const WHATSAPP_NUMBER = '6208111211143'

const bookingSchema = z.object({
  pickupLocation: z.string().min(3, 'Lokasi penjemputan minimal 3 karakter'),
  dropoffLocation: z.string().min(3, 'Lokasi tujuan minimal 3 karakter'),
  pickupDate: z.string().min(1, 'Pilih tanggal penjemputan'),
  duration: z.number().min(1, 'Minimal 1 hari').max(30, 'Maksimal 30 hari'),
})

type BookingFormData = z.infer<typeof bookingSchema>

const featureIcons: Record<string, typeof Fuel> = {
  AC: Snowflake,
  'Audio System': Music,
  'Premium Audio': Music,
  WiFi: Wifi,
  TV: Tv,
}

interface AirlanggaCarClientProps {
  cars: Car[]
}

export default function AirlanggaCarClient({ cars }: AirlanggaCarClientProps) {
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [isBookingOpen, setIsBookingOpen] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      duration: 1,
    },
  })

  const duration = watch('duration') || 1
  const totalPrice = selectedCar ? selectedCar.pricePerDay * duration : 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleBookClick = (car: Car) => {
    setSelectedCar(car)
    setIsBookingOpen(true)
  }

  const onSubmit = (data: BookingFormData) => {
    if (!selectedCar) return

    const message = `Halo Airlangga Travel, saya ingin booking rental mobil:

Kendaraan: ${selectedCar.name} (${selectedCar.type})
Kapasitas: ${selectedCar.capacity} orang
Lokasi Penjemputan: ${data.pickupLocation}
Lokasi Tujuan: ${data.dropoffLocation}
Tanggal: ${data.pickupDate}
Durasi: ${data.duration} hari
Total: ${formatPrice(totalPrice)}

Mohon konfirmasi ketersediaan. Terima kasih!`

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, '_blank')

    setIsBookingOpen(false)
    reset()
    toast.success('Redirecting ke WhatsApp...')
  }

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-20 bg-secondary overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block text-primary font-semibold text-sm uppercase tracking-wider mb-3">
              Airlangga Car
            </span>
            <h1 className="font-serif font-bold text-4xl md:text-5xl text-foreground mb-4 text-balance">
              Rental Kendaraan Premium
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Nikmati perjalanan dengan armada kendaraan terbaik kami. Tersedia berbagai pilihan 
              mobil dan van premium dengan driver profesional.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Fleet Showcase */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-2">
              Our Fleet
            </h2>
            <p className="text-muted-foreground">
              Pilih kendaraan sesuai kebutuhan perjalanan Anda
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cars.map((car, index) => (
              <motion.div
                key={car.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-card rounded-2xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300"
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={car.image}
                    alt={car.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground border-0">
                    {car.type}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                  <div>
                    <h3 className="font-serif font-semibold text-lg text-card-foreground">
                      {car.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                      <Users className="w-4 h-4 text-primary" />
                      <span>{car.capacity} orang</span>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {car.features.slice(0, 3).map((feature) => {
                      const Icon = featureIcons[feature] || Check
                      return (
                        <span
                          key={feature}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-secondary rounded-full text-xs text-muted-foreground"
                        >
                          <Icon className="w-3 h-3" />
                          {feature}
                        </span>
                      )
                    })}
                    {car.features.length > 3 && (
                      <span className="px-2 py-1 bg-secondary rounded-full text-xs text-muted-foreground">
                        +{car.features.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Price */}
                  <div className="flex items-end gap-1">
                    <span className="font-mono text-2xl font-bold text-primary">
                      {formatPrice(car.pricePerDay)}
                    </span>
                    <span className="text-sm text-muted-foreground mb-1">/hari</span>
                  </div>

                  <Button
                    onClick={() => handleBookClick(car)}
                    className="w-full bg-primary hover:bg-primary-dark text-primary-foreground rounded-full"
                  >
                    Booking Sekarang
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif font-bold text-2xl md:text-3xl text-foreground mb-8">
              Mengapa Memilih Airlangga Car?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: 'Armada Terawat',
                  description: 'Semua kendaraan dalam kondisi prima dan terawat',
                },
                {
                  title: 'Driver Profesional',
                  description: 'Driver berpengalaman, ramah, dan mengetahui rute',
                },
                {
                  title: 'Harga Transparan',
                  description: 'Tidak ada biaya tersembunyi, harga all-in',
                },
              ].map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="p-6 bg-card rounded-2xl border border-border"
                >
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-card-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Booking Dialog */}
      <Dialog open={isBookingOpen} onOpenChange={setIsBookingOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif">Booking {selectedCar?.name}</DialogTitle>
          </DialogHeader>

          {selectedCar && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Car Info */}
              <div className="flex items-center gap-4 p-3 bg-secondary rounded-xl">
                <div className="relative w-20 h-14 rounded-lg overflow-hidden">
                  <Image
                    src={selectedCar.image}
                    alt={selectedCar.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-card-foreground">{selectedCar.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedCar.capacity} orang • {selectedCar.type}
                  </p>
                </div>
              </div>

              {/* Pickup Location */}
              <div className="space-y-2">
                <Label htmlFor="pickupLocation">Lokasi Penjemputan</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="pickupLocation"
                    {...register('pickupLocation')}
                    placeholder="Bandara, Hotel, dll"
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
                {errors.pickupLocation && (
                  <p className="text-sm text-destructive">{errors.pickupLocation.message}</p>
                )}
              </div>

              {/* Dropoff Location */}
              <div className="space-y-2">
                <Label htmlFor="dropoffLocation">Lokasi Tujuan</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="dropoffLocation"
                    {...register('dropoffLocation')}
                    placeholder="Kota tujuan"
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
                {errors.dropoffLocation && (
                  <p className="text-sm text-destructive">{errors.dropoffLocation.message}</p>
                )}
              </div>

              {/* Pickup Date */}
              <div className="space-y-2">
                <Label htmlFor="pickupDate">Tanggal Penjemputan</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="pickupDate"
                    type="date"
                    {...register('pickupDate')}
                    className="pl-10 h-12 rounded-xl"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.pickupDate && (
                  <p className="text-sm text-destructive">{errors.pickupDate.message}</p>
                )}
              </div>

              {/* Duration */}
              <div className="space-y-2">
                <Label htmlFor="duration">Durasi (Hari)</Label>
                <Input
                  id="duration"
                  type="number"
                  min={1}
                  max={30}
                  {...register('duration', { valueAsNumber: true })}
                  className="h-12 rounded-xl"
                />
                {errors.duration && (
                  <p className="text-sm text-destructive">{errors.duration.message}</p>
                )}
              </div>

              {/* Price Summary */}
              <div className="p-4 bg-secondary rounded-xl space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga per hari</span>
                  <span>{formatPrice(selectedCar.pricePerDay)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Durasi</span>
                  <span>{duration} hari</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-semibold">Total</span>
                  <span className="font-mono font-bold text-xl text-primary">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-primary hover:bg-primary-dark text-primary-foreground rounded-full cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Lanjut ke WhatsApp
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Footer />
      <WhatsAppButton message="Halo, saya tertarik dengan rental mobil" />
    </main>
  )
}
