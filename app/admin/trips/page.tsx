import TripsClient from './trips-client'

export const dynamic = 'force-dynamic'

export default async function AdminTripsPage() {
  const isMockData = !process.env.DATABASE_URL

  return <TripsClient initialTrips={[]} isMockData={isMockData} />
}
