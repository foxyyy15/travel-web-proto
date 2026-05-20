'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  Star,
  CheckCircle,
  Trash2,
  AlertCircle,
  MessageSquare,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { approveTestimonial, deleteTestimonial } from './actions'

interface TestimonialItem {
  id: string
  name: string
  avatar: string | null
  location: string
  rating: number
  comment: string
  tripTitle: string
  isApproved: boolean
  createdAt: string
}

interface TestimonialsClientProps {
  initialTestimonials: TestimonialItem[]
  isMockData: boolean
}

export default function TestimonialsClient({
  initialTestimonials,
  isMockData,
}: TestimonialsClientProps) {
  const [items, setItems] = useState<TestimonialItem[]>(initialTestimonials)
  const [isPending, startTransition] = useTransition()

  const handleApprove = async (id: string) => {
    if (isMockData) {
      toast.warning('Mode Simulasi: Testimoni disetujui di memori sementara')
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, isApproved: true } : item))
      )
      return
    }

    startTransition(async () => {
      const res = await approveTestimonial(id)
      if (res.success) {
        toast.success('Ulasan berhasil disetujui untuk ditampilkan!')
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, isApproved: true } : item))
        )
      } else {
        toast.error(res.error || 'Gagal menyetujui ulasan')
      }
    })
  }

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus ulasan ini?') === false) return

    if (isMockData) {
      toast.warning('Mode Simulasi: Testimoni dihapus di memori sementara')
      setItems((prev) => prev.filter((item) => item.id !== id))
      return
    }

    startTransition(async () => {
      const res = await deleteTestimonial(id)
      if (res.success) {
        toast.success('Ulasan berhasil dihapus!')
        setItems((prev) => prev.filter((item) => item.id !== id))
      } else {
        toast.error(res.error || 'Gagal menghapus ulasan')
      }
    })
  }

  const pendingItems = items.filter((item) => !item.isApproved)
  const approvedItems = items.filter((item) => item.isApproved)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-serif font-bold text-foreground">
          Moderasi Testimoni
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Review ulasan dari pelanggan sebelum ditampilkan secara publik di landing page
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="bg-secondary/40 border border-border rounded-xl p-1 mb-6">
          <TabsTrigger value="pending" className="rounded-lg px-6 py-2">
            Menunggu Review ({pendingItems.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="rounded-lg px-6 py-2">
            Telah Disetujui ({approvedItems.length})
          </TabsTrigger>
        </TabsList>

        {/* Pending Content */}
        <TabsContent value="pending" className="space-y-4 outline-none">
          {pendingItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingItems.map((item) => (
                <TestimonialCard
                  key={item.id}
                  item={item}
                  onApprove={handleApprove}
                  onDelete={handleDelete}
                  isPending={isPending}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
              <CheckCircle className="w-12 h-12 text-success mx-auto mb-4" />
              <h3 className="font-serif font-semibold text-lg text-foreground">
                Semua Ulasan Bersih
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Tidak ada ulasan baru yang menunggu persetujuan saat ini.
              </p>
            </div>
          )}
        </TabsContent>

        {/* Approved Content */}
        <TabsContent value="approved" className="space-y-4 outline-none">
          {approvedItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {approvedItems.map((item) => (
                <TestimonialCard
                  key={item.id}
                  item={item}
                  onDelete={handleDelete}
                  isPending={isPending}
                />
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl p-12 text-center shadow-sm">
              <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-serif font-semibold text-lg text-foreground">
                Belum Ada Testimoni Disetujui
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Gunakan tab "Menunggu Review" untuk menyetujui testimoni baru.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function TestimonialCard({
  item,
  onApprove,
  onDelete,
  isPending,
}: {
  item: TestimonialItem
  onApprove?: (id: string) => void
  onDelete: (id: string) => void
  isPending: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4"
    >
      <div className="space-y-3">
        {/* Rating Stars */}
        <div className="flex items-center gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < item.rating ? 'text-primary fill-primary' : 'text-border'
              }`}
            />
          ))}
        </div>

        {/* Comment */}
        <p className="text-sm text-card-foreground italic leading-relaxed">
          &quot;{item.comment}&quot;
        </p>
      </div>

      {/* Author & Footer */}
      <div className="pt-4 border-t border-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {item.avatar ? (
            <div className="relative w-10 h-10 rounded-full overflow-hidden border border-border">
              <Image src={item.avatar} alt={item.name} fill className="object-cover" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
              <User className="w-5 h-5" />
            </div>
          )}
          <div>
            <h4 className="font-semibold text-sm text-foreground">{item.name}</h4>
            <p className="text-[10px] text-muted-foreground">
              {item.location} • {item.tripTitle}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          {onApprove && (
            <Button
              size="sm"
              onClick={() => onApprove(item.id)}
              disabled={isPending}
              className="bg-success text-success-foreground hover:bg-success h-9 rounded-lg px-3 text-xs flex items-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              Setujui
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => onDelete(item.id)}
            disabled={isPending}
            className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive h-9 rounded-lg px-3 text-xs flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Hapus
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
