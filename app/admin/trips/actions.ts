'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteTrip(tripId: string) {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }
  }

  try {
    await prisma.trip.delete({
      where: { id: tripId },
    })

    revalidatePath('/')
    revalidatePath('/open-trip')
    revalidatePath('/admin')
    revalidatePath('/admin/trips')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete trip:', error)
    return { success: false, error: 'Gagal menghapus paket open trip' }
  }
}
