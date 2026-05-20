import { prisma } from './prisma'
import { trips as staticTrips, cars as staticCars, testimonials as staticTestimonials } from './data'
import type { Trip, Car, Testimonial, Booking } from './types'

export async function getTrips(): Promise<Trip[]> {
  if (!process.env.DATABASE_URL) {
    return staticTrips
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
    })

    if (dbTrips.length === 0) return staticTrips

    return dbTrips.map((t) => ({
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
      category: t.category as 'domestic' | 'international',
      featured: t.featured,
    }))
  } catch (error) {
    console.warn('Prisma getTrips failed, falling back to static data:', error)
    return staticTrips
  }
}

export async function getTripBySlug(slug: string): Promise<Trip | null> {
  if (!process.env.DATABASE_URL) {
    return staticTrips.find((t) => t.slug === slug) || null
  }
  try {
    const t = await prisma.trip.findUnique({
      where: { slug },
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
    })

    if (!t) return staticTrips.find((st) => st.slug === slug) || null

    return {
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
      category: t.category as 'domestic' | 'international',
      featured: t.featured,
    }
  } catch (error) {
    console.warn(`Prisma getTripBySlug(${slug}) failed, falling back to static data:`, error)
    return staticTrips.find((t) => t.slug === slug) || null
  }
}

export async function getCars(): Promise<Car[]> {
  if (!process.env.DATABASE_URL) {
    return staticCars
  }
  try {
    const dbCars = await prisma.car.findMany({
      include: { features: true },
    })

    if (dbCars.length === 0) return staticCars

    return dbCars.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      capacity: c.capacity,
      pricePerDay: c.pricePerDay,
      image: c.image,
      features: c.features.map((f) => f.feature),
    }))
  } catch (error) {
    console.warn('Prisma getCars failed, falling back to static data:', error)
    return staticCars
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  if (!process.env.DATABASE_URL) {
    return staticTestimonials
  }
  try {
    const dbTestimonials = await prisma.testimonial.findMany({
      where: { isApproved: true },
      orderBy: { createdAt: 'desc' },
    })

    if (dbTestimonials.length === 0) return staticTestimonials

    return dbTestimonials.map((t) => ({
      id: t.id,
      name: t.name,
      avatar: t.avatar ?? '',
      location: t.location,
      rating: t.rating,
      comment: t.comment,
      tripTitle: t.tripTitle,
    }))
  } catch (error) {
    console.warn('Prisma getTestimonials failed, falling back to static data:', error)
    return staticTestimonials
  }
}

export async function createBooking(data: Omit<Booking, 'id' | 'createdAt'>): Promise<Booking> {
  const id = crypto.randomUUID()
  const createdAt = new Date().toISOString()
  const booking: Booking = { ...data, id, createdAt }

  if (!process.env.DATABASE_URL) {
    return booking
  }

  try {
    const dbBooking = await prisma.booking.create({
      data: {
        id,
        bookingCode: booking.bookingCode,
        customerName: booking.customerName,
        email: booking.email,
        whatsapp: booking.whatsapp,
        bookingType: booking.tripId ? 'trip' : 'car',
        tripId: booking.tripId || null,
        participants: booking.participants,
        departureDate: booking.departureDate,
        totalPrice: booking.totalPrice,
        status: booking.status,
        paymentDeadline: new Date(booking.paymentDeadline),
      },
    })
    return {
      ...booking,
      createdAt: dbBooking.createdAt.toISOString(),
      paymentDeadline: dbBooking.paymentDeadline.toISOString(),
    }
  } catch (error) {
    console.warn('Prisma createBooking failed, returning mock booking:', error)
    return booking
  }
}
