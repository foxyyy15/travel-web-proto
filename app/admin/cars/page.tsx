import { getCars } from '@/lib/db-fallback'
import CarsClient from './cars-client'

export const dynamic = 'force-dynamic'

export default async function AdminCarsPage() {
  const cars = await getCars()

  // Map database cars format to match expectations of CarsClient
  const formattedCars = cars.map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    capacity: c.capacity,
    pricePerDay: c.pricePerDay,
    image: c.image,
    features: c.features,
  }))

  const isMockData = !process.env.DATABASE_URL

  return <CarsClient initialCars={formattedCars} isMockData={isMockData} />
}
