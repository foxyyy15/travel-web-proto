'use client'

import { useState, useTransition, useEffect } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Plus,
  Trash2,
  Pencil,
  Search,
  Image as ImageIcon,
  X,
  Compass,
  MapPin,
  Tag,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import type { GalleryItem } from '@/lib/types'

interface GalleryClientProps {
  initialItems: GalleryItem[]
  isMockData: boolean
}

const emptyFormValues = {
  title: '',
  location: '',
  image: '',
  category: 'Trip Bahari',
}

const categories = [
  'Trip Bahari',
  'Pegunungan',
  'Pantai',
  'Budaya',
  'Petualangan',
  'Danau',
]

export default function GalleryClient({ initialItems, isMockData }: GalleryClientProps) {
  const [items, setItems] = useState<GalleryItem[]>(initialItems)
  const [isLoading, setIsLoading] = useState(initialItems.length === 0)
  const [searchQuery, setSearchQuery] = useState('')
  const [isPending, startTransition] = useTransition()
  const [isSubmitPending, startSubmitTransition] = useTransition()

  // Load data client-side to bypass Next.js Server Components serialization limits for Base64 image payload sizes
  useEffect(() => {
    async function loadGalleryItems() {
      if (isMockData) {
        setIsLoading(false)
        return
      }
      try {
        const response = await fetch('/api/admin/gallery')
        const data = await response.json()
        if (data.success) {
          setItems(data.items)
        } else {
          toast.error(data.error || 'Gagal mengambil data galeri dari API')
        }
      } catch (error) {
        console.error('Failed to load gallery items:', error)
        toast.error('Gagal memuat data galeri dari server API')
      } finally {
        setIsLoading(false)
      }
    }

    loadGalleryItems()
  }, [isMockData])

  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<GalleryItem | null>(null)
  const [formValues, setFormValues] = useState(emptyFormValues)

  // Batch upload states
  const [isBatchOpen, setIsBatchOpen] = useState(false)
  const [batchItems, setBatchItems] = useState<{
    id: string
    title: string
    image: string
    location: string
    category: string
  }[]>([])
  const [batchSharedLocation, setBatchSharedLocation] = useState('')
  const [batchSharedCategory, setBatchSharedCategory] = useState('Trip Bahari')
  const [isBatchUploading, setIsBatchUploading] = useState(false)
  const [batchProgress, setBatchProgress] = useState(0)

  const handleBatchFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const tempItems: typeof batchItems = []
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
          const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name
          const title = baseName
            .replace(/[-_]+/g, ' ')
            .trim()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

          tempItems.push({
            id: crypto.randomUUID(),
            title,
            image: reader.result as string,
            location: batchSharedLocation || '',
            category: batchSharedCategory || 'Trip Bahari',
          })
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
      if (tempItems.length > 0) {
        setBatchItems(tempItems)
        setIsBatchOpen(true)
        toast.success(`${tempItems.length} gambar siap diproses!`)
      }
      e.target.value = ''
    })
  }

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (batchItems.length === 0) return

    const invalidItem = batchItems.find(item => !item.title.trim() || !item.location.trim())
    if (invalidItem) {
      toast.error('Semua foto harus memiliki Judul dan Lokasi')
      return
    }

    setIsBatchUploading(true)
    setBatchProgress(0)

    let successCount = 0
    let failCount = 0
    const newAddedItems: GalleryItem[] = []
    const failedItemsList: typeof batchItems = []

    for (let i = 0; i < batchItems.length; i++) {
      const item = batchItems[i]
      const submissionData = {
        title: item.title,
        location: item.location,
        image: item.image,
        category: item.category,
      }

      if (isMockData) {
        const mockNewId = crypto.randomUUID()
        newAddedItems.unshift({
          id: mockNewId,
          ...submissionData
        })
        successCount++
        setBatchProgress(Math.round(((i + 1) / batchItems.length) * 100))
        await new Promise(r => setTimeout(r, 200))
      } else {
        try {
          const response = await fetch('/api/admin/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
          })
          const res = await response.json()
          if (res.success) {
            const newId = res.data?.id || crypto.randomUUID()
            newAddedItems.unshift({
              id: newId,
              ...submissionData
            })
            successCount++
          } else {
            failCount++
            failedItemsList.push(item)
            console.error(`Failed to upload ${item.title}:`, res.error || 'Unknown error')
          }
        } catch (error) {
          failCount++
          failedItemsList.push(item)
          console.error(`Failed to upload ${item.title}:`, error)
        }
        setBatchProgress(Math.round(((i + 1) / batchItems.length) * 100))
      }
    }

    setIsBatchUploading(false)
    
    if (newAddedItems.length > 0) {
      setItems((prev) => [...newAddedItems, ...prev])
    }

    if (successCount > 0) {
      toast.success(`${successCount} foto galeri berhasil ditambahkan!`)
    }
    if (failCount > 0) {
      toast.error(`${failCount} foto galeri gagal ditambahkan.`)
      setBatchItems(failedItemsList)
    } else {
      setIsBatchOpen(false)
      setBatchItems([])
    }
  }

  const handleCreateClick = () => {
    setEditingItem(null)
    setFormValues(emptyFormValues)
    setIsFormOpen(true)
  }

  const handleEditClick = (item: GalleryItem) => {
    setEditingItem(item)
    setFormValues({
      title: item.title,
      location: item.location,
      image: item.image,
      category: item.category,
    })
    setIsFormOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus foto galeri ini?')) return

    if (isMockData) {
      toast.warning('Mode Simulasi: Foto dihapus di memori sementara')
      setItems((prev) => prev.filter((item) => item.id !== id))
      return
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/gallery?id=${id}`, {
          method: 'DELETE',
        })
        const res = await response.json()
        if (res.success) {
          toast.success('Foto galeri berhasil dihapus!')
          setItems((prev) => prev.filter((item) => item.id !== id))
        } else {
          toast.error(res.error || 'Gagal menghapus foto galeri')
        }
      } catch (error) {
        console.error('Delete gallery item failed:', error)
        toast.error('Gagal menghapus foto galeri')
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formValues.title || !formValues.location || !formValues.image || !formValues.category) {
      toast.error('Mohon isi semua field yang wajib (*)')
      return
    }

    const submissionData = {
      title: formValues.title,
      location: formValues.location,
      image: formValues.image,
      category: formValues.category,
    }

    if (isMockData) {
      if (editingItem) {
        toast.warning('Mode Simulasi: Foto diperbarui di memori sementara')
        setItems((prev) =>
          prev.map((item) =>
            item.id === editingItem.id ? { ...submissionData, id: editingItem.id } : item
          )
        )
      } else {
        toast.warning('Mode Simulasi: Foto baru ditambahkan di memori sementara')
        const newId = crypto.randomUUID()
        setItems((prev) => [{ ...submissionData, id: newId }, ...prev])
      }
      setIsFormOpen(false)
      return
    }

    startSubmitTransition(async () => {
      try {
        if (editingItem) {
          const response = await fetch('/api/admin/gallery', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingItem.id, ...submissionData }),
          })
          const res = await response.json()
          if (res.success) {
            toast.success('Foto galeri berhasil diperbarui!')
            setItems((prev) =>
              prev.map((item) =>
                item.id === editingItem.id ? { ...submissionData, id: editingItem.id } : item
              )
            )
            setIsFormOpen(false)
          } else {
            toast.error(res.error || 'Gagal memperbarui foto galeri')
          }
        } else {
          const response = await fetch('/api/admin/gallery', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(submissionData),
          })
          const res = await response.json()
          if (res.success) {
            toast.success('Foto galeri baru berhasil ditambahkan!')
            const newId = res.data?.id || crypto.randomUUID()
            setItems((prev) => [{ ...submissionData, id: newId }, ...prev])
            setIsFormOpen(false)
          } else {
            toast.error(res.error || 'Gagal menambahkan foto galeri baru')
          }
        }
      } catch (error) {
        console.error('Submit gallery item failed:', error)
        toast.error('Gagal memproses data foto galeri')
      }
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

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            Kelola Galeri Foto
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Tambahkan dan kelola foto-foto momen perjalanan di halaman utama
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Button
              variant="outline"
              className="border-primary/30 hover:border-primary/60 text-primary hover:bg-primary/5 rounded-xl h-11 px-6 font-medium flex items-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <ImageIcon className="w-5 h-5" />
              Unggah Banyak Foto
            </Button>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleBatchFileSelection}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
          </div>
          <Button
            onClick={handleCreateClick}
            className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl h-11 px-6 font-medium flex items-center gap-2 transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus className="w-5 h-5" />
            Tambah Foto
          </Button>
        </div>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl flex gap-4 items-center shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari judul foto, lokasi, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-11 border-border rounded-xl"
          />
        </div>
      </div>

      {/* Grid List */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="text-center py-20 flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-muted-foreground">Memuat data galeri foto...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border bg-secondary/30 text-xs font-semibold uppercase text-muted-foreground">
                  <th className="p-4 w-28">Preview</th>
                  <th className="p-4">Foto & Lokasi</th>
                  <th className="p-4">Kategori</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-sm">
                {filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-secondary/10 transition-colors">
                    <td className="p-4">
                      <div className="relative w-20 h-28 rounded-lg overflow-hidden border border-border/80 shadow-sm bg-secondary">
                        <Image
                          src={item.image}
                          alt={item.title}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="font-serif font-semibold text-base text-foreground">
                        {item.title}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="w-3.5 h-3.5 text-primary shrink-0" />
                        {item.location}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge variant="secondary" className="flex items-center gap-1 w-max font-medium">
                        <Tag className="w-3 h-3" />
                        {item.category}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleEditClick(item)}
                          disabled={isPending}
                          className="text-muted-foreground hover:text-primary hover:bg-secondary/80 rounded-lg cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => handleDelete(item.id)}
                          disabled={isPending}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer"
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
              <ImageIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-serif font-semibold text-lg text-foreground">
              Tidak Ada Foto Galeri
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Belum ada foto galeri atau coba ubah kata kunci pencarian Anda
            </p>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog Form */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-xl rounded-2xl p-6 gap-0">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-2xl font-serif font-bold text-foreground">
              {editingItem ? 'Edit Foto Galeri' : 'Tambah Foto Galeri'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-5">
            {/* Title */}
            <div className="space-y-1.5">
              <Label htmlFor="title">Judul Foto *</Label>
              <Input
                id="title"
                value={formValues.title}
                onChange={(e) => setFormValues((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Contoh: Sunset Indah Kelingking Cliff"
                required
              />
            </div>

            {/* Location */}
            <div className="space-y-1.5">
              <Label htmlFor="location">Lokasi *</Label>
              <Input
                id="location"
                value={formValues.location}
                onChange={(e) => setFormValues((prev) => ({ ...prev, location: e.target.value }))}
                placeholder="Contoh: Nusa Penida, Bali"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label>Unggah Foto Galeri *</Label>
              <div className="flex flex-col gap-3">
                {/* Drag & Drop / Click Zone */}
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
                        alt="Preview"
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
                      <div className="text-xs font-medium text-foreground">Klik untuk unggah gambar</div>
                      <div className="text-[10px] text-muted-foreground">PNG, JPG, JPEG (Maksimal 1.5MB)</div>
                    </div>
                  )}
                </div>

                {/* Manual URL Input */}
                <div className="space-y-1">
                  <Label htmlFor="image" className="text-[11px] text-muted-foreground">Atau masukkan URL gambar secara manual</Label>
                  <Input
                    id="image"
                    value={formValues.image}
                    onChange={(e) => setFormValues((prev) => ({ ...prev, image: e.target.value }))}
                    placeholder="Contoh: https://images.unsplash.com/..."
                    className="h-10 text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="category">Kategori *</Label>
              <select
                id="category"
                value={formValues.category}
                onChange={(e) => setFormValues((prev) => ({ ...prev, category: e.target.value }))}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Form Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsFormOpen(false)}
                disabled={isSubmitPending}
                className="rounded-xl h-11 px-5 cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isSubmitPending}
                className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl h-11 px-6 font-medium cursor-pointer"
              >
                {isSubmitPending ? 'Menyimpan...' : 'Simpan Foto'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Batch Upload Dialog */}
      <Dialog open={isBatchOpen} onOpenChange={(open) => {
        if (!isBatchUploading) {
          setIsBatchOpen(open)
          if (!open) setBatchItems([])
        }
      }}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 gap-0">
          <DialogHeader className="pb-4 border-b border-border">
            <DialogTitle className="text-2xl font-serif font-bold text-foreground">
              Unggah Banyak Foto Galeri
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
              Sesuaikan judul, lokasi, dan kategori untuk foto-foto yang dipilih sebelum diunggah.
            </p>
          </DialogHeader>

          {isBatchUploading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <div className="text-sm font-semibold text-foreground">Sedang mengunggah foto...</div>
              <div className="w-64 bg-secondary h-2.5 rounded-full overflow-hidden relative">
                <div 
                  className="bg-primary h-full transition-all duration-300" 
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
              <div className="text-xs text-muted-foreground">{batchProgress}% Selesai</div>
            </div>
          ) : (
            <form onSubmit={handleBatchSubmit} className="mt-4 flex flex-col gap-5">
              {/* Batch Apply Settings Bar */}
              <div className="p-4 bg-secondary/10 border border-border rounded-xl space-y-3">
                <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                  Pengaturan Masal (Terapkan ke Semua)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                  <div className="space-y-1">
                    <Label className="text-xs">Lokasi Bersama</Label>
                    <Input
                      value={batchSharedLocation}
                      onChange={(e) => setBatchSharedLocation(e.target.value)}
                      placeholder="Contoh: Labuan Bajo, Flores"
                      className="h-9 text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Kategori Bersama</Label>
                    <select
                      value={batchSharedCategory}
                      onChange={(e) => setBatchSharedCategory(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setBatchItems(prev => prev.map(item => ({
                        ...item,
                        location: batchSharedLocation || item.location,
                        category: batchSharedCategory || item.category
                      })))
                      toast.success('Pengaturan lokasi & kategori diterapkan ke semua foto!')
                    }}
                    className="h-9 text-xs font-medium cursor-pointer"
                  >
                    Terapkan Ke Semua Foto
                  </Button>
                </div>
              </div>

              {/* Items Grid List */}
              <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-1">
                {batchItems.map((item) => (
                  <div key={item.id} className="p-4 border border-border rounded-xl flex flex-col sm:flex-row gap-4 items-start sm:items-center bg-card shadow-sm relative group">
                    {/* Thumbnail preview */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border/80 bg-secondary shrink-0">
                      <img
                        src={item.image}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Individual fields */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 w-full">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Judul Foto *</Label>
                        <Input
                          value={item.title}
                          onChange={(e) => {
                            const val = e.target.value
                            setBatchItems(prev => prev.map(p => p.id === item.id ? { ...p, title: val } : p))
                          }}
                          placeholder="Masukkan judul..."
                          required
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Lokasi *</Label>
                        <Input
                          value={item.location}
                          onChange={(e) => {
                            const val = e.target.value
                            setBatchItems(prev => prev.map(p => p.id === item.id ? { ...p, location: val } : p))
                          }}
                          placeholder="Masukkan lokasi..."
                          required
                          className="h-9 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Kategori *</Label>
                        <select
                          value={item.category}
                          onChange={(e) => {
                            const val = e.target.value
                            setBatchItems(prev => prev.map(p => p.id === item.id ? { ...p, category: val } : p))
                          }}
                          className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs focus-visible:outline-none"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Delete Item Button */}
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setBatchItems(prev => prev.filter(p => p.id !== item.id))
                        if (batchItems.length <= 1) {
                          setIsBatchOpen(false)
                        }
                      }}
                      className="text-destructive hover:bg-destructive/10 shrink-0 h-9 w-9 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-border mt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsBatchOpen(false)
                    setBatchItems([])
                  }}
                  className="rounded-xl h-11 px-5 cursor-pointer"
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-primary-foreground rounded-xl h-11 px-6 font-medium cursor-pointer"
                >
                  Unggah Semua ({batchItems.length} Foto)
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
