'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { format, addHours, differenceInSeconds } from 'date-fns'
import { id } from 'date-fns/locale'
import { toast } from 'sonner'
import {
  User,
  Mail,
  Phone,
  Users,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import type { Trip, Booking } from '@/lib/types'
import { useBookingStore, generateBookingCode } from '@/lib/booking-store'
import { createBookingAction, updateBookingStatusAction, sendBookingEmailAction } from '@/app/actions/booking'

// Extend Window interface for Midtrans Snap
declare global {
  interface Window {
    snap?: {
      pay: (
        token: string,
        options: {
          onSuccess: (result: MidtransResult) => void
          onPending: (result: MidtransResult) => void
          onError: (result: MidtransResult) => void
          onClose: () => void
        }
      ) => void
    }
  }
}

interface MidtransResult {
  order_id: string
  transaction_status: string
  status_code: string
  gross_amount: string
  payment_type?: string
}

const bookingSchema = z.object({
  customerName: z.string().min(3, 'Nama minimal 3 karakter'),
  email: z.string().email('Email tidak valid'),
  whatsapp: z.string().min(10, 'Nomor WhatsApp tidak valid'),
  participants: z.number().min(1, 'Minimal 1 peserta').max(10, 'Maksimal 10 peserta'),
  departureDate: z.string().min(1, 'Pilih tanggal keberangkatan'),
})

type BookingFormData = z.infer<typeof bookingSchema>

interface BookingFormProps {
  trip: Trip
  onClose?: () => void
}

export function BookingForm({ trip, onClose }: BookingFormProps) {
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form')
  const [isProcessing, setIsProcessing] = useState(false)
  const [currentBooking, setCurrentBooking] = useState<Booking | null>(null)
  const activeTransactionRef = useRef<{
    bookingId: string | null
    status: 'idle' | 'success' | 'pending' | 'error'
    emailSent: 'none' | 'pending' | 'dp_paid' | 'paid'
  }>({
    bookingId: null,
    status: 'idle',
    emailSent: 'none',
  })
  const [snapLoaded, setSnapLoaded] = useState(false)
  const [midtransConfig, setMidtransConfig] = useState<{
    clientKey: string
    isProduction: boolean
  } | null>(null)

  const addBooking = useBookingStore((state) => state.addBooking)
  const updateBookingStatus = useBookingStore((state) => state.updateBookingStatus)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      participants: 1,
    },
  })

  const participants = watch('participants') || 1
  const totalPrice = trip.price * participants
  const depositPercentage = trip.depositPercentage ?? 100
  const isPartialDeposit = depositPercentage < 100
  const depositAmount = totalPrice * (depositPercentage / 100)
  const remainingAmount = totalPrice - depositAmount

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Load Midtrans configuration
  useEffect(() => {
    async function loadMidtransConfig() {
      try {
        const response = await fetch('/api/midtrans/client-key')
        const data = await response.json()
        setMidtransConfig(data)
      } catch (error) {
        console.error('Failed to load Midtrans config:', error)
      }
    }
    loadMidtransConfig()
  }, [])

  // Load Midtrans Snap script
  useEffect(() => {
    if (!midtransConfig?.clientKey) return

    const snapUrl = midtransConfig.isProduction
      ? 'https://app.midtrans.com/snap/snap.js'
      : 'https://app.sandbox.midtrans.com/snap/snap.js'

    // Check if script already loaded
    if (document.querySelector(`script[src="${snapUrl}"]`)) {
      setSnapLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = snapUrl
    script.setAttribute('data-client-key', midtransConfig.clientKey)
    script.async = true
    script.onload = () => setSnapLoaded(true)
    script.onerror = () => {
      console.error('Failed to load Midtrans Snap')
      toast.error('Gagal memuat payment gateway')
    }
    document.body.appendChild(script)

    return () => {
      // Don't remove script on cleanup to prevent reload issues
    }
  }, [midtransConfig])

  const createMidtransTransaction = async (booking: Booking) => {
    try {
      const amtToPay = booking.totalPrice * (depositPercentage / 100)
      const response = await fetch('/api/midtrans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: booking.bookingCode,
          grossAmount: amtToPay,
          customerName: booking.customerName,
          email: booking.email,
          phone: booking.whatsapp,
          tripTitle: booking.tripTitle,
          participants: booking.participants,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create transaction')
      }

      return await response.json()
    } catch (error) {
      console.error('Error creating Midtrans transaction:', error)
      throw error
    }
  }

  const handleMidtransPayment = useCallback(
    async (booking: Booking) => {
      if (!snapLoaded || !window.snap) {
        toast.error('Payment gateway belum siap, silakan coba lagi')
        return
      }

      setIsProcessing(true)

      // Initialize/reset the active transaction state for this booking
      activeTransactionRef.current = {
        bookingId: booking.id,
        status: 'idle',
        emailSent: 'none',
      }

      // Helper to send email only once
      const sendEmailOnce = (status: 'dp_paid' | 'paid') => {
        const tx = activeTransactionRef.current
        if (tx.bookingId !== booking.id) return // Safety check

        // Rules:
        // 1. If we already sent a 'paid'/'dp_paid' email, never send anything else.
        if (tx.emailSent === 'paid' || tx.emailSent === 'dp_paid') return

        const targetBooking = { ...booking, status } as Booking
        tx.emailSent = status

        sendBookingEmailAction(targetBooking).catch((err) => {
          console.error(`Failed to send ${status} email:`, err)
        })
      }

      try {
        const { token } = await createMidtransTransaction(booking)

        window.snap.pay(token, {
          onSuccess: async (result) => {
            console.log('Payment success:', result)
            activeTransactionRef.current.status = 'success'

            const nextStatus = isPartialDeposit ? ('dp_paid' as const) : ('paid' as const)

            await updateBookingStatusAction(booking.id, nextStatus)
            updateBookingStatus(booking.id, nextStatus)
            const updatedBooking = { ...booking, status: nextStatus }
            setCurrentBooking(updatedBooking)
            setStep('success')
            toast.success(isPartialDeposit ? 'Pembayaran Uang Muka (DP) berhasil!' : 'Pembayaran berhasil!')

            // Send success email with correct status
            sendEmailOnce(nextStatus)
          },
          onPending: (result) => {
            console.log('Payment pending:', result)
            activeTransactionRef.current.status = 'pending'

            toast.info('Pembayaran dalam proses, silakan selesaikan pembayaran')
            setStep('form')
          },
          onError: (result) => {
            console.error('Payment error:', result)
            activeTransactionRef.current.status = 'error'

            toast.error('Pembayaran gagal, silakan coba lagi')
            setStep('form')
          },
          onClose: () => {
            console.log('Payment popup closed')
            const tx = activeTransactionRef.current

            // Check status that was set in callbacks
            if (tx.status === 'success') {
              // Paid successfully, step should already be 'success'
              // No need to send email or update step
              return
            }

            if (tx.status === 'pending') {
              // They chose a payment method and closed the popup (to pay via ATM/GoPay/etc.)
              toast.info('Selesaikan pembayaran Anda sesuai instruksi')
              setStep('form')
              return
            }

            // Otherwise, they closed it without finishing (status is 'idle' or 'error')
            toast.info('Pembayaran dibatalkan')
            setStep('form')
          },
        })
      } catch (error) {
        console.error('Payment error:', error)
        toast.error('Gagal memproses pembayaran')
        setStep('form')
      } finally {
        setIsProcessing(false)
      }
    },
    [snapLoaded, updateBookingStatus, isPartialDeposit]
  )

  const onSubmit = async (data: BookingFormData) => {
    const bookingCode = generateBookingCode()
    const paymentDeadline = addHours(new Date(), 24).toISOString()

    const pendingBookingData = {
      tripId: trip.id,
      tripTitle: trip.title,
      customerName: data.customerName,
      email: data.email,
      whatsapp: data.whatsapp,
      participants: data.participants,
      departureDate: data.departureDate,
      totalPrice,
      status: 'pending' as const,
      bookingCode,
      paymentDeadline,
    }

    setStep('processing')

    // Create the booking in DB
    const res = await createBookingAction(pendingBookingData)
    const finalBooking = res.success && res.booking ? res.booking : {
      ...pendingBookingData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }

    addBooking(finalBooking)
    setCurrentBooking(finalBooking)

    // Open Midtrans payment popup
    await handleMidtransPayment(finalBooking)
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-6 md:p-8">
      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="form"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <h3 className="font-serif font-semibold text-xl text-card-foreground mb-6">
              Form Booking
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="customerName">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="customerName"
                    {...register('customerName')}
                    placeholder="Masukkan nama lengkap"
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
                {errors.customerName && (
                  <p className="text-sm text-destructive">{errors.customerName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    placeholder="email@example.com"
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>

              {/* WhatsApp */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp">No. WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="whatsapp"
                    {...register('whatsapp')}
                    placeholder="08xxxxxxxxxx"
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
                {errors.whatsapp && (
                  <p className="text-sm text-destructive">{errors.whatsapp.message}</p>
                )}
              </div>

              {/* Participants */}
              <div className="space-y-2">
                <Label htmlFor="participants">Jumlah Peserta</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="participants"
                    type="number"
                    min={1}
                    max={10}
                    {...register('participants', { valueAsNumber: true })}
                    className="pl-10 h-12 rounded-xl"
                  />
                </div>
                {errors.participants && (
                  <p className="text-sm text-destructive">{errors.participants.message}</p>
                )}
              </div>

              {/* Departure Date */}
              <div className="space-y-2">
                <Label>Tanggal Keberangkatan</Label>
                <Select onValueChange={(value) => setValue('departureDate', value)}>
                  <SelectTrigger className="h-12 rounded-xl">
                    <Calendar className="w-5 h-5 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Pilih tanggal" />
                  </SelectTrigger>
                  <SelectContent>
                    {trip.departureDates.map((date) => (
                      <SelectItem key={date} value={date}>
                        {format(new Date(date), 'EEEE, d MMMM yyyy', { locale: id })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departureDate && (
                  <p className="text-sm text-destructive">{errors.departureDate.message}</p>
                )}
              </div>

              {/* Price Calculator */}
              <div className="p-4 bg-secondary rounded-xl space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga per pax</span>
                  <span className="text-card-foreground">{formatPrice(trip.price)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jumlah peserta</span>
                  <span className="text-card-foreground">x {participants}</span>
                </div>
                {isPartialDeposit ? (
                  <>
                    <div className="border-t border-border pt-3 flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Harga</span>
                      <span className="font-medium text-card-foreground">
                        {formatPrice(totalPrice)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uang Muka (DP {depositPercentage}%)</span>
                      <span className="font-medium text-card-foreground text-success">
                        {formatPrice(depositAmount)}
                      </span>
                    </div>
                    <div className="border-t border-border/50 pt-3 flex justify-between">
                      <span className="font-semibold text-card-foreground">Bayar Sekarang (DP)</span>
                      <span className="font-mono font-bold text-xl text-primary">
                        {formatPrice(depositAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Sisa pelunasan (dibayar nanti)</span>
                      <span>{formatPrice(remainingAmount)}</span>
                    </div>
                  </>
                ) : (
                  <div className="border-t border-border pt-3 flex justify-between">
                    <span className="font-semibold text-card-foreground">Total</span>
                    <span className="font-mono font-bold text-xl text-primary">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                )}
              </div>

              {/* Midtrans Badge */}
              <div className="flex items-center justify-center gap-2 py-2">
                <span className="text-xs text-muted-foreground">Powered by</span>
                <span className="font-semibold text-sm text-[#00AA13]">Midtrans</span>
              </div>

              <Button
                type="submit"
                disabled={isProcessing || !snapLoaded}
                className="w-full h-12 bg-primary hover:bg-primary-dark text-primary-foreground rounded-full text-base"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : !snapLoaded ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Memuat Payment Gateway...
                  </>
                ) : (
                  'Lanjutkan Pembayaran'
                )}
              </Button>
            </form>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Loader2 className="w-16 h-16 mx-auto mb-6 text-primary animate-spin" />
            <h3 className="font-serif font-semibold text-xl text-card-foreground mb-2">
              Memproses Pembayaran
            </h3>
            <p className="text-muted-foreground">
              Silakan selesaikan pembayaran di popup yang muncul
            </p>
          </motion.div>
        )}

        {step === 'success' && currentBooking && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center"
            >
              <CheckCircle2 className="w-10 h-10 text-success" />
            </motion.div>

            <h3 className="font-serif font-bold text-2xl text-card-foreground mb-2">
              {currentBooking.status === 'dp_paid' ? 'Pembayaran DP Berhasil!' : 'Pembayaran Berhasil!'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {currentBooking.status === 'dp_paid'
                ? 'Terima kasih telah membayar uang muka (DP) booking di Airlangga Travel'
                : 'Terima kasih telah melakukan booking di Airlangga Travel'}
            </p>

            <div className="p-4 bg-secondary rounded-xl text-left space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Kode Booking</span>
                <span className="font-mono font-bold text-primary">
                  {currentBooking.bookingCode}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Trip</span>
                <span className="text-card-foreground">{trip.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tanggal</span>
                <span className="text-card-foreground">
                  {format(new Date(currentBooking.departureDate), 'd MMMM yyyy', { locale: id })}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge className={currentBooking.status === 'dp_paid' ? "bg-amber-500 text-white" : "bg-success text-success-foreground"}>
                  {currentBooking.status === 'dp_paid' ? 'DP Paid' : 'Paid'}
                </Badge>
              </div>
              {currentBooking.status === 'dp_paid' && (
                <>
                  <div className="flex justify-between text-sm border-t border-border/50 pt-2">
                    <span className="text-muted-foreground">Uang Muka Terbayar ({depositPercentage}%)</span>
                    <span className="font-semibold text-card-foreground">
                      {formatPrice(currentBooking.totalPrice * (depositPercentage / 100))}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sisa Pelunasan</span>
                    <span className="font-semibold text-card-foreground text-primary">
                      {formatPrice(currentBooking.totalPrice * (1 - depositPercentage / 100))}
                    </span>
                  </div>
                </>
              )}
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Detail booking telah dikirim ke email Anda. Tim kami akan menghubungi Anda
              melalui WhatsApp untuk informasi lebih lanjut.
            </p>

            <Button
              onClick={onClose}
              className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-full px-8"
            >
              Selesai
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
