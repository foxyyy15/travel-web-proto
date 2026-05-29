import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, cars: [] })
  }

  try {
    const dbCars = await prisma.car.findMany({
      include: {
        features: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const cars = dbCars.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      capacity: c.capacity,
      pricePerDay: c.pricePerDay,
      image: c.image,
      features: c.features.map((f) => f.feature),
    }))

    return NextResponse.json({ success: true, cars })
  } catch (error) {
    console.error('API admin cars GET failed:', error)
    return NextResponse.json({ success: false, error: 'Gagal mengambil data kendaraan' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }, { status: 503 })
  }

  try {
    const data = await req.json()
    const id = randomUUID()
    const { name, type, capacity, pricePerDay, image, features = [] } = data

    if (!name || !type || !capacity || !pricePerDay || !image) {
      return NextResponse.json({ success: false, error: 'Mohon isi semua data yang wajib' }, { status: 400 })
    }

    const newCar = await prisma.car.create({
      data: {
        id,
        name,
        type,
        capacity: Number(capacity),
        pricePerDay: Number(pricePerDay),
        image,
        features: {
          create: features.map((feat: string) => ({ feature: feat })),
        },
      },
    })

    revalidatePath('/')
    revalidatePath('/airlangga-car')
    revalidatePath('/admin/cars')
    return NextResponse.json({ success: true, data: { id: newCar.id } })
  } catch (error) {
    console.error('API admin cars POST failed:', error)
    return NextResponse.json({ success: false, error: 'Gagal menambahkan armada baru' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }, { status: 503 })
  }

  try {
    const { id, name, type, capacity, pricePerDay, image, features = [] } = await req.json()

    if (!id || !name || !type || !capacity || !pricePerDay || !image) {
      return NextResponse.json({ success: false, error: 'Mohon isi semua data yang wajib' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      // Hapus feature lama
      await tx.carFeature.deleteMany({
        where: { carId: id },
      })

      // Update data mobil dan masukkan feature baru
      await tx.car.update({
        where: { id },
        data: {
          name,
          type,
          capacity: Number(capacity),
          pricePerDay: Number(pricePerDay),
          image,
          features: {
            create: features.map((feat: string) => ({ feature: feat })),
          },
        },
      })
    })

    revalidatePath('/')
    revalidatePath('/airlangga-car')
    revalidatePath('/admin/cars')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API admin cars PUT failed:', error)
    return NextResponse.json({ success: false, error: 'Gagal memperbarui data armada' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }, { status: 503 })
  }

  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID kendaraan tidak ditemukan' }, { status: 400 })
    }

    await prisma.car.delete({
      where: { id },
    })

    revalidatePath('/')
    revalidatePath('/airlangga-car')
    revalidatePath('/admin/cars')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API admin cars DELETE failed:', error)
    return NextResponse.json({ success: false, error: 'Gagal menghapus armada kendaraan' }, { status: 500 })
  }
}
