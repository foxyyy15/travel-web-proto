'use server'

import { createBooking as saveBooking } from '@/lib/db-fallback'
import { prisma } from '@/lib/prisma'
import type { Booking } from '@/lib/types'
import { revalidatePath } from 'next/cache'

export async function createBookingAction(data: Omit<Booking, 'id' | 'createdAt'>) {
  try {
    const booking = await saveBooking(data)
    revalidatePath('/admin')
    revalidatePath('/admin/bookings')
    return { success: true, booking }
  } catch (error) {
    console.error('Failed to create booking action:', error)
    return { success: false, error: 'Gagal membuat pemesanan' }
  }
}

export async function updateBookingStatusAction(bookingId: string, status: 'pending' | 'paid' | 'cancelled') {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }
  }

  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status },
    })

    revalidatePath('/admin')
    revalidatePath('/admin/bookings')
    return { success: true }
  } catch (error) {
    console.error('Failed to update booking status action:', error)
    return { success: false, error: 'Gagal memperbarui status booking' }
  }
}
