import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'
import { getGalleryItems } from '@/lib/db-fallback'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await getGalleryItems()
    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('API admin gallery GET failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch gallery items' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }, { status: 503 })
  }

  try {
    const data = await req.json()
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
    return NextResponse.json({ success: true, data: { id: newItem.id } })
  } catch (error) {
    console.error('API admin gallery POST failed:', error)
    return NextResponse.json({ success: false, error: 'Gagal menambahkan foto galeri baru' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }, { status: 503 })
  }

  try {
    const { id, ...data } = await req.json()
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing gallery item ID' }, { status: 400 })
    }

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
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API admin gallery PUT failed:', error)
    return NextResponse.json({ success: false, error: 'Gagal memperbarui foto galeri' }, { status: 500 })
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
      return NextResponse.json({ success: false, error: 'Missing gallery item ID' }, { status: 400 })
    }

    await (prisma as any).galleryItem.delete({
      where: { id },
    })

    revalidatePath('/')
    revalidatePath('/admin/gallery')
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API admin gallery DELETE failed:', error)
    return NextResponse.json({ success: false, error: 'Gagal menghapus foto galeri' }, { status: 500 })
  }
}
