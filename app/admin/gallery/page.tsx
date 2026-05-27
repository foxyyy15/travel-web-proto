import GalleryClient from './gallery-client'

export const dynamic = 'force-dynamic'

export default async function AdminGalleryPage() {
  const isMockData = !process.env.DATABASE_URL

  return <GalleryClient initialItems={[]} isMockData={isMockData} />
}
