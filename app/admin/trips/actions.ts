'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import type { Trip } from '@/lib/types'
import { randomUUID } from 'crypto'
import { auth } from '@/auth'

export async function deleteTrip(tripId: string) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

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

export async function createTrip(tripData: Omit<Trip, 'id'>) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }
  }

  try {
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
      return { success: false, error: 'Slug sudah digunakan oleh paket lain' }
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
          create: images.map((imageUrl, index) => ({
            imageUrl,
            orderIndex: index,
          })),
        },
        departureDates: {
          create: departureDates.map((date) => ({
            departureDate: date,
          })),
        },
        includes: {
          create: includes.map((item) => ({
            item,
          })),
        },
        excludes: {
          create: excludes.map((item) => ({
            item,
          })),
        },
        itineraries: {
          create: itinerary.map((dayObj) => ({
            day: Number(dayObj.day),
            title: dayObj.title,
            description: dayObj.description,
            activities: {
              create: dayObj.activities.map((act, actIndex) => ({
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
    
    return { success: true, data: { id: newTrip.id } }
  } catch (error) {
    console.error('Failed to create trip:', error)
    return { success: false, error: 'Gagal membuat paket open trip baru' }
  }
}

export async function updateTrip(tripId: string, tripData: Omit<Trip, 'id'>) {
  const session = await auth()
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' }
  }

  if (!process.env.DATABASE_URL) {
    return { success: false, error: 'Database tidak terkoneksi (Mode Simulasi)' }
  }

  try {
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
      return { success: false, error: 'Slug sudah digunakan oleh paket lain' }
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
            create: images.map((imageUrl, index) => ({
              imageUrl,
              orderIndex: index,
            })),
          },
          departureDates: {
            create: departureDates.map((date) => ({
              departureDate: date,
            })),
          },
          includes: {
            create: includes.map((item) => ({
              item,
            })),
          },
          excludes: {
            create: excludes.map((item) => ({
              item,
            })),
          },
          itineraries: {
            create: itinerary.map((dayObj) => ({
              day: Number(dayObj.day),
              title: dayObj.title,
              description: dayObj.description,
              activities: {
                create: dayObj.activities.map((act, actIndex) => ({
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
    
    return { success: true }
  } catch (error) {
    console.error('Failed to update trip:', error)
    return { success: false, error: 'Gagal memperbarui paket open trip' }
  }
}

