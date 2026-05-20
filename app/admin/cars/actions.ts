'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteCar(carId: string) {
  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }
  }

  try {
    await prisma.car.delete({
      where: { id: carId },
    })

    revalidatePath('/')
    revalidatePath('/airlangga-car')
    revalidatePath('/admin')
    revalidatePath('/admin/cars')
    return { success: true }
  } catch (error) {
    console.error('Failed to delete car:', error)
    return { success: false, error: 'Gagal menghapus kendaraan' }
  }
}
