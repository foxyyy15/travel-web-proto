import { prisma } from '@/lib/prisma'
import TestimonialsClient from './testimonials-client'

interface TestimonialType {
  id: string
  name: string
  avatar: string | null
  location: string
  rating: number
  comment: string
  tripTitle: string
  tripId: string | null
  isApproved: boolean
  createdAt: Date
}

export const dynamic = 'force-dynamic'

const mockTestimonials = [
  {
    id: 'mock-test-1',
    name: 'Sarah Wijaya',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
    location: 'Jakarta',
    rating: 5,
    comment: 'Pengalaman trip ke East Europe bersama Airlangga Travel luar biasa! Guide yang ramah, itinerary yang well-planned, dan semua berjalan lancar.',
    tripTitle: 'East Europe Adventure',
    isApproved: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'mock-test-2',
    name: 'Rian Hidayat',
    avatar: '',
    location: 'Bandung',
    rating: 4,
    comment: 'Pelayanannya sangat bagus, mobil Hiace Premio nya bersih dan wangi. Namun driver sedikit terlambat menjemput karena macet.',
    tripTitle: 'Toyota Hiace Premio rental',
    isApproved: false,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
  },
]

export default async function TestimonialsModerationPage() {
  if (!process.env.DATABASE_URL) {
    return <TestimonialsClient initialTestimonials={mockTestimonials} isMockData={true} />
  }

  try {
    const dbTestimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
    })

    const formattedTestimonials = dbTestimonials.map((t: TestimonialType) => ({
      id: t.id,
      name: t.name,
      avatar: t.avatar,
      location: t.location,
      rating: t.rating,
      comment: t.comment,
      tripTitle: t.tripTitle,
      isApproved: t.isApproved,
      createdAt: t.createdAt.toISOString(),
    }))

    return <TestimonialsClient initialTestimonials={formattedTestimonials} isMockData={false} />
  } catch (error) {
    console.warn('Prisma getTestimonials failed, falling back to mock testimonials:', error)
    return <TestimonialsClient initialTestimonials={mockTestimonials} isMockData={true} />
  }
}
