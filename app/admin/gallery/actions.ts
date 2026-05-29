'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { GalleryItem } from '@/lib/types'
import { randomUUID } from 'crypto'
import { auth } from '@/auth'

export async function deleteGalleryItem(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }
  }

  try {
    await (prisma as any).galleryItem.delete({
      where: { id },
    })

    revalidatePath('/')
    revalidatePath('/admin/gallery')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete gallery item:', error)
    return { success: false, error: 'Gagal menghapus foto galeri' }
  }
}

export async function createGalleryItem(data: Omit<GalleryItem, 'id'>) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }
  }

  try {
    const id = randomUUID()
    const newItem = await (prisma as any).galleryItem.create({
      data: {
        id,
        title: data.title,
        location: data.location,
        image: data.image,
        category: data.category,
      } as any
    })

    revalidatePath('/')
    revalidatePath('/admin/gallery')
    return { success: true, data: { id: newItem.id } }
  } catch (error) {
    console.error('Failed to create gallery item:', error)
    return { success: false, error: 'Gagal menambahkan foto galeri baru' }
  }
}

export async function updateGalleryItem(id: string, data: Omit<GalleryItem, 'id'>) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }
  }

  try {
    await (prisma as any).galleryItem.update({
      where: { id },
      data: {
        title: data.title,
        location: data.location,
        image: data.image,
        category: data.category,
      } as any
    })

    revalidatePath('/')
    revalidatePath('/admin/gallery')
    return { success: true }
  } catch (error) {
    console.error('Failed to update gallery item:', error)
    return { success: false, error: 'Gagal memperbarui foto galeri' }
  }
}
