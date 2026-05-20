'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Plus,
  Trash2,
  Car,
  Users,
  Search,
  CheckCircle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { deleteCar } from './actions'

interface CarItem {
  id: string
  name: string
  type: string
  capacity: number
  pricePerDay: number
  image: string
  features: string[]
}

interface CarsClientProps {
  initialCars: CarItem[]
  isMockData: boolean
}

export default function CarsClient({ initialCars, isMockData }: CarsClientProps) {
  const [cars, setCars] = useState<CarItem[]>(initialCars)
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
    if (confirm('Apakah Anda yakin ingin menghapus armada kendaraan ini?') === false) return

    if (isMockData) {
      toast.warning('Mode Simulasi: Kendaraan dihapus di memori sementara')
      setCars((prev) => prev.filter((c) => c.id !== id))
      return
    }

    startTransition(async () => {
      const res = await deleteCar(id)
      if (res.success) {
        toast.success('Armada kendaraan berhasil dihapus!')
        setCars((prev) => prev.filter((c) => c.id !== id))
      } else {
        toast.error(res.error || 'Gagal menghapus kendaraan')
      }
    })
  }

  const filteredCars = cars.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.type.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Daftar Armada Rental
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Kelola data unit mobil, van, dan bus pariwisata yang aktif disewakan
          </p>
        </div>
        <Button
          onClick={() =>
            toast.info(
              isMockData
                ? 'Koneksikan database Supabase terlebih dahulu untuk menambahkan armada baru!'
                : 'Form pendaftaran unit armada baru sedang dikembangkan. Silakan gunakan DB admin tool Anda untuk menambah data langsung.'
            )
          }
          className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl h-11 px-6 font-medium flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Tambah Armada
        </Button>
      </div>

      {/* Search Filter */}
      <div className="bg-card border border-border p-4 rounded-2xl flex gap-4 items-center shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari unit kendaraan berdasarkan nama atau tipe..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-border rounded-xl"
          />
        </div>
      </div>

      {/* Cars Grid */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {filteredCars.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Kendaraan</th>
                  <th className="px-6 py-4">Tipe</th>
                  <th className="px-6 py-4">Kapasitas</th>
                  <th className="px-6 py-4">Fasilitas</th>
                  <th className="px-6 py-4">Harga Sewa / Hari</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCars.map((c) => (
                  <tr key={c.id} className="hover:bg-secondary/10">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-border shrink-0">
                          <Image src={c.image} alt={c.name} fill className="object-cover" />
                        </div>
                        <p className="font-semibold text-foreground leading-tight line-clamp-1">
                          {c.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="secondary" className="capitalize text-xs font-normal">
                        {c.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1 text-xs font-semibold text-foreground">
                        <Users className="w-3.5 h-3.5 text-primary shrink-0" />
                        {c.capacity} Penumpang
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {c.features.map((feat) => (
                          <span
                            key={feat}
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-secondary border border-border rounded text-[10px] text-muted-foreground"
                          >
                            <CheckCircle className="w-2.5 h-2.5 text-success shrink-0" />
                            {feat}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-primary block">
                        {formatPrice(c.pricePerDay)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(c.id)}
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
              <Car className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground">
              Tidak Ada Armada Kendaraan
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Belum ada data unit mobil rental yang didaftarkan.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
