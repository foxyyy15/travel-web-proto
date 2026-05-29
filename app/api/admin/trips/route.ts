import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { randomUUID } from 'crypto'

export const dynamic = 'force-dynamic'

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: true, trips: [] })
  }

  try {
    const dbTrips = await prisma.trip.findMany({
      include: {
        images: { orderBy: { orderIndex: 'asc' } },
        departureDates: true,
        itineraries: {
          include: {
            activities: { orderBy: { orderIndex: 'asc' } },
          },
          orderBy: { day: 'asc' },
        },
        includes: true,
        excludes: true,
      },
      orderBy: { createdAt: 'desc' }
    })

    const trips = dbTrips.map((t) => ({
      id: t.id,
      title: t.title,
      slug: t.slug,
      destination: t.destination,
      duration: t.duration,
      price: t.price,
      originalPrice: t.originalPrice ?? undefined,
      image: t.image,
      images: t.images.map((img) => img.imageUrl),
      availableSlots: t.availableSlots,
      totalSlots: t.totalSlots,
      departureDates: t.departureDates.map((d) => d.departureDate),
      meetingPoint: t.meetingPoint,
      itinerary: t.itineraries.map((it) => ({
        day: it.day,
        title: it.title,
        description: it.description,
        activities: it.activities.map((a) => a.activity),
      })),
      includes: t.includes.map((inc) => inc.item),
      excludes: t.excludes.map((exc) => exc.item),
      category: t.category,
      featured: t.featured,
      depositPercentage: t.depositPercentage,
      description: (t as any).description ?? undefined,
      terms: (t as any).terms ?? undefined,
      transportation: (t as any).transportation ?? 'Darat',
    }))

    return NextResponse.json({ success: true, trips })
  } catch (error) {
    console.error('API admin trips GET failed:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch trips' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }, { status: 503 })
  }

  try {
    const tripData = await req.json()
    const id = randomUUID()
    const {
      title,
      slug,
      destination,
      duration,
      price,
      originalPrice,
      image,
      images = [],
      availableSlots,
      totalSlots,
      departureDates = [],
      meetingPoint,
      itinerary = [],
      includes = [],
      excludes = [],
      category,
      featured = false,
      depositPercentage = 100,
      description,
      terms,
      transportation,
    } = tripData

    // Check if slug is unique
    const existing = await prisma.trip.findUnique({
      where: { slug },
    })
    if (existing) {
      return NextResponse.json({ success: false, error: 'Slug sudah digunakan oleh paket lain' }, { status: 400 })
    }

    const newTrip = await prisma.trip.create({
      data: {
        id,
        title,
        slug,
        destination,
        duration,
        price,
        originalPrice: originalPrice || null,
        image,
        availableSlots: Number(availableSlots),
        totalSlots: Number(totalSlots),
        meetingPoint,
        category,
        featured,
        depositPercentage: Number(depositPercentage),
        description,
        terms,
        transportation: transportation || 'Darat',
        images: {
          create: images.map((imageUrl: string, index: number) => ({
            imageUrl,
            orderIndex: index,
          })),
        },
        departureDates: {
          create: departureDates.map((date: string) => ({
            departureDate: date,
          })),
        },
        includes: {
          create: includes.map((item: string) => ({
            item,
          })),
        },
        excludes: {
          create: excludes.map((item: string) => ({
            item,
          })),
        },
        itineraries: {
          create: itinerary.map((dayObj: any) => ({
            day: Number(dayObj.day),
            title: dayObj.title,
            description: dayObj.description,
            activities: {
              create: dayObj.activities.map((act: string, actIndex: number) => ({
                activity: act,
                orderIndex: actIndex,
              })),
            },
          })),
        },
      } as any,
    })

    revalidatePath('/')
    revalidatePath('/open-trip')
    revalidatePath('/admin')
    revalidatePath('/admin/trips')

    return NextResponse.json({ success: true, data: { id: newTrip.id } })
  } catch (error) {
    console.error('API admin trips POST failed:', error)
    return NextResponse.json({ success: false, error: 'Gagal membuat paket open trip baru' }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }, { status: 503 })
  }

  try {
    const { id: tripId, ...tripData } = await req.json()
    if (!tripId) {
      return NextResponse.json({ success: false, error: 'Missing trip ID' }, { status: 400 })
    }

    const {
      title,
      slug,
      destination,
      duration,
      price,
      originalPrice,
      image,
      images = [],
      availableSlots,
      totalSlots,
      departureDates = [],
      meetingPoint,
      itinerary = [],
      includes = [],
      excludes = [],
      category,
      featured = false,
      depositPercentage = 100,
      description,
      terms,
      transportation,
    } = tripData

    // Check if slug is unique (excluding this trip)
    const existing = await prisma.trip.findUnique({
      where: { slug },
    })
    if (existing && existing.id !== tripId) {
      return NextResponse.json({ success: false, error: 'Slug sudah digunakan oleh paket lain' }, { status: 400 })
    }

    await prisma.$transaction(async (tx) => {
      // Clear old relations (Cascade deletes will clean up itinerary activities)
      await tx.tripImage.deleteMany({ where: { tripId } })
      await tx.tripDepartureDate.deleteMany({ where: { tripId } })
      await tx.tripInclude.deleteMany({ where: { tripId } })
      await tx.tripExclude.deleteMany({ where: { tripId } })
      await tx.tripItinerary.deleteMany({ where: { tripId } })

      // Update main trip and create new relations
      await tx.trip.update({
        where: { id: tripId },
        data: {
          title,
          slug,
          destination,
          duration,
          price,
          originalPrice: originalPrice || null,
          image,
          availableSlots: Number(availableSlots),
          totalSlots: Number(totalSlots),
          meetingPoint,
          category,
          featured,
          depositPercentage: Number(depositPercentage),
          description,
          terms,
          transportation: transportation || 'Darat',
          images: {
            create: images.map((imageUrl: string, index: number) => ({
              imageUrl,
              orderIndex: index,
            })),
          },
          departureDates: {
            create: departureDates.map((date: string) => ({
              departureDate: date,
            })),
          },
          includes: {
            create: includes.map((item: string) => ({
              item,
            })),
          },
          excludes: {
            create: excludes.map((item: string) => ({
              item,
            })),
          },
          itineraries: {
            create: itinerary.map((dayObj: any) => ({
              day: Number(dayObj.day),
              title: dayObj.title,
              description: dayObj.description,
              activities: {
                create: dayObj.activities.map((act: string, actIndex: number) => ({
                  activity: act,
                  orderIndex: actIndex,
                })),
              },
            })),
          },
        } as any,
      })
    })

    revalidatePath('/')
    revalidatePath('/open-trip')
    revalidatePath(`/open-trip/${slug}`)
    revalidatePath('/admin')
    revalidatePath('/admin/trips')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API admin trips PUT failed:', error)
    return NextResponse.json({ success: false, error: 'Gagal memperbarui paket open trip' }, { status: 500 })
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
      return NextResponse.json({ success: false, error: 'Missing trip ID' }, { status: 400 })
    }

    await prisma.trip.delete({
      where: { id },
    })

    revalidatePath('/')
    revalidatePath('/open-trip')
    revalidatePath('/admin')
    revalidatePath('/admin/trips')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API admin trips DELETE failed:', error)
    return NextResponse.json({ success: false, error: 'Gagal menghapus paket open trip' }, { status: 500 })
  }
}
