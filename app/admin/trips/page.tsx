import { getTrips } from '@/lib/db-fallback'
import TripsClient from './trips-client'

export const dynamic = 'force-dynamic'

export default async function AdminTripsPage() {
  const trips = await getTrips()

  // Map trips to the properties expected by the TripsClient
  const formattedTrips = trips.map((t) => ({
    id: t.id,
    title: t.title,
    slug: t.slug,
    destination: t.destination,
    duration: t.duration,
    price: t.price,
    originalPrice: t.originalPrice,
    image: t.image,
    availableSlots: t.availableSlots,
    totalSlots: t.totalSlots,
    category: t.category,
    featured: t.featured ?? false,
  }))

  const isMockData = !process.env.DATABASE_URL

  return <TripsClient initialTrips={formattedTrips} isMockData={isMockData} />
}
