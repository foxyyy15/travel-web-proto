'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Plus,
  Trash2,
  Compass,
  MapPin,
  Clock,
  Users,
  Search,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteTrip } from './actions'

interface TripItem {
  id: string
  title: string
  slug: string
  destination: string
  duration: string
  price: number
  originalPrice?: number
  image: string
  availableSlots: number
  totalSlots: number
  category: 'domestic' | 'international'
  featured: boolean
}

interface TripsClientProps {
  initialTrips: TripItem[]
  isMockData: boolean
}

export default function TripsClient({ initialTrips, isMockData }: TripsClientProps) {
  const [trips, setTrips] = useState<TripItem[]>(initialTrips)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus paket open trip ini?') === false) return

    if (isMockData) {
      toast.warning('Mode Simulasi: Trip dihapus di memori sementara')
      setTrips((prev) => prev.filter((t) => t.id !== id))
      return
    }

    startTransition(async () => {
      const res = await deleteTrip(id)
      if (res.success) {
        toast.success('Paket open trip berhasil dihapus!')
        setTrips((prev) => prev.filter((t) => t.id !== id))
      } else {
        toast.error(res.error || 'Gagal menghapus open trip')
      }
    })
  }

  const filteredTrips = trips.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.destination.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Daftar Paket Open Trip
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Publish destinasi baru dan kelola jadwal keberangkatan open trip
          </p>
        </div>
        <Button
          onClick={() =>
            toast.info(
              isMockData
                ? 'Koneksikan database Supabase terlebih dahulu untuk menambahkan paket baru!'
                : 'Form pembuatan trip baru sedang dikembangkan. Silakan gunakan DB admin tool Anda untuk menambah data langsung.'
            )
          }
          className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl h-11 px-6 font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Paket
        </Button>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border p-4 rounded-2xl flex gap-4 items-center shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari nama paket open trip atau destinasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-border rounded-xl"
          />
        </div>
      </div>

      {/* Trips Cards/Table */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {filteredTrips.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Trip</th>
                  <th className="px-6 py-4">Destinasi</th>
                  <th className="px-6 py-4">Durasi</th>
                  <th className="px-6 py-4">Kategori</th>
                  <th className="px-6 py-4">Sisa Slot</th>
                  <th className="px-6 py-4">Harga / Pax</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTrips.map((t) => (
                  <tr key={t.id} className="hover:bg-secondary/10">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-border shrink-0">
                          <Image src={t.image} alt={t.title} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight line-clamp-1">
                            {t.title}
                          </p>
                          {t.featured && (
                            <Badge className="bg-primary/10 text-primary border-primary/20 mt-1 h-5 text-[9px]">
                              Featured
                            </Badge>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        {t.destination}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-primary shrink-0" />
                        {t.duration}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="capitalize text-xs font-normal">
                        {t.category}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                        <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                        {t.availableSlots} / {t.totalSlots}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="font-mono font-bold text-primary block">
                          {formatPrice(t.price)}
                        </span>
                        {t.originalPrice && (
                          <span className="text-[10px] text-muted-foreground line-through line-clamp-1 block">
                            {formatPrice(t.originalPrice)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(t.id)}
                        disabled={isPending}
                        className="rounded-lg h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 bg-secondary rounded-full flex items-center justify-center">
              <Compass className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground">
              Tidak Ada Paket Open Trip
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Belum ada data paket open trip atau coba ubah kata kunci pencarian Anda
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
