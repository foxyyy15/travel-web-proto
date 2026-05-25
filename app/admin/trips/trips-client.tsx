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
  Pencil,
  Calendar,
  Image as ImageIcon,
  Check,
  X,
  ListPlus,
  Info,
  Layers,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { deleteTrip, createTrip, updateTrip } from './actions'
import type { Trip, ItineraryDay } from '@/lib/types'

interface TripsClientProps {
  initialTrips: Trip[]
  isMockData: boolean
}

const emptyFormValues = {
  title: '',
  slug: '',
  destination: '',
  duration: '',
  price: 0,
  originalPrice: '' as string | number | undefined,
  image: '',
  images: [] as string[],
  availableSlots: 10,
  totalSlots: 10,
  departureDates: [] as string[],
  meetingPoint: '',
  itinerary: [] as ItineraryDay[],
  includes: [] as string[],
  excludes: [] as string[],
  category: 'domestic' as 'domestic' | 'international',
  featured: false,
  depositPercentage: 100,
}

export default function TripsClient({ initialTrips, isMockData }: TripsClientProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isSubmitPending, startSubmitTransition] = useTransition()
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [formValues, setFormValues] = useState(emptyFormValues)
  const [activeTab, setActiveTab] = useState('info')

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  // Auto generate slug from title
  const handleTitleChange = (val: string) => {
    const generatedSlug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
    
    setFormValues((prev) => ({
      ...prev,
      title: val,
      slug: prev.slug === generateSlug(prev.title) || prev.slug === '' ? generatedSlug : prev.slug,
    }))
  }

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const handleCreateClick = () => {
    setEditingTrip(null)
    setFormValues(emptyFormValues)
    setActiveTab('info')
    setIsFormOpen(true)
  }

  const handleEditClick = (trip: Trip) => {
    setEditingTrip(trip)
    setFormValues({
      title: trip.title,
      slug: trip.slug,
      destination: trip.destination,
      duration: trip.duration,
      price: trip.price,
      originalPrice: trip.originalPrice ?? '',
      image: trip.image,
      images: trip.images || [],
      availableSlots: trip.availableSlots,
      totalSlots: trip.totalSlots,
      departureDates: trip.departureDates || [],
      meetingPoint: trip.meetingPoint || '',
      itinerary: trip.itinerary || [],
      includes: trip.includes || [],
      excludes: trip.excludes || [],
      category: trip.category,
      featured: trip.featured || false,
      depositPercentage: trip.depositPercentage ?? 100,
    })
    setActiveTab('info')
    setIsFormOpen(true)
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

  // List Handlers: Includes
  const handleAddInclude = () => {
    setFormValues((prev) => ({ ...prev, includes: [...prev.includes, ''] }))
  }
  const handleRemoveInclude = (idx: number) => {
    setFormValues((prev) => ({ ...prev, includes: prev.includes.filter((_, i) => i !== idx) }))
  }
  const handleIncludeChange = (idx: number, val: string) => {
    setFormValues((prev) => {
      const copy = [...prev.includes]
      copy[idx] = val
      return { ...prev, includes: copy }
    })
  }

  // List Handlers: Excludes
  const handleAddExclude = () => {
    setFormValues((prev) => ({ ...prev, excludes: [...prev.excludes, ''] }))
  }
  const handleRemoveExclude = (idx: number) => {
    setFormValues((prev) => ({ ...prev, excludes: prev.excludes.filter((_, i) => i !== idx) }))
  }
  const handleExcludeChange = (idx: number, val: string) => {
    setFormValues((prev) => {
      const copy = [...prev.excludes]
      copy[idx] = val
      return { ...prev, excludes: copy }
    })
  }

  // List Handlers: Departure Dates
  const handleAddDepartureDate = () => {
    setFormValues((prev) => ({ ...prev, departureDates: [...prev.departureDates, ''] }))
  }
  const handleRemoveDepartureDate = (idx: number) => {
    setFormValues((prev) => ({ ...prev, departureDates: prev.departureDates.filter((_, i) => i !== idx) }))
  }
  const handleDepartureDateChange = (idx: number, val: string) => {
    setFormValues((prev) => {
      const copy = [...prev.departureDates]
      copy[idx] = val
      return { ...prev, departureDates: copy }
    })
  }

  // List Handlers: Gallery Images
  const handleAddGalleryImage = () => {
    setFormValues((prev) => ({ ...prev, images: [...prev.images, ''] }))
  }
  const handleRemoveGalleryImage = (idx: number) => {
    setFormValues((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }))
  }
  const handleGalleryImageChange = (idx: number, val: string) => {
    setFormValues((prev) => {
      const copy = [...prev.images]
      copy[idx] = val
      return { ...prev, images: copy }
    })
  }

  // List Handlers: Itineraries
  const handleAddItineraryDay = () => {
    setFormValues((prev) => ({
      ...prev,
      itinerary: [
        ...prev.itinerary,
        {
          day: prev.itinerary.length + 1,
          title: '',
          description: '',
          activities: [''],
        },
      ],
    }))
  }
  const handleRemoveItineraryDay = (idx: number) => {
    setFormValues((prev) => {
      const filtered = prev.itinerary.filter((_, i) => i !== idx)
      const reindexed = filtered.map((dayObj, i) => ({ ...dayObj, day: i + 1 }))
      return { ...prev, itinerary: reindexed }
    })
  }
  const handleItineraryDayChange = (idx: number, field: 'title' | 'description', val: string) => {
    setFormValues((prev) => {
      const copy = [...prev.itinerary]
      copy[idx] = { ...copy[idx], [field]: val }
      return { ...prev, itinerary: copy }
    })
  }

  // Itinerary Activity Handlers
  const handleAddActivity = (dayIdx: number) => {
    setFormValues((prev) => {
      const copy = [...prev.itinerary]
      copy[dayIdx] = { ...copy[dayIdx], activities: [...copy[dayIdx].activities, ''] }
      return { ...prev, itinerary: copy }
    })
  }
  const handleRemoveActivity = (dayIdx: number, actIdx: number) => {
    setFormValues((prev) => {
      const copy = [...prev.itinerary]
      copy[dayIdx] = {
        ...copy[dayIdx],
        activities: copy[dayIdx].activities.filter((_, i) => i !== actIdx),
      }
      return { ...prev, itinerary: copy }
    })
  }
  const handleActivityChange = (dayIdx: number, actIdx: number, val: string) => {
    setFormValues((prev) => {
      const copy = [...prev.itinerary]
      const actsCopy = [...copy[dayIdx].activities]
      actsCopy[actIdx] = val
      copy[dayIdx] = { ...copy[dayIdx], activities: actsCopy }
      return { ...prev, itinerary: copy }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (
      !formValues.title ||
      !formValues.slug ||
      !formValues.destination ||
      !formValues.duration ||
      !formValues.image ||
      !formValues.meetingPoint
    ) {
      toast.error('Mohon isi semua field wajib yang diberi tanda bintang (*)')
      return
    }

    if (formValues.price <= 0) {
      toast.error('Harga paket harus lebih besar dari 0')
      return
    }

    const submissionData = {
      title: formValues.title,
      slug: formValues.slug,
      destination: formValues.destination,
      duration: formValues.duration,
      price: Number(formValues.price),
      originalPrice: formValues.originalPrice ? Number(formValues.originalPrice) : undefined,
      image: formValues.image,
      images: formValues.images.filter((img) => img.trim() !== ''),
      availableSlots: Number(formValues.availableSlots),
      totalSlots: Number(formValues.totalSlots),
      departureDates: formValues.departureDates.filter((d) => d.trim() !== ''),
      meetingPoint: formValues.meetingPoint,
      itinerary: formValues.itinerary.map((dayObj) => ({
        day: Number(dayObj.day),
        title: dayObj.title,
        description: dayObj.description,
        activities: dayObj.activities.filter((a) => a.trim() !== ''),
      })),
      includes: formValues.includes.filter((inc) => inc.trim() !== ''),
      excludes: formValues.excludes.filter((exc) => exc.trim() !== ''),
      category: formValues.category,
      featured: formValues.featured,
      depositPercentage: Number(formValues.depositPercentage),
    }

    if (isMockData) {
      if (editingTrip) {
        toast.warning('Mode Simulasi: Data paket diperbarui di memori sementara')
        setTrips((prev) =>
          prev.map((t) => (t.id === editingTrip.id ? { ...submissionData, id: editingTrip.id } as Trip : t))
        )
      } else {
        toast.warning('Mode Simulasi: Paket baru ditambahkan di memori sementara')
        const newId = crypto.randomUUID()
        setTrips((prev) => [{ ...submissionData, id: newId } as Trip, ...prev])
      }
      setIsFormOpen(false)
      return
    }

    startSubmitTransition(async () => {
      if (editingTrip) {
        const res = await updateTrip(editingTrip.id, submissionData)
        if (res.success) {
          toast.success('Paket open trip berhasil diperbarui!')
          setTrips((prev) =>
            prev.map((t) => (t.id === editingTrip.id ? { ...submissionData, id: editingTrip.id } as Trip : t))
          )
          setIsFormOpen(false)
        } else {
          toast.error(res.error || 'Gagal memperbarui paket open trip')
        }
      } else {
        const res = await createTrip(submissionData)
        if (res.success) {
          toast.success('Paket open trip baru berhasil dibuat!')
          const newId = (res as any).data?.id || crypto.randomUUID()
          setTrips((prev) => [{ ...submissionData, id: newId } as Trip, ...prev])
          setIsFormOpen(false)
        } else {
          toast.error(res.error || 'Gagal membuat paket open trip baru')
        }
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
          onClick={handleCreateClick}
          className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl h-11 px-6 font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
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
                          {t.image ? (
                            <Image src={t.image} alt={t.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-secondary flex items-center justify-center">
                              <Compass className="w-5 h-5 text-muted-foreground" />
                            </div>
                          )}
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
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditClick(t)}
                          disabled={isPending}
                          className="rounded-lg h-9 w-9 text-muted-foreground hover:bg-secondary hover:text-foreground shrink-0 cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(t.id)}
                          disabled={isPending}
                          className="rounded-lg h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

      {/* Add / Edit Dialog Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 gap-0">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-2xl font-serif font-bold text-foreground">
              {editingTrip ? 'Edit Paket Open Trip' : 'Tambah Paket Open Trip'}
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              {editingTrip
                ? 'Perbarui rincian, harga, fasilitas, dan itinerary paket open trip Anda'
                : 'Lengkapi formulir di bawah ini untuk merilis destinasi open trip baru'}
            </p>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full justify-start border-b border-border bg-transparent rounded-none h-11 p-0 gap-6">
                <TabsTrigger
                  value="info"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 pt-2 font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Info className="w-4 h-4" />
                  Info Utama
                </TabsTrigger>
                <TabsTrigger
                  value="dates"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 pt-2 font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  Tanggal & Slot
                </TabsTrigger>
                <TabsTrigger
                  value="media"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 pt-2 font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4" />
                  Media Galeri
                </TabsTrigger>
                <TabsTrigger
                  value="services"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 pt-2 font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  Layanan & Fasilitas
                </TabsTrigger>
                <TabsTrigger
                  value="itinerary"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 pt-2 font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <ListPlus className="w-4 h-4" />
                  Itinerary
                </TabsTrigger>
              </TabsList>

              {/* Tab 1: Info Utama */}
              <TabsContent value="info" className="py-4 space-y-4 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="title">Judul Paket Open Trip *</Label>
                    <Input
                      id="title"
                      value={formValues.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Contoh: Open Trip Labuan Bajo Phinisi"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="slug">Slug (URL Path) *</Label>
                    <Input
                      id="slug"
                      value={formValues.slug}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, slug: generateSlug(e.target.value) }))}
                      placeholder="Contoh: open-trip-labuan-bajo-phinisi"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="destination">Destinasi *</Label>
                    <Input
                      id="destination"
                      value={formValues.destination}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, destination: e.target.value }))}
                      placeholder="Contoh: Labuan Bajo, Flores"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="duration">Durasi *</Label>
                    <Input
                      id="duration"
                      value={formValues.duration}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, duration: e.target.value }))}
                      placeholder="Contoh: 3 Hari 2 Malam"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="category">Kategori Perjalanan *</Label>
                    <select
                      id="category"
                      value={formValues.category}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, category: e.target.value as 'domestic' | 'international' }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="domestic">Domestik</option>
                      <option value="international">Internasional</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="price">Harga Paket (IDR) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formValues.price || ''}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, price: Number(e.target.value) }))}
                      placeholder="Harga dalam IDR, contoh: 3500000"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="originalPrice">Harga Coret / Asli (Opsional)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formValues.originalPrice || ''}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, originalPrice: e.target.value ? Number(e.target.value) : undefined }))}
                      placeholder="Harga coret sebelum diskon"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="depositPercentage">Persentase Down Payment (DP) *</Label>
                    <select
                      id="depositPercentage"
                      value={formValues.depositPercentage ?? 100}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, depositPercentage: Number(e.target.value) }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value={100}>Lunas Langsung (100%)</option>
                      <option value={50}>DP 50%</option>
                      <option value={30}>DP 30%</option>
                      <option value={20}>DP 20%</option>
                      <option value={10}>DP 10%</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="featured"
                    checked={formValues.featured}
                    onCheckedChange={(checked) => setFormValues((prev) => ({ ...prev, featured: checked }))}
                  />
                  <Label htmlFor="featured" className="font-medium cursor-pointer">
                    Tampilkan di Rekomendasi Utama (Featured Trip)
                  </Label>
                </div>
              </TabsContent>

              {/* Tab 2: Tanggal & Slot */}
              <TabsContent value="dates" className="py-4 space-y-4 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 md:col-span-2">
                    <Label htmlFor="meetingPoint">Titik Kumpul (Meeting Point) *</Label>
                    <Input
                      id="meetingPoint"
                      value={formValues.meetingPoint}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, meetingPoint: e.target.value }))}
                      placeholder="Contoh: Bandara Komodo Labuan Bajo"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1.5">
                      <Label htmlFor="availableSlots">Sisa Slot *</Label>
                      <Input
                        id="availableSlots"
                        type="number"
                        value={formValues.availableSlots}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, availableSlots: Number(e.target.value) }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="totalSlots">Total Slot *</Label>
                      <Input
                        id="totalSlots"
                        type="number"
                        value={formValues.totalSlots}
                        onChange={(e) => setFormValues((prev) => ({ ...prev, totalSlots: Number(e.target.value) }))}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Departure Dates List */}
                <div className="space-y-2 border border-border p-4 rounded-xl">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <Label className="font-semibold text-base">Tanggal Keberangkatan</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddDepartureDate}
                      className="h-8 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Tanggal
                    </Button>
                  </div>

                  {formValues.departureDates.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      {formValues.departureDates.map((date, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Input
                            type="date"
                            value={date}
                            onChange={(e) => handleDepartureDateChange(idx, e.target.value)}
                            required
                          />
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveDepartureDate(idx)}
                            className="text-destructive hover:bg-destructive/10 shrink-0"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      Belum ada tanggal keberangkatan yang dimasukkan. Klik tombol di atas untuk menambah.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Tab 3: Media Galeri */}
              <TabsContent value="media" className="py-4 space-y-4 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                  <div className="md:col-span-2 space-y-1.5">
                    <Label htmlFor="image">URL Gambar Utama *</Label>
                    <Input
                      id="image"
                      value={formValues.image}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, image: e.target.value }))}
                      placeholder="Masukkan URL foto dari Unsplash atau penyimpanan lain"
                      required
                    />
                  </div>
                  <div>
                    <Label>Pratinjau Gambar Utama</Label>
                    {formValues.image ? (
                      <div className="relative w-full h-24 rounded-lg overflow-hidden border border-border mt-1.5 bg-secondary">
                        <img
                          src={formValues.image}
                          alt="Main Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            ;(e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Gambar+Rusak'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-24 rounded-lg border border-dashed border-border mt-1.5 flex items-center justify-center text-xs text-muted-foreground">
                        Belum ada gambar
                      </div>
                    )}
                  </div>
                </div>

                {/* Gallery Images List */}
                <div className="space-y-2 border border-border p-4 rounded-xl">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <Label className="font-semibold text-base">Galeri Foto Tambahan</Label>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleAddGalleryImage}
                      className="h-8 flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Tambah Foto
                    </Button>
                  </div>

                  {formValues.images.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      {formValues.images.map((url, idx) => (
                        <div key={idx} className="flex gap-4 items-start">
                          <div className="flex-1 space-y-1">
                            <Input
                              value={url}
                              onChange={(e) => handleGalleryImageChange(idx, e.target.value)}
                              placeholder="Masukkan URL foto tambahan..."
                              required
                            />
                          </div>
                          {url && (
                            <div className="relative w-20 h-10 rounded-lg overflow-hidden border border-border bg-secondary shrink-0">
                              <img
                                src={url}
                                alt="Gallery Preview"
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  ;(e.target as HTMLImageElement).src = 'https://placehold.co/600x400?text=Error'
                                }}
                              />
                            </div>
                          )}
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemoveGalleryImage(idx)}
                            className="text-destructive hover:bg-destructive/10 shrink-0 mt-0.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-6">
                      Belum ada foto galeri tambahan. Klik tombol di atas untuk menambah.
                    </p>
                  )}
                </div>
              </TabsContent>

              {/* Tab 4: Layanan & Fasilitas */}
              <TabsContent value="services" className="py-4 space-y-4 outline-none">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Includes List */}
                  <div className="space-y-2 border border-border p-4 rounded-xl">
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <Label className="font-semibold text-base text-success flex items-center gap-1.5">
                        <Check className="w-5 h-5" />
                        Sudah Termasuk (Includes)
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddInclude}
                        className="h-8 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah
                      </Button>
                    </div>

                    {formValues.includes.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        {formValues.includes.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              value={item}
                              onChange={(e) => handleIncludeChange(idx, e.target.value)}
                              placeholder="Contoh: Tiket Pesawat PP Jakarta-Bali"
                              required
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveInclude(idx)}
                              className="text-destructive hover:bg-destructive/10 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-6">
                        Belum ada item fasilitas yang termasuk.
                      </p>
                    )}
                  </div>

                  {/* Excludes List */}
                  <div className="space-y-2 border border-border p-4 rounded-xl">
                    <div className="flex justify-between items-center pb-2 border-b border-border">
                      <Label className="font-semibold text-base text-destructive flex items-center gap-1.5">
                        <X className="w-5 h-5" />
                        Tidak Termasuk (Excludes)
                      </Label>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddExclude}
                        className="h-8 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah
                      </Button>
                    </div>

                    {formValues.excludes.length > 0 ? (
                      <div className="space-y-2 pt-2">
                        {formValues.excludes.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <Input
                              value={item}
                              onChange={(e) => handleExcludeChange(idx, e.target.value)}
                              placeholder="Contoh: Tips Driver & Porter"
                              required
                            />
                            <Button
                              type="button"
                              size="icon"
                              variant="ghost"
                              onClick={() => handleRemoveExclude(idx)}
                              className="text-destructive hover:bg-destructive/10 shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-muted-foreground text-center py-6">
                        Belum ada item pengecualian yang dimasukkan.
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Tab 5: Itinerary */}
              <TabsContent value="itinerary" className="py-4 space-y-4 outline-none">
                <div className="flex justify-between items-center pb-2 border-b border-border">
                  <Label className="font-semibold text-lg">Rencana Perjalanan Hari demi Hari</Label>
                  <Button
                    type="button"
                    onClick={handleAddItineraryDay}
                    className="bg-primary hover:bg-primary-dark text-primary-foreground flex items-center gap-1 h-9 rounded-lg"
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Hari Baru
                  </Button>
                </div>

                {formValues.itinerary.length > 0 ? (
                  <div className="space-y-6 pt-2">
                    {formValues.itinerary.map((dayObj, dayIdx) => (
                      <div
                        key={dayIdx}
                        className="border border-border p-5 rounded-2xl space-y-4 bg-secondary/10 relative"
                      >
                        <div className="flex justify-between items-center">
                          <h4 className="font-serif font-bold text-lg text-primary">
                            Hari {dayObj.day}
                          </h4>
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveItineraryDay(dayIdx)}
                            className="text-destructive hover:bg-destructive/10 h-8 flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Hapus Hari
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div className="space-y-1">
                            <Label htmlFor={`day-title-${dayIdx}`}>Judul Kegiatan Hari {dayObj.day} *</Label>
                            <Input
                              id={`day-title-${dayIdx}`}
                              value={dayObj.title}
                              onChange={(e) => handleItineraryDayChange(dayIdx, 'title', e.target.value)}
                              placeholder="Contoh: Kedatangan & City Tour Singkat"
                              required
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`day-desc-${dayIdx}`}>Deskripsi Singkat Hari {dayObj.day} *</Label>
                            <Textarea
                              id={`day-desc-${dayIdx}`}
                              value={dayObj.description}
                              onChange={(e) => handleItineraryDayChange(dayIdx, 'description', e.target.value)}
                              placeholder="Deskripsikan perjalanan atau aktivitas di hari ini..."
                              required
                            />
                          </div>
                        </div>

                        {/* Activities list for this day */}
                        <div className="space-y-2 border border-border/60 p-4 rounded-xl bg-card">
                          <div className="flex justify-between items-center pb-2 border-b border-border/60">
                            <Label className="font-medium text-sm text-foreground">
                              Daftar Detail Aktivitas (Sub-Kegiatan)
                            </Label>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => handleAddActivity(dayIdx)}
                              className="h-7 px-2 text-xs flex items-center gap-1"
                            >
                              <Plus className="w-3 h-3" />
                              Tambah Aktivitas
                            </Button>
                          </div>

                          {dayObj.activities.length > 0 ? (
                            <div className="space-y-2 pt-2">
                              {dayObj.activities.map((act, actIdx) => (
                                <div key={actIdx} className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground select-none shrink-0 font-mono w-4">
                                    {actIdx + 1}.
                                  </span>
                                  <Input
                                    value={act}
                                    onChange={(e) => handleActivityChange(dayIdx, actIdx, e.target.value)}
                                    placeholder="Contoh: Makan siang di lokal resto, check-in hotel"
                                    required
                                    className="h-8 text-xs"
                                  />
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleRemoveActivity(dayIdx, actIdx)}
                                    className="text-destructive hover:bg-destructive/10 h-7 w-7 shrink-0"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground text-center py-4">
                              Belum ada rincian aktivitas hari ini.
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-border rounded-2xl bg-secondary/5">
                    <Compass className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-50" />
                    <h5 className="font-semibold text-sm text-foreground">Itinerary Kosong</h5>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto mt-1">
                      Buat rencana perjalanan hari demi hari untuk memberikan informasi lengkap kepada pelanggan Anda.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <DialogFooter className="pt-4 border-t border-border flex sm:justify-between items-center gap-2 mt-auto">
              <span className="text-xs text-muted-foreground">
                Tanda bintang (*) wajib diisi.
              </span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                  className="rounded-xl h-10 cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitPending}
                  className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl h-10 px-6 font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  {isSubmitPending && <Clock className="w-4 h-4 animate-spin" />}
                  Simpan Perubahan
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

