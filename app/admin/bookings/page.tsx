import { prisma } from '@/lib/prisma'
import BookingsClient from './bookings-client'

interface BookingType {
  id: string
  bookingCode: string
  customerName: string
  email: string
  whatsapp: string
  bookingType: string
  tripId: string | null
  carId: string | null
  participants: number
  rentalDays: number
  departureDate: string
  totalPrice: number
  status: string
  paymentDeadline: Date
  createdAt: Date
  updatedAt: Date
}

export const dynamic = 'force-dynamic'

const mockBookings = [
  {
    id: 'mock-1',
    bookingCode: 'TRP-100293',
    customerName: 'Ahmad Faisal',
    email: 'ahmad@example.com',
    whatsapp: '081234567890',
    bookingType: 'trip',
    departureDate: '2026-06-15',
    totalPrice: 25000000,
    status: 'paid',
    participants: 1,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'mock-2',
    bookingCode: 'CAR-100294',
    customerName: 'Clara Shinta',
    email: 'clara@example.com',
    whatsapp: '089876543210',
    bookingType: 'car',
    departureDate: '2026-05-28',
    totalPrice: 1600000,
    status: 'dp_paid',
    participants: 2, // 2 days
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'mock-3',
    bookingCode: 'TRP-100295',
    customerName: 'Dewi Lestari',
    email: 'dewi@example.com',
    whatsapp: '082211445566',
    bookingType: 'trip',
    departureDate: '2026-07-05',
    totalPrice: 4500000,
    status: 'cancelled',
    participants: 2,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
].filter(b => b.status === 'dp_paid' || b.status === 'paid')

export default async function BookingsPage() {
  if (!process.env.DATABASE_URL) {
    return <BookingsClient initialBookings={mockBookings} isMockData={true} />
  }

  try {
    const dbBookings = await prisma.booking.findMany({
      where: {
        status: {
          in: ['dp_paid', 'paid'],
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    const formattedBookings = dbBookings.map((b: BookingType) => ({
      id: b.id,
      bookingCode: b.bookingCode,
      customerName: b.customerName,
      email: b.email,
      whatsapp: b.whatsapp,
      bookingType: b.bookingType,
      departureDate: b.departureDate,
      totalPrice: b.totalPrice,
      status: b.status,
      participants: b.bookingType === 'trip' ? b.participants : b.rentalDays,
      createdAt: b.createdAt.toISOString(),
    }))

    return <BookingsClient initialBookings={formattedBookings} isMockData={false} />
  } catch (error) {
    console.warn('Prisma getBookings failed, falling back to mock bookings:', error)
    return <BookingsClient initialBookings={mockBookings} isMockData={true} />
  }
}
