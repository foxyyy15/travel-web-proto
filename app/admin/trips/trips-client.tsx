'use client'

import { useState, useTransition, useEffect } from 'react'
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
  Loader2,
  FileText,
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
  availableSlots: 999,
  totalSlots: 999,
  departureDates: [] as string[],
  meetingPoint: '',
  itinerary: [] as ItineraryDay[],
  includes: [] as string[],
  excludes: [] as string[],
  category: 'domestic' as 'domestic' | 'international',
  featured: false,
  depositPercentage: 100,
  description: '',
  terms: '',
  transportation: 'Darat',
}

export default function TripsClient({ initialTrips, isMockData }: TripsClientProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [isLoading, setIsLoading] = useState(initialTrips.length === 0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isSubmitPending, startSubmitTransition] = useTransition()

  // Load data client-side to bypass Next.js Server Components serialization limits for Base64 image payload sizes
  useEffect(() => {
    async function loadTrips() {
      if (isMockData) {
        setIsLoading(false)
        return
      }
      try {
        const response = await fetch('/api/admin/trips')
        const data = await response.json()
        if (data.success) {
          setTrips(data.trips)
        } else {
          toast.error(data.error || 'Gagal mengambil data trips dari API')
        }
      } catch (error) {
        console.error('Failed to load trips:', error)
        toast.error('Gagal memuat data unit trips dari server API')
      } finally {
        setIsLoading(false)
      }
    }

    loadTrips()
  }, [isMockData])
  
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
      description: trip.description || '',
      terms: trip.terms || '',
      transportation: trip.transportation || 'Darat',
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
      try {
        const response = await fetch(`/api/admin/trips?id=${id}`, {
          method: 'DELETE',
        })
        const res = await response.json()
        if (res.success) {
          toast.success('Paket open trip berhasil dihapus!')
          setTrips((prev) => prev.filter((t) => t.id !== id))
        } else {
          toast.error(res.error || 'Gagal menghapus open trip')
        }
      } catch (error) {
        console.error('Delete trip failed:', error)
        toast.error('Gagal menghapus open trip')
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

  const handleImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    onUploadSuccess: (base64: string) => void
  ) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1572864) {
      toast.error('Ukuran file terlalu besar. Maksimal 1.5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      onUploadSuccess(reader.result as string)
      toast.success('Gambar berhasil diproses secara lokal!')
    }
    reader.readAsDataURL(file)
  }

  const handleMultipleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const newImages: string[] = []
    const errors: string[] = []
    
    const promises = Array.from(files).map((file) => {
      return new Promise<void>((resolve) => {
        if (file.size > 1572864) {
          errors.push(`${file.name}: Ukuran file terlalu besar. Maksimal 1.5MB`)
          resolve()
          return
        }

        const reader = new FileReader()
        reader.onloadend = () => {
          newImages.push(reader.result as string)
          resolve()
        }
        reader.onerror = () => {
          errors.push(`${file.name}: Gagal membaca file`)
          resolve()
        }
        reader.readAsDataURL(file)
      })
    })

    Promise.all(promises).then(() => {
      if (errors.length > 0) {
        errors.forEach((err) => toast.error(err))
      }
      if (newImages.length > 0) {
        setFormValues((prev) => ({
          ...prev,
          images: [...prev.images, ...newImages],
        }))
        toast.success(`${newImages.length} gambar berhasil ditambahkan secara lokal!`)
      }
      e.target.value = ''
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
      description: formValues.description,
      terms: formValues.terms,
      transportation: formValues.transportation || 'Darat',
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
      try {
        if (editingTrip) {
          const response = await fetch('/api/admin/trips', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingTrip.id, ...submissionData }),
          })
          const res = await response.json()
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
          const response = await fetch('/api/admin/trips', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
          })
          const res = await response.json()
          if (res.success) {
            toast.success('Paket open trip baru berhasil dibuat!')
            const newId = res.data?.id || crypto.randomUUID()
            setTrips((prev) => [{ ...submissionData, id: newId } as Trip, ...prev])
            setIsFormOpen(false)
          } else {
            toast.error(res.error || 'Gagal membuat paket open trip baru')
          }
        }
      } catch (error) {
        console.error('Submit trip failed:', error)
        toast.error('Gagal memproses data paket open trip')
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
        {isLoading ? (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Memuat data unit trip...</p>
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-secondary/40 text-muted-foreground text-xs uppercase font-medium">
                <tr>
                  <th className="px-6 py-4">Trip</th>
                  <th className="px-6 py-4">Destinasi</th>
                  <th className="px-6 py-4">Durasi</th>
                  <th className="px-6 py-4">Kategori</th>
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
                <TabsTrigger
                  value="rules"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-1 pb-3 pt-2 font-semibold text-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-4 h-4" />
                  Deskripsi & S&K
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

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                  <div className="space-y-1.5">
                    <Label htmlFor="transportation">Moda Transportasi *</Label>
                    <Input
                      id="transportation"
                      value={formValues.transportation}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, transportation: e.target.value }))}
                      placeholder="Contoh: Darat, Pesawat, Kapal Laut, Kereta Api, dll."
                      required
                    />
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
                <div className="space-y-1.5">
                  <Label htmlFor="meetingPoint">Titik Kumpul (Meeting Point) *</Label>
                  <Input
                    id="meetingPoint"
                    value={formValues.meetingPoint}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, meetingPoint: e.target.value }))}
                    placeholder="Contoh: Bandara Komodo Labuan Bajo"
                    required
                  />
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
              <TabsContent value="media" className="py-4 space-y-5 outline-none">
                {/* Main Cover Image Uploader */}
                <div className="space-y-2">
                  <Label>Unggah Gambar Sampul Utama *</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                    <div className="md:col-span-2 space-y-3">
                      {/* Upload Box */}
                      <div className="relative group flex flex-col items-center justify-center border-2 border-dashed border-border hover:border-primary/50 transition-all rounded-xl p-4 bg-secondary/10 cursor-pointer h-40">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageFileChange(e, (base64) => setFormValues((prev) => ({ ...prev, image: base64 })))}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        {formValues.image ? (
                          <div className="relative w-full h-full flex items-center justify-center">
                            <img
                              src={formValues.image}
                              alt="Cover Preview"
                              className="h-full w-auto object-contain rounded-lg max-h-32"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center rounded-lg">
                              <span className="text-white text-xs font-semibold px-3 py-1 bg-black/60 rounded-full">Ganti Gambar</span>
                            </div>
                          </div>
                        ) : (
                          <div className="text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
                              <Plus className="w-5 h-5" />
                            </div>
                            <div className="text-xs font-medium text-foreground">Klik untuk unggah gambar sampul</div>
                            <div className="text-[10px] text-muted-foreground">PNG, JPG, JPEG (Maksimal 1.5MB)</div>
                          </div>
                        )}
                      </div>

                      {/* Fallback URL Input */}
                      <div className="space-y-1">
                        <Label htmlFor="image" className="text-[11px] text-muted-foreground">Atau masukkan URL gambar utama secara manual</Label>
                        <Input
                          id="image"
                          value={formValues.image}
                          onChange={(e) => setFormValues((prev) => ({ ...prev, image: e.target.value }))}
                          placeholder="Masukkan URL foto dari Unsplash..."
                          className="h-10 text-xs"
                        />
                      </div>
                    </div>

                    <div className="hidden md:block">
                      <Label>Panduan Ukuran</Label>
                      <div className="p-4 bg-secondary/20 border border-border rounded-xl mt-2 text-xs text-muted-foreground space-y-2 leading-relaxed">
                        <p><strong>Rasio Foto:</strong> Menggunakan rasio portrait 3:4 agar pas di kartu.</p>
                        <p><strong>Kompresi:</strong> Harap gunakan gambar yang sudah dikompres agar pemuatan halaman tetap cepat.</p>
                        <p><strong>Maksimal File:</strong> 1.5MB per berkas gambar.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Gallery Images List */}
                <div className="space-y-2 border border-border p-4 rounded-xl">
                  <div className="flex justify-between items-center pb-2 border-b border-border">
                    <Label className="font-semibold text-base">Galeri Foto Tambahan</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="h-8 flex items-center gap-1 cursor-pointer bg-primary/10 text-primary hover:bg-primary/20 border-primary/20"
                        >
                          <ImageIcon className="w-3.5 h-3.5" />
                          Unggah Sekaligus (Bisa Banyak)
                        </Button>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleMultipleImagesUpload}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                        />
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={handleAddGalleryImage}
                        className="h-8 flex items-center gap-1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Tambah Baris URL
                      </Button>
                    </div>
                  </div>

                  {formValues.images.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      {formValues.images.map((url, idx) => (
                        <div key={idx} className="flex gap-4 items-center">
                          <div className="flex-1 relative">
                            <Input
                              value={url}
                              onChange={(e) => handleGalleryImageChange(idx, e.target.value)}
                              placeholder="Masukkan URL foto atau klik ikon di kanan untuk unggah file..."
                              required
                              className="pr-10"
                            />
                            {/* Inline file uploader trigger */}
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground hover:text-primary transition-colors cursor-pointer flex items-center justify-center">
                              <ImageIcon className="w-4 h-4" />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageFileChange(e, (base64) => handleGalleryImageChange(idx, base64))}
                                className="absolute inset-0 opacity-0 cursor-pointer"
                              />
                            </div>
                          </div>
                          {url && (
                            <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-border bg-secondary shrink-0">
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
                            className="text-destructive hover:bg-destructive/10 shrink-0"
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

              {/* Tab 6: Deskripsi & S&K */}
              <TabsContent value="rules" className="py-4 space-y-4 outline-none">
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="description">Deskripsi Paket Perjalanan</Label>
                    <Textarea
                      id="description"
                      value={formValues.description}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Masukkan deskripsi perjalanan secara lengkap, seperti daya tarik utama paket wisata ini..."
                      rows={6}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="terms">Syarat & Ketentuan Pemesanan</Label>
                    <Textarea
                      id="terms"
                      value={formValues.terms}
                      onChange={(e) => setFormValues((prev) => ({ ...prev, terms: e.target.value }))}
                      placeholder="Masukkan syarat dan ketentuan perjalanan (contoh: kebijakan pembatalan, minimal peserta, perlengkapan yang wajib dibawa, dll.). Gunakan enter/baris baru untuk merapikan list poin."
                      rows={8}
                    />
                  </div>
                </div>
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

