'use client'

import { Suspense, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getBookingByCodeAction, updateBookingStatusAction, sendBookingEmailAction } from '@/app/actions/booking'
import { useBookingStore } from '@/lib/booking-store'
import type { Booking } from '@/lib/types'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import {
  Search,
  Calendar,
  Users,
  CreditCard,
  User,
  Phone,
  Mail,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  ArrowLeft,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

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

function TrackOrderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const [bookingCode, setBookingCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<Booking | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Midtrans Snap configurations and states
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [snapLoaded, setSnapLoaded] = useState(false)
  const [midtransConfig, setMidtransConfig] = useState<{
    clientKey: string
    isProduction: boolean
  } | null>(null)

  const updateBookingStatus = useBookingStore((state) => state.updateBookingStatus)
  const localBookings = useBookingStore((state) => state.bookings)

  const lastFetchedCodeRef = useRef('')

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
  }, [midtransConfig])

  // Clear search code if the page is refreshed/reloaded
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const navigationEntries = performance.getEntriesByType('navigation');
      const isReload = navigationEntries.length > 0 && 
        (navigationEntries[0] as PerformanceNavigationTiming).type === 'reload';
      
      if (isReload) {
        router.replace(pathname);
      }
    }
  }, [pathname, router]);

  // Sync with URL query parameter on load & URL changes
  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      const cleanCode = code.trim().toUpperCase()
      setBookingCode(cleanCode)

      if (cleanCode !== lastFetchedCodeRef.current) {
        lastFetchedCodeRef.current = cleanCode
        fetchBooking(cleanCode)
      }
    } else {
      setBooking(null)
      setError(null)
      setBookingCode('')
      lastFetchedCodeRef.current = ''
    }
  }, [searchParams])

  const fetchBooking = async (code: string) => {
    setLoading(true)
    setError(null)
    setBooking(null)

    try {
      const res = await getBookingByCodeAction(code)
      if (res.success && res.booking) {
        // Cross-reference with local storage Zustand bookings to check if status is updated to 'paid' in simulation mode
        const matchedLocal = localBookings.find(b => b.bookingCode === code)
        if (matchedLocal && matchedLocal.status === 'paid' && res.booking.status === 'pending') {
          setBooking({ ...res.booking, status: 'paid' })
        } else {
          setBooking(res.booking)
        }
      } else {
        setError(res.error || 'Pesanan tidak ditemukan')
        toast.error(res.error || 'Pesanan tidak ditemukan')
      }
    } catch (err) {
      console.error(err)
      setError('Terjadi kesalahan sistem saat melacak pesanan')
      toast.error('Gagal mengambil data pesanan')
    } finally {
      setLoading(false)
    }
  }

  const createMidtransTransaction = async (bookingData: Booking) => {
    try {
      const response = await fetch('/api/midtrans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: bookingData.bookingCode,
          grossAmount: bookingData.totalPrice,
          customerName: bookingData.customerName,
          email: bookingData.email,
          phone: bookingData.whatsapp,
          tripTitle: bookingData.tripTitle,
          participants: bookingData.participants,
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

  const handlePayNow = async () => {
    if (!booking) return

    if (!snapLoaded || !window.snap) {
      toast.error('Payment gateway belum siap, silakan coba lagi')
      return
    }

    setIsProcessingPayment(true)

    try {
      const { token } = await createMidtransTransaction(booking)

      window.snap.pay(token, {
        onSuccess: async (result) => {
          console.log('Payment success:', result)
          toast.success('Pembayaran berhasil!')

          // Update DB
          await updateBookingStatusAction(booking.id, 'paid')

          // Update Zustand store
          updateBookingStatus(booking.id, 'paid')

          const updatedBooking = { ...booking, status: 'paid' as const }
          // Update local state
          setBooking(updatedBooking)

          // Send success email with 'paid' status
          sendBookingEmailAction(updatedBooking).catch((err) => {
            console.error('Failed to send success email:', err)
          })
        },
        onPending: (result) => {
          console.log('Payment pending:', result)
          toast.info('Pembayaran dalam proses, silakan selesaikan pembayaran')
        },
        onError: (result) => {
          console.error('Payment error:', result)
          toast.error('Pembayaran gagal, silakan coba lagi')
        },
        onClose: () => {
          console.log('Payment popup closed')
          toast.info('Pembayaran ditangguhkan')
        },
      })
    } catch (err) {
      console.error('Payment flow failed:', err)
      toast.error('Gagal melanjutkan pembayaran')
    } finally {
      setIsProcessingPayment(false)
    }
  }

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const code = bookingCode.trim().toUpperCase()
    if (!code) {
      toast.error('Masukkan kode booking terlebih dahulu')
      return
    }

    // Cukup update URL parameter query. Efek useEffect akan menangani fetch-nya.
    const params = new URLSearchParams(searchParams.toString())
    params.set('code', code)
    router.replace(`${pathname}?${params.toString()}`)
  }


  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    toast.success('Kode booking disalin ke clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const getStatusBadge = (status: Booking['status']) => {
    switch (status) {
      case 'paid':
        return <Badge className="bg-success hover:bg-success text-success-foreground px-3 py-1 text-sm rounded-full">Lunas</Badge>
      case 'pending':
        return <Badge className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-1 text-sm rounded-full">Menunggu Pembayaran</Badge>
      case 'cancelled':
        return <Badge className="bg-destructive hover:bg-destructive text-destructive-foreground px-3 py-1 text-sm rounded-full">Dibatalkan</Badge>
      default:
        return null
    }
  }

  const getStatusIcon = (status: Booking['status']) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="w-16 h-16 text-success mx-auto" />
      case 'pending':
        return <Clock className="w-16 h-16 text-amber-500 mx-auto animate-pulse" />
      case 'cancelled':
        return <AlertCircle className="w-16 h-16 text-destructive mx-auto" />
      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/')}
        className="mb-8 hover:text-primary transition-colors text-muted-foreground flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Beranda
      </Button>

      {/* Header Section */}
      <div className="text-center mb-12">
        <h1 className="font-serif font-bold text-3xl md:text-5xl text-foreground mb-4">
          Lacak <span className="text-primary">Status Pesanan</span>
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Masukkan kode booking Anda (misal: ALG-2026-XXX) untuk melacak status pembayaran dan detail reservasi Anda secara real-time.
        </p>
      </div>

      {/* Search Input Card */}
      <Card className="border border-border/50 shadow-lg rounded-2xl overflow-hidden mb-10 bg-card/60 backdrop-blur-md">
        <CardContent className="p-6 md:p-8">
          <form
            onSubmit={handleTrackSubmit}
            className="flex flex-col sm:flex-row gap-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="bookingCodeInput"
                type="text"
                spellCheck="false"
                autoComplete="off"
                placeholder="Masukkan Kode Booking Anda"
                value={bookingCode}
                onChange={(e) => setBookingCode(e.target.value)}
                className="pl-12 h-14 rounded-xl text-base bg-background/50 border-input focus-visible:ring-2 focus-visible:ring-primary w-full uppercase"
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="h-14 px-8 rounded-xl bg-primary hover:bg-primary-dark text-primary-foreground font-semibold text-base shadow-md transition-colors duration-200"
            >
              {loading ? 'Mencari...' : 'Lacak Status'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Section */}
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="text-center py-20"
          >
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">Sedang mencari data pesanan Anda...</p>
          </motion.div>
        )}

        {error && !loading && (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12 px-6 border border-destructive/20 bg-destructive/5 rounded-2xl"
          >
            <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Pencarian Gagal</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              {error}. Pastikan kode booking yang Anda masukkan sudah benar dan sesuai dengan format yang diberikan.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setError(null)
                setBookingCode('')
              }}
              className="rounded-xl"
            >
              Coba Lagi
            </Button>
          </motion.div>
        )}

        {booking && !loading && (
          <motion.div
            key="booking-details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-8"
          >
            {/* Status Summary Card */}
            <Card className="border border-border/50 shadow-md rounded-2xl overflow-hidden bg-card">
              <CardContent className="p-8 text-center">
                {getStatusIcon(booking.status)}
                <h2 className="text-2xl font-bold mt-4 mb-2 text-foreground">
                  Status: {booking.status === 'paid' ? 'Pembayaran Lunas' : booking.status === 'cancelled' ? 'Pemesanan Dibatalkan' : 'Menunggu Pembayaran'}
                </h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <span className="font-mono text-muted-foreground text-sm">Kode Booking:</span>
                  <span className="font-mono font-bold text-primary text-base">{booking.bookingCode}</span>
                  <button
                    onClick={() => handleCopy(booking.bookingCode)}
                    className="p-1.5 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors"
                    aria-label="Salin Kode Booking"
                  >
                    {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {booking.status === 'pending' && (
                  <div className="p-5 bg-amber-500/5 border border-amber-500/20 rounded-xl max-w-md mx-auto space-y-4">
                    <div>
                      <p className="text-sm text-amber-600 font-medium mb-1">Batas Waktu Pembayaran</p>
                      <p className="text-base font-bold text-foreground">
                        {format(new Date(booking.paymentDeadline), 'EEEE, d MMMM yyyy HH:mm', { locale: id })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Silakan selesaikan pembayaran sebelum batas waktu agar pemesanan tidak dibatalkan otomatis.
                      </p>
                    </div>

                    <div className="pt-3 border-t border-amber-500/10">
                      <Button
                        onClick={handlePayNow}
                        disabled={isProcessingPayment}
                        className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group relative overflow-hidden"
                      >
                        {isProcessingPayment ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Memproses...
                          </>
                        ) : !snapLoaded ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Memuat Payment Gateway...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 transition-transform group-hover:scale-110" />
                            Bayar Sekarang
                          </>
                        )}
                      </Button>
                      <div className="flex items-center justify-center gap-1 mt-2 text-[10px] text-muted-foreground">
                        <span>Didukung oleh</span>
                        <span className="font-semibold text-[#00AA13]">Midtrans</span>
                      </div>
                    </div>
                  </div>
                )}

                {booking.status === 'paid' && (
                  <div className="p-4 bg-success/5 border border-success/20 rounded-xl max-w-md mx-auto">
                    <p className="text-sm text-success font-medium mb-1">Selamat, Pemesanan Anda Telah Dikonfirmasi!</p>
                    <p className="text-xs text-muted-foreground">
                      Tim Airlangga Travel akan segera menghubungi Anda melalui nomor WhatsApp untuk koordinasi keberangkatan dan detail teknis perjalanan.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Grid Detail Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Product Info */}
              <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden bg-card">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="font-serif text-lg font-semibold flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Detail Paket Perjalanan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div>
                    <label className="text-xs text-muted-foreground uppercase font-medium">Nama Paket / Unit</label>
                    <p className="font-semibold text-foreground text-lg">{booking.tripTitle}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-medium flex items-center gap-1.5 mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        Tanggal Perjalanan
                      </label>
                      <p className="font-medium text-foreground">
                        {format(new Date(booking.departureDate), 'd MMMM yyyy', { locale: id })}
                      </p>
                    </div>

                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-medium flex items-center gap-1.5 mb-1">
                        <Users className="w-3.5 h-3.5" />
                        Jumlah Peserta
                      </label>
                      <p className="font-medium text-foreground">{booking.participants} Orang</p>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 flex justify-between items-center">
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-medium">Total Harga</label>
                      <p className="text-xl font-bold font-mono text-primary">{formatPrice(booking.totalPrice)}</p>
                    </div>
                    <div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              <Card className="border border-border/50 shadow-sm rounded-2xl overflow-hidden bg-card">
                <CardHeader className="border-b border-border/50 pb-4">
                  <CardTitle className="font-serif text-lg font-semibold flex items-center gap-2">
                    <User className="w-5 h-5 text-primary" />
                    Informasi Pelanggan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-medium">Nama Lengkap</label>
                      <p className="font-semibold text-foreground">{booking.customerName}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-medium">Email</label>
                      <p className="font-medium text-foreground break-all">{booking.email}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-medium">No. WhatsApp</label>
                      <p className="font-medium text-foreground">{booking.whatsapp}</p>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-4 flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <label className="text-xs text-muted-foreground uppercase font-medium">Waktu Pemesanan</label>
                      <p className="text-sm font-medium text-foreground">
                        {format(new Date(booking.createdAt), 'EEEE, d MMMM yyyy HH:mm', { locale: id })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Action Buttons */}
            {booking.status === 'pending' && (
              <div className="p-6 border border-border/50 rounded-2xl bg-secondary text-center space-y-4">
                <p className="font-medium text-foreground max-w-lg mx-auto">
                  Silakan selesaikan pembayaran Anda di atas, atau hubungi layanan pelanggan kami jika Anda membutuhkan bantuan atau ingin konfirmasi manual.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3">
                  <Button
                    asChild
                    variant="outline"
                    className="bg-background border-border hover:bg-muted text-foreground rounded-full px-8 h-12"
                  >
                    <a
                      href={`https://wa.me/6208111211143?text=${encodeURIComponent(`Halo Airlangga Travel, saya ingin konfirmasi pembayaran untuk kode booking ${booking.bookingCode}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Konfirmasi via WhatsApp
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navbar />
      {/* Spacer for Fixed Navbar */}
      <div className="h-20" />
      <div className="flex-1 py-12">
        <Suspense fallback={
          <div className="max-w-4xl mx-auto px-4 py-8 text-center py-20">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Memuat halaman...</p>
          </div>
        }>
          <TrackOrderContent />
        </Suspense>
      </div>
      <Footer />
    </main>
  )
}
