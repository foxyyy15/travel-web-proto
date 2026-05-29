import { prisma } from '@/lib/prisma'
import {
  Banknote,
  FileSpreadsheet,
  Compass,
  MessageSquare,
  AlertTriangle,
  Database,
  ArrowRight,
  TrendingUp,
  Car,
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

interface DashboardStats {
  totalRevenue: number
  totalBookings: number
  activeTrips: number
  pendingTestimonials: number
  isMockData: boolean
  dpBookingsCount: number
  paidBookingsCount: number
  totalCars: number
}

// Fetch helper with fallback to mock statistics if database connection fails
async function getDashboardData(): Promise<{
  stats: DashboardStats
  recentBookings: any[]
}> {
  if (!process.env.DATABASE_URL) {
    return {
      stats: {
        totalRevenue: 25000000,
        totalBookings: 2,
        activeTrips: 5,
        pendingTestimonials: 2,
        isMockData: true,
        dpBookingsCount: 1,
        paidBookingsCount: 1,
        totalCars: 4,
      },
      recentBookings: [
        {
          id: 'mock-1',
          bookingCode: 'TRP-100293',
          customerName: 'Ahmad Faisal',
          email: 'ahmad@example.com',
          whatsapp: '081234567890',
          bookingType: 'trip',
          departureDate: '2026-06-15',
          totalPrice: 25000000,
          status: 'paid',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'mock-2',
          bookingCode: 'CAR-100294',
          customerName: 'Clara Shinta',
          email: 'clara@example.com',
          whatsapp: '089876543210',
          bookingType: 'car',
          departureDate: '2026-05-28',
          totalPrice: 1600000,
          status: 'dp_paid',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
      ],
    }
  }

  try {
    const [bookings, tripsCount, pendingTestimonialsCount, carsCount] = await Promise.all([
      prisma.booking.findMany({
        where: {
          status: {
            in: ['dp_paid', 'paid'],
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.trip.count(),
      prisma.testimonial.count({
        where: { isApproved: false },
      }),
      prisma.car.count(),
    ])

    const paidBookings = bookings.filter((b) => b.status === 'paid')
    const dpBookings = bookings.filter((b) => b.status === 'dp_paid')
    const totalRevenue = paidBookings.reduce((sum, b) => sum + b.totalPrice, 0)

    const recentBookings = bookings.slice(0, 5).map((b) => ({
      id: b.id,
      bookingCode: b.bookingCode,
      customerName: b.customerName,
      email: b.email,
      whatsapp: b.whatsapp,
      bookingType: b.bookingType,
      departureDate: b.departureDate,
      totalPrice: b.totalPrice,
      status: b.status,
      createdAt: b.createdAt.toISOString(),
    }))

    return {
      stats: {
        totalRevenue,
        totalBookings: bookings.length,
        activeTrips: tripsCount,
        pendingTestimonials: pendingTestimonialsCount,
        isMockData: false,
        dpBookingsCount: dpBookings.length,
        paidBookingsCount: paidBookings.length,
        totalCars: carsCount,
      },
      recentBookings,
    }
  } catch (error) {
    console.warn('Dashboard DB load failed, fallback to mock data:', error)
    return {
      stats: {
        totalRevenue: 26600000,
        totalBookings: 2,
        activeTrips: 5,
        pendingTestimonials: 2,
        isMockData: true,
        dpBookingsCount: 1,
        paidBookingsCount: 1,
        totalCars: 4,
      },
      recentBookings: [
        {
          id: 'mock-1',
          bookingCode: 'TRP-100293',
          customerName: 'Ahmad Faisal',
          email: 'ahmad@example.com',
          whatsapp: '081234567890',
          bookingType: 'trip',
          departureDate: '2026-06-15',
          totalPrice: 25000000,
          status: 'paid',
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'mock-2',
          bookingCode: 'CAR-100294',
          customerName: 'Clara Shinta',
          email: 'clara@example.com',
          whatsapp: '089876543210',
          bookingType: 'car',
          departureDate: '2026-05-28',
          totalPrice: 1600000,
          status: 'dp_paid',
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
      ],
    }
  }
}

export default async function AdminDashboardPage() {
  const { stats, recentBookings } = await getDashboardData()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  return (
    <div className="space-y-6">
      {/* DB Connection Alert */}
      {stats.isMockData && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-500 p-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm">Mode Simulasi Aktif</h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Aplikasi belum terhubung ke database Supabase (variabel `DATABASE_URL` belum terkonfigurasi di file `.env`).
              Kami menampilkan data demonstrasi yang bersifat read-only.
            </p>
          </div>
        </div>
      )}

      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Ringkasan Bisnis
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pantau performa penjualan Airlangga Travel hari ini
        </p>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        {/* Revenue Card */}
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total Pendapatan
            </p>
            <h3 className="font-mono text-xl font-bold text-foreground">
              {formatPrice(stats.totalRevenue)}
            </h3>
            <span className="inline-flex items-center gap-1 text-[10px] text-success bg-success/10 px-2 py-0.5 rounded-full font-medium">
              <TrendingUp className="w-3 h-3" />
              +12% bln ini
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Banknote className="w-6 h-6" />
          </div>
        </div>

        {/* Bookings Card */}
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Total Pemesanan
            </p>
            <h3 className="font-mono text-2xl font-bold text-foreground">
              {stats.totalBookings}
            </h3>
            <span className="text-[10px] text-muted-foreground">
              Lunas: {stats.paidBookingsCount} | DP Terbayar: {stats.dpBookingsCount}
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
        </div>

        {/* Trips Card */}
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Paket Open Trip
            </p>
            <h3 className="font-mono text-2xl font-bold text-foreground">
              {stats.activeTrips}
            </h3>
            <span className="text-[10px] text-muted-foreground">
              Telah dipublish secara publik
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Compass className="w-6 h-6" />
          </div>
        </div>

        {/* Cars Card */}
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Armada Rental
            </p>
            <h3 className="font-mono text-2xl font-bold text-foreground">
              {stats.totalCars}
            </h3>
            <span className="text-[10px] text-muted-foreground">
              Mobil aktif disewakan
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Car className="w-6 h-6" />
          </div>
        </div>

        {/* Testimonial Card */}
        <div className="bg-card border border-border p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
              Moderasi Ulasan
            </p>
            <h3 className="font-mono text-2xl font-bold text-foreground">
              {stats.pendingTestimonials}
            </h3>
            {stats.pendingTestimonials > 0 ? (
              <span className="inline-flex items-center gap-1 text-[10px] text-destructive bg-destructive/10 px-2 py-0.5 rounded-full font-medium">
                Perlu Review
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground">Semua bersih</span>
            )}
          </div>
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <MessageSquare className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Recent Bookings & DB Setup Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bookings Table */}
        <div className="lg:col-span-2 bg-card border border-border rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <div>
              <h3 className="font-serif font-bold text-lg text-foreground">
                Pemesanan Terbaru
              </h3>
              <p className="text-xs text-muted-foreground">
                Aktivitas transaksi masuk paling awal
              </p>
            </div>
            <Button asChild size="sm" variant="ghost" className="gap-2">
              <Link href="/admin/bookings">
                Semua Bookings
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Kode</th>
                  <th className="px-6 py-4">Pelanggan</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Keberangkatan</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-secondary/10">
                    <td className="px-6 py-4 font-mono font-semibold text-xs text-foreground">
                      {b.bookingCode}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-foreground">{b.customerName}</p>
                        <p className="text-[10px] text-muted-foreground">{b.whatsapp}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={
                          b.bookingType === 'trip'
                            ? 'bg-blue-500/5 text-blue-500 border-blue-500/20'
                            : 'bg-indigo-500/5 text-indigo-500 border-indigo-500/20'
                        }
                      >
                        {b.bookingType === 'trip' ? 'Trip' : 'Mobil'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs">
                      {b.departureDate}
                    </td>
                    <td className="px-6 py-4 font-semibold font-mono text-foreground">
                      {formatPrice(b.totalPrice)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge
                        className={
                          b.status === 'paid'
                            ? 'bg-success text-success-foreground hover:bg-success'
                            : b.status === 'dp_paid'
                            ? 'bg-amber-500 text-white hover:bg-amber-500'
                            : b.status === 'pending'
                            ? 'bg-zinc-500 text-white hover:bg-zinc-500'
                            : 'bg-destructive text-destructive-foreground hover:bg-destructive'
                        }
                      >
                        {b.status === 'paid' ? 'Lunas' : b.status === 'dp_paid' ? 'DP Terbayar' : b.status === 'pending' ? 'Pending' : 'Batal'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 border-t border-border text-center text-xs text-muted-foreground bg-secondary/10">
            Terakhir diupdate: Baru saja
          </div>
        </div>

        {/* Database setup instructions (Only shown or highlighted if mock data is active) */}
        <div className="bg-card border border-border rounded-2xl shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-foreground">
                Koneksi Supabase
              </h3>
              <p className="text-xs text-muted-foreground">
                Langkah-langkah mengaktifkan database
              </p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-card-foreground">
            <div className="p-3 bg-secondary rounded-xl space-y-2 border border-border">
              <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                1. Salin Connection String
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Buat database PostgreSQL di Supabase, lalu salin URL koneksi (Transaction Mode) ke dalam file `.env` Anda sebagai `DATABASE_URL`.
              </p>
            </div>

            <div className="p-3 bg-secondary rounded-xl space-y-2 border border-border">
              <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                2. Jalankan Sinkronisasi Skema
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Buka terminal di VSCode dan jalankan perintah:
                <code className="block mt-2 p-1.5 bg-background border border-border rounded font-mono text-[10px] text-primary">
                  npx prisma db push
                </code>
              </p>
            </div>

            <div className="p-3 bg-secondary rounded-xl space-y-2 border border-border">
              <h4 className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-primary" />
                3. Seed Data Awal
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Setelah skema terkirim, jalankan perintah berikut untuk mengisi data default trips, mobil, dan akun admin:
                <code className="block mt-2 p-1.5 bg-background border border-border rounded font-mono text-[10px] text-primary">
                  npx prisma db seed
                </code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
