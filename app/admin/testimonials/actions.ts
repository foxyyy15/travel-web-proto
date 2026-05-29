'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

export async function approveTestimonial(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }
  }

  try {
    await prisma.testimonial.update({
      where: { id },
      data: { isApproved: true },
    })

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/testimonials')
    return { success: true }
  } catch (error) {
    console.error('Failed to approve testimonial:', error)
    return { success: false, error: 'Gagal menyetujui ulasan' }
  }
}

export async function deleteTestimonial(id: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }
  }

  try {
    await prisma.testimonial.delete({
      where: { id },
    })

    revalidatePath('/')
    revalidatePath('/admin')
    revalidatePath('/admin/testimonials')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete testimonial:', error)
    return { success: false, error: 'Gagal menghapus ulasan' }
  }
}
