'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'

export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'dp_paid' | 'paid' | 'cancelled'
) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

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
    console.error('Failed to update booking status:', error)
    return { success: false, error: 'Gagal memperbarui status di database' }
  }
}
