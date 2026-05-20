import { getTrips } from '@/lib/db-fallback'
import OpenTripClient from './open-trip-client'

export const dynamic = 'force-dynamic'

export default async function OpenTripPage() {
  const trips = await getTrips()
  return <OpenTripClient trips={trips} />
}
