'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  Mail,
  Phone,
  Calendar,
  Users,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateBookingStatus } from './actions'

interface BookingItem {
  id: string
  bookingCode: string
  customerName: string
  email: string
  whatsapp: string
  bookingType: string
  departureDate: string
  totalPrice: number
  status: string
  participants: number
  createdAt: string
}

interface BookingsClientProps {
  initialBookings: BookingItem[]
  isMockData: boolean
}

export default function BookingsClient({ initialBookings, isMockData }: BookingsClientProps) {
  const [bookings, setBookings] = useState<BookingItem[]>(initialBookings)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [isPending, startTransition] = useTransition()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleStatusChange = async (bookingId: string, newStatus: 'pending' | 'dp_paid' | 'paid' | 'cancelled') => {
    if (isMockData) {
      toast.warning('Mode Simulasi: Perubahan status hanya disimpan di memori sementara')
      setBookings((prev) =>
        newStatus === 'cancelled'
          ? prev.filter((b) => b.id !== bookingId)
          : prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
      )
      return
    }

    startTransition(async () => {
      const result = await updateBookingStatus(bookingId, newStatus)
      if (result.success) {
        toast.success(newStatus === 'cancelled' ? 'Pemesanan berhasil dibatalkan' : `Status pemesanan berhasil diubah menjadi ${newStatus === 'dp_paid' ? 'DP Terbayar' : newStatus === 'paid' ? 'Lunas' : newStatus}`)
        setBookings((prev) =>
          newStatus === 'cancelled'
            ? prev.filter((b) => b.id !== bookingId)
            : prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        )
      } else {
        toast.error(result.error || 'Gagal mengubah status pemesanan')
      }
    })
  }

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.whatsapp.includes(searchQuery)

    const matchesStatus = statusFilter === 'all' || b.status === statusFilter
    const matchesType = typeFilter === 'all' || b.bookingType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Daftar Pemesanan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Lihat dan kelola semua reservasi open trip & car rental
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center shadow-sm">
        {/* Search */}
        <div className="relative w-full md:flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari kode booking, nama, email, whatsapp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-border rounded-xl"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40 h-11 rounded-xl">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="dp_paid">DP Terbayar</SelectItem>
              <SelectItem value="paid">Lunas (Paid)</SelectItem>
            </SelectContent>
          </Select>

          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-40 h-11 rounded-xl">
              <SelectValue placeholder="Tipe Booking" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="trip">Open Trip</SelectItem>
              <SelectItem value="car">Rental Mobil</SelectItem>
            </SelectContent>
          </Select>

          {/* Reset Filters */}
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
              setTypeFilter('all')
            }}
            className="h-11 px-4 hover:bg-secondary rounded-xl text-sm"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {filteredBookings.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredBookings.map((b) => (
              <motion.div
                key={b.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-secondary/10 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-6"
              >
                {/* Booking Core Info */}
                <div className="space-y-4 lg:max-w-md">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-foreground bg-secondary px-3 py-1 rounded-lg border border-border">
                      {b.bookingCode}
                    </span>
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
                    <span className="text-xs text-muted-foreground">
                      Dipesan: {new Date(b.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-serif font-semibold text-lg text-foreground">
                      {b.customerName}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5 text-primary" />
                        {b.email}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-primary" />
                        {b.whatsapp}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Booking Detail Metadata */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 lg:flex-1 lg:max-w-xl">
                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground block">Tanggal Keberangkatan</span>
                    <span className="font-medium text-sm text-foreground flex items-center gap-1.5 mt-0.5">
                      <Calendar className="w-4 h-4 text-primary shrink-0" />
                      {b.departureDate}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-xs text-muted-foreground block">Pax / Durasi</span>
                    <span className="font-medium text-sm text-foreground flex items-center gap-1.5 mt-0.5">
                      <Users className="w-4 h-4 text-primary shrink-0" />
                      {b.bookingType === 'trip' ? `${b.participants} Orang` : `${b.participants} Hari`}
                    </span>
                  </div>

                  <div className="col-span-2 sm:col-span-1 space-y-0.5">
                    <span className="text-xs text-muted-foreground block">Total Pembayaran</span>
                    <span className="font-mono font-bold text-base text-primary block mt-0.5">
                      {formatPrice(b.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Actions & Current Status */}
                <div className="flex flex-row lg:flex-col items-center justify-between lg:justify-center gap-4 border-t lg:border-t-0 pt-4 lg:pt-0 border-border">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground hidden lg:block text-right">Status saat ini:</span>
                    <Badge
                      className={
                        b.status === 'paid'
                          ? 'bg-success text-success-foreground'
                          : b.status === 'dp_paid'
                          ? 'bg-amber-500 text-white'
                          : b.status === 'pending'
                          ? 'bg-zinc-500 text-white'
                          : 'bg-destructive text-destructive-foreground'
                      }
                    >
                      {b.status === 'paid' ? 'Lunas' : b.status === 'dp_paid' ? 'DP Terbayar' : b.status === 'pending' ? 'Pending' : 'Batal'}
                    </Badge>
                  </div>

                  {/* Actions Dropdown / Buttons */}
                  <div className="flex items-center gap-1.5">
                    {b.status === 'dp_paid' ? (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleStatusChange(b.id, 'paid')}
                        disabled={isPending}
                        className="rounded-lg h-9 text-xs bg-success hover:bg-success/90 text-success-foreground flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Pelunasan
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusChange(b.id, 'paid')}
                        disabled={b.status === 'paid' || isPending}
                        className="rounded-lg h-9 text-xs border-success/30 hover:bg-success/10 hover:text-success text-success-dark flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Lunas
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(b.id, 'cancelled')}
                      disabled={b.status === 'cancelled' || isPending}
                      className="rounded-lg h-9 text-xs border-destructive/30 hover:bg-destructive/10 hover:text-destructive text-destructive flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Batal
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground">
              Tidak Ada Pemesanan Ditemukan
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Coba gunakan kata kunci pencarian atau filter yang berbeda
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
