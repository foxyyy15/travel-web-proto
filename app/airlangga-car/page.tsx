import { getCars } from '@/lib/db-fallback'
import AirlanggaCarClient from './airlangga-car-client'

export const dynamic = 'force-dynamic'

export default async function AirlanggaCarPage() {
  const cars = await getCars()
  return <AirlanggaCarClient cars={cars} />
}
