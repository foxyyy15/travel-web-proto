import { getTripBySlug, getTrips } from '@/lib/db-fallback'
import { notFound } from 'next/navigation'
import TripDetailPageClient from './trip-detail-client'

interface TripDetailPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const trips = await getTrips()
  return trips.map((trip) => ({
    slug: trip.slug,
  }))
}

export default async function TripDetailPage({ params }: TripDetailPageProps) {
  const { slug } = await params
  const trip = await getTripBySlug(slug)

  if (!trip) {
    notFound()
  }

  return <TripDetailPageClient trip={trip} />
}
