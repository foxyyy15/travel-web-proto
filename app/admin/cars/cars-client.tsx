'use client'

import { useState, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Plus,
  Trash2,
  Pencil,
  Car,
  Users,
  Search,
  CheckCircle,
  X,
  Upload,
  Loader2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'

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

const emptyFormValues = {
  name: '',
  type: '',
  capacity: 7,
  pricePerDay: 500000,
  image: '',
  features: [] as string[],
}

export default function CarsClient({ initialCars, isMockData }: CarsClientProps) {
  const [cars, setCars] = useState<CarItem[]>(initialCars)
  const [isLoading, setIsLoading] = useState(initialCars.length === 0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isSubmitPending, startSubmitTransition] = useTransition()

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCar, setEditingCar] = useState<CarItem | null>(null)
  const [formValues, setFormValues] = useState(emptyFormValues)
  const [newFeature, setNewFeature] = useState('')

  // Load data client-side (same pattern as trips to support large Base64 images)
  useEffect(() => {
    async function loadCars() {
      if (isMockData) {
        setIsLoading(false)
        return
      }
      try {
        const response = await fetch('/api/admin/cars')
        const data = await response.json()
        if (data.success) {
          setCars(data.cars)
        } else {
          toast.error(data.error || 'Gagal mengambil data kendaraan dari API')
        }
      } catch (error) {
        console.error('Failed to load cars:', error)
        toast.error('Gagal memuat data unit kendaraan dari server API')
      } finally {
        setIsLoading(false)
      }
    }

    loadCars()
  }, [isMockData])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price)
  }

  const handleCreateClick = () => {
    setEditingCar(null)
    setFormValues(emptyFormValues)
    setNewFeature('')
    setIsFormOpen(true)
  }

  const handleEditClick = (car: CarItem) => {
    setEditingCar(car)
    setFormValues({
      name: car.name,
      type: car.type,
      capacity: car.capacity,
      pricePerDay: car.pricePerDay,
      image: car.image,
      features: [...car.features],
    })
    setNewFeature('')
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus armada kendaraan ini?') === false) return

    if (isMockData) {
      toast.warning('Mode Simulasi: Kendaraan dihapus di memori sementara')
      setCars((prev) => prev.filter((c) => c.id !== id))
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/cars?id=${id}`, {
          method: 'DELETE',
        })
        const res = await response.json()
        if (res.success) {
          toast.success('Armada kendaraan berhasil dihapus!')
          setCars((prev) => prev.filter((c) => c.id !== id))
        } else {
          toast.error(res.error || 'Gagal menghapus kendaraan')
        }
      } catch (error) {
        console.error('Delete car failed:', error)
        toast.error('Gagal menghapus kendaraan')
      }
    })
  }

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 1572864) {
      toast.error('Ukuran file terlalu besar. Maksimal 1.5MB')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormValues((prev) => ({ ...prev, image: reader.result as string }))
      toast.success('Gambar berhasil diproses secara lokal!')
    }
    reader.readAsDataURL(file)
  }

  const handleAddFeature = () => {
    if (!newFeature.trim()) return
    if (formValues.features.includes(newFeature.trim())) {
      toast.error('Fasilitas tersebut sudah ditambahkan')
      return
    }
    setFormValues((prev) => ({
      ...prev,
      features: [...prev.features, newFeature.trim()],
    }))
    setNewFeature('')
  }

  const handleRemoveFeature = (featureToRemove: string) => {
    setFormValues((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f !== featureToRemove),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formValues.name || !formValues.type || !formValues.image) {
      toast.error('Mohon isi semua field wajib yang diberi tanda bintang (*)')
      return
    }

    if (formValues.pricePerDay <= 0) {
      toast.error('Harga sewa harus lebih besar dari 0')
      return
    }

    if (formValues.capacity <= 0) {
      toast.error('Kapasitas penumpang harus minimal 1 orang')
      return
    }

    const submissionData = {
      name: formValues.name,
      type: formValues.type,
      capacity: Number(formValues.capacity),
      pricePerDay: Number(formValues.pricePerDay),
      image: formValues.image,
      features: formValues.features,
    }

    if (isMockData) {
      if (editingCar) {
        toast.warning('Mode Simulasi: Data armada diperbarui di memori sementara')
        setCars((prev) =>
          prev.map((c) => (c.id === editingCar.id ? { ...submissionData, id: editingCar.id } : c))
        )
      } else {
        toast.warning('Mode Simulasi: Armada baru ditambahkan di memori sementara')
        const newId = crypto.randomUUID()
        setCars((prev) => [{ ...submissionData, id: newId }, ...prev])
      }
      setIsFormOpen(false)
      return
    }

    startSubmitTransition(async () => {
      try {
        if (editingCar) {
          const response = await fetch('/api/admin/cars', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingCar.id, ...submissionData }),
          })
          const res = await response.json()
          if (res.success) {
            toast.success('Data armada kendaraan berhasil diperbarui!')
            setCars((prev) =>
              prev.map((c) => (c.id === editingCar.id ? { ...submissionData, id: editingCar.id } : c))
            )
            setIsFormOpen(false)
          } else {
            toast.error(res.error || 'Gagal memperbarui data kendaraan')
          }
        } else {
          const response = await fetch('/api/admin/cars', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
          })
          const res = await response.json()
          if (res.success) {
            toast.success('Unit armada kendaraan baru berhasil ditambahkan!')
            const newId = res.data?.id || crypto.randomUUID()
            setCars((prev) => [{ ...submissionData, id: newId }, ...prev])
            setIsFormOpen(false)
          } else {
            toast.error(res.error || 'Gagal menambahkan unit kendaraan baru')
          }
        }
      } catch (error) {
        console.error('Submit car failed:', error)
        toast.error('Gagal memproses data unit kendaraan')
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
          onClick={handleCreateClick}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl h-11 px-6 font-medium flex items-center gap-2"
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

      {/* Cars Grid / List */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-4" />
            <p className="text-sm text-muted-foreground">Memuat data unit armada...</p>
          </div>
        ) : filteredCars.length > 0 ? (
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
                        <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-border shrink-0 bg-secondary">
                          {c.image ? (
                            <Image src={c.image} alt={c.name} fill className="object-cover" />
                          ) : (
                            <Car className="w-6 h-6 text-muted-foreground absolute inset-0 m-auto" />
                          )}
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
                        {c.features.length === 0 && (
                          <span className="text-xs text-muted-foreground italic">Tidak ada fasilitas khusus</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-mono font-bold text-primary block">
                        {formatPrice(c.pricePerDay)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditClick(c)}
                          className="rounded-lg h-9 w-9 text-muted-foreground hover:bg-secondary hover:text-foreground shrink-0"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(c.id)}
                          disabled={isPending}
                          className="rounded-lg h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive shrink-0"
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
              <Car className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground">
              Tidak Ada Armada Kendaraan
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Belum ada data unit mobil rental yang cocok atau terdaftar.
            </p>
          </div>
        )}
      </div>

      {/* Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-bold">
              {editingCar ? 'Edit Armada Kendaraan' : 'Tambah Armada Baru'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-sm font-medium">
                  Nama Kendaraan <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Toyota Hiace Premio"
                  value={formValues.name}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <Label htmlFor="type" className="text-sm font-medium">
                  Tipe / Kategori <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="type"
                  placeholder="e.g. Van, MPV, Luxury MPV, Bus"
                  value={formValues.type}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, type: e.target.value }))}
                  required
                />
              </div>

              {/* Capacity */}
              <div className="space-y-1.5">
                <Label htmlFor="capacity" className="text-sm font-medium">
                  Kapasitas (Penumpang) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  min={1}
                  value={formValues.capacity}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, capacity: Number(e.target.value) }))}
                  required
                />
              </div>

              {/* Price Per Day */}
              <div className="space-y-1.5">
                <Label htmlFor="pricePerDay" className="text-sm font-medium">
                  Harga Sewa / Hari (IDR) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="pricePerDay"
                  type="number"
                  min={1000}
                  step={1000}
                  value={formValues.pricePerDay}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, pricePerDay: Number(e.target.value) }))}
                  required
                />
              </div>
            </div>

            {/* Image Upload / URL */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                Foto Kendaraan <span className="text-destructive">*</span>
              </Label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                {/* File picker */}
                <div className="md:col-span-2">
                  <div className="border-2 border-dashed border-border rounded-xl p-4 text-center hover:bg-secondary/20 transition cursor-pointer relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
                    <span className="text-xs text-muted-foreground block font-medium">
                      Pilih file lokal (Maks 1.5MB)
                    </span>
                  </div>
                </div>

                {/* Preview Image */}
                <div className="flex justify-center border border-border rounded-xl overflow-hidden aspect-video relative bg-secondary">
                  {formValues.image ? (
                    <>
                      <Image src={formValues.image} alt="Preview" fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormValues((prev) => ({ ...prev, image: '' }))}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <Car className="w-8 h-8 text-muted-foreground absolute inset-0 m-auto" />
                  )}
                </div>
              </div>

              {/* Opsi URL Teks */}
              <div className="space-y-1 mt-2">
                <Label htmlFor="imageUrl" className="text-[11px] text-muted-foreground">
                  Atau masukkan URL Gambar langsung:
                </Label>
                <Input
                  id="imageUrl"
                  placeholder="https://images.unsplash.com/... atau base64 string"
                  value={formValues.image}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, image: e.target.value }))}
                />
              </div>
            </div>

            {/* Features (Dynamic inputs) */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fasilitas & Fitur</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. AC, WiFi, Toilet, Captain Seat"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddFeature()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={handleAddFeature}>
                  Tambah
                </Button>
              </div>

              {/* Features List */}
              <div className="flex flex-wrap gap-1.5 pt-1.5">
                {formValues.features.map((feat) => (
                  <Badge
                    key={feat}
                    variant="secondary"
                    className="flex items-center gap-1 py-1 pl-2.5 pr-1.5 rounded-full text-xs font-normal"
                  >
                    {feat}
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(feat)}
                      className="w-4 h-4 rounded-full bg-muted-foreground/20 text-muted-foreground hover:bg-muted-foreground/30 flex items-center justify-center transition"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </Badge>
                ))}
                {formValues.features.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Belum ada fasilitas ditambahkan.</p>
                )}
              </div>
            </div>

            {/* Dialog Footer */}
            <DialogFooter className="pt-4 border-t border-border flex items-center gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={isSubmitPending} className="min-w-[100px]">
                {isSubmitPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  'Simpan'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
