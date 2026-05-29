'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { auth } from '@/auth'
import { randomUUID } from 'crypto'

export async function deleteCar(carId: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

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

export async function createCar(carData: {
  name: string
  type: string
  capacity: number
  pricePerDay: number
  image: string
  features: string[]
}) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }
  }

  try {
    const id = randomUUID()
    const { name, type, capacity, pricePerDay, image, features = [] } = carData

    await prisma.car.create({
      data: {
        id,
        name,
        type,
        capacity: Number(capacity),
        pricePerDay: Number(pricePerDay),
        image,
        features: {
          create: features.map((feat) => ({ feature: feat })),
        },
      },
    })

    revalidatePath('/')
    revalidatePath('/airlangga-car')
    revalidatePath('/admin')
    revalidatePath('/admin/cars')
    return { success: true, data: { id } }
  } catch (error) {
    console.error('Failed to create car:', error)
    return { success: false, error: 'Gagal menambahkan unit kendaraan baru' }
  }
}

export async function updateCar(
  carId: string,
  carData: {
    name: string
    type: string
    capacity: number
    pricePerDay: number
    image: string
    features: string[]
  }
) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }
  }

  try {
    const { name, type, capacity, pricePerDay, image, features = [] } = carData

    await prisma.$transaction(async (tx) => {
      // Hapus feature lama
      await tx.carFeature.deleteMany({
        where: { carId },
      })

      // Update data mobil dan masukkan feature baru
      await tx.car.update({
        where: { id: carId },
        data: {
          name,
          type,
          capacity: Number(capacity),
          pricePerDay: Number(pricePerDay),
          image,
          features: {
            create: features.map((feat) => ({ feature: feat })),
          },
        },
      })
    })

    revalidatePath('/')
    revalidatePath('/airlangga-car')
    revalidatePath('/admin')
    revalidatePath('/admin/cars')
    return { success: true }
  } catch (error) {
    console.error('Failed to update car:', error)
    return { success: false, error: 'Gagal memperbarui data kendaraan' }
  }
}
