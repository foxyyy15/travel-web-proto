import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create Default Admin User
  const adminEmail = 'admin@airlanggatravel.com'
  const existingAdmin = await prisma.adminUser.findUnique({
    where: { email: adminEmail },
  })

  if (!existingAdmin) {
    const adminPassword = process.env.ADMIN_SEED_PASSWORD
    if (!adminPassword) {
      console.warn('⚠️  ADMIN_SEED_PASSWORD env var not set. Skipping admin user creation.')
      console.warn('   Set ADMIN_SEED_PASSWORD in your .env file and re-run seed.')
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 12)
      await prisma.adminUser.create({
        data: {
          username: 'Administrator',
          email: adminEmail,
          passwordHash,
          role: 'admin',
        },
      })
      console.log('✅ Admin user created with email:', adminEmail)
    }
  } else {
    console.log('Admin user already exists.')
  }

  // 2. Seed Trips
  const tripsData = [
    {
      id: '1',
      title: 'East Europe Adventure',
      slug: 'east-europe-adventure',
      destination: 'East Europe',
      duration: '10 Hari 9 Malam',
      price: 25000000,
      originalPrice: 28000000,
      image: 'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1519677100203-a0e668c92439?w=800&q=80',
        'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=800&q=80',
        'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800&q=80',
      ],
      availableSlots: 8,
      totalSlots: 15,
      departureDates: ['2026-06-15', '2026-07-20', '2026-08-10'],
      meetingPoint: 'Bandara Soekarno-Hatta Terminal 3',
      itinerary: [
        {
          day: 1,
          title: 'Jakarta - Prague',
          description: 'Perjalanan menuju Prague, ibu kota Republik Ceko',
          activities: ['Check-in bandara', 'Penerbangan ke Prague', 'Transit di Dubai'],
        },
        {
          day: 2,
          title: 'Prague City Tour',
          description: 'Menjelajahi keindahan kota Prague',
          activities: ['Charles Bridge', 'Old Town Square', 'Prague Castle', 'St. Vitus Cathedral'],
        },
        {
          day: 3,
          title: 'Prague - Vienna',
          description: 'Perjalanan menuju Vienna, Austria',
          activities: ['Cesky Krumlov', 'Perjalanan ke Vienna', 'Dinner di Vienna'],
        },
      ],
      includes: ['Tiket pesawat PP', 'Hotel bintang 4', 'Makan sesuai program', 'Tour guide berbahasa Indonesia', 'Transportasi AC', 'Tiket masuk objek wisata'],
      excludes: ['Visa Schengen', 'Tips guide dan driver', 'Pengeluaran pribadi', 'Asuransi perjalanan'],
      category: 'international',
      featured: true,
    },
    {
      id: '2',
      title: 'Bromo Sunrise & Yogyakarta Heritage',
      slug: 'bromo-yogya-heritage',
      destination: 'Bromo - Yogyakarta',
      duration: '4 Hari 3 Malam',
      price: 3500000,
      image: 'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?w=800&q=80',
        'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
        'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800&q=80',
      ],
      availableSlots: 4,
      totalSlots: 12,
      departureDates: ['2026-05-25', '2026-06-08', '2026-06-22', '2026-07-06'],
      meetingPoint: 'Stasiun Surabaya Gubeng',
      itinerary: [
        {
          day: 1,
          title: 'Surabaya - Bromo',
          description: 'Perjalanan menuju kawasan Bromo',
          activities: ['Penjemputan di Surabaya', 'Perjalanan ke Bromo', 'Check-in hotel', 'Free time'],
        },
        {
          day: 2,
          title: 'Bromo Sunrise',
          description: 'Menyaksikan sunrise legendaris di Bromo',
          activities: ['Sunrise di Penanjakan', 'Jeep tour ke kawah Bromo', 'Savana & Pasir Berbisik', 'Perjalanan ke Yogya'],
        },
        {
          day: 3,
          title: 'Yogyakarta Heritage',
          description: 'Menjelajahi warisan budaya Yogyakarta',
          activities: ['Candi Borobudur', 'Candi Prambanan', 'Malioboro', 'Kuliner Gudeg'],
        },
        {
          day: 4,
          title: 'Yogyakarta - Pulang',
          description: 'Hari terakhir tour',
          activities: ['Keraton Yogyakarta', 'Taman Sari', 'Transfer ke bandara/stasiun'],
        },
      ],
      includes: ['Transportasi AC', 'Jeep Bromo', 'Hotel bintang 3', 'Makan sesuai program', 'Tour guide lokal', 'Tiket masuk wisata'],
      excludes: ['Tiket pesawat/kereta', 'Tips guide dan driver', 'Pengeluaran pribadi'],
      category: 'domestic',
      featured: true,
    },
    {
      id: '3',
      title: 'Dieng Plateau & Yogyakarta Culture',
      slug: 'dieng-yogya-culture',
      destination: 'Dieng - Yogyakarta',
      duration: '3 Hari 2 Malam',
      price: 2800000,
      image: 'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1584810359583-96fc3448beaa?w=800&q=80',
        'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=800&q=80',
      ],
      availableSlots: 6,
      totalSlots: 10,
      departureDates: ['2026-06-01', '2026-06-15', '2026-07-01'],
      meetingPoint: 'Bandara Adi Soemarmo Solo',
      itinerary: [
        {
          day: 1,
          title: 'Solo - Dieng',
          description: 'Perjalanan menuju dataran tinggi Dieng',
          activities: ['Penjemputan di Solo', 'Perjalanan ke Dieng', 'Telaga Warna', 'Kawah Sikidang'],
        },
        {
          day: 2,
          title: 'Dieng - Yogyakarta',
          description: 'Eksplorasi Dieng dan perjalanan ke Yogya',
          activities: ['Golden Sunrise Sikunir', 'Candi Arjuna', 'Perjalanan ke Yogyakarta', 'Malioboro'],
        },
        {
          day: 3,
          title: 'Yogyakarta - Pulang',
          description: 'Hari terakhir tour',
          activities: ['Candi Borobudur', 'Oleh-oleh khas Yogya', 'Transfer ke bandara'],
        },
      ],
      includes: ['Transportasi AC', 'Hotel bintang 3', 'Makan sesuai program', 'Tour guide lokal', 'Tiket masuk wisata'],
      excludes: ['Tiket pesawat/kereta', 'Tips guide dan driver', 'Pengeluaran pribadi'],
      category: 'domestic',
      featured: true,
    },
    {
      id: '4',
      title: 'Bali Paradise Escape',
      slug: 'bali-paradise-escape',
      destination: 'Bali',
      duration: '5 Hari 4 Malam',
      price: 4500000,
      image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
      images: [
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
        'https://images.unsplash.com/photo-1555400038-63f5ba517a47?w=800&q=80',
      ],
      availableSlots: 10,
      totalSlots: 15,
      departureDates: ['2026-06-10', '2026-07-05', '2026-08-01'],
      meetingPoint: 'Bandara Ngurah Rai Bali',
      itinerary: [
        {
          day: 1,
          title: 'Arrival Bali',
          description: 'Tiba di Pulau Dewata',
          activities: ['Airport pickup', 'Check-in hotel', 'Pantai Kuta', 'Dinner'],
        },
        {
          day: 2,
          title: 'Ubud Tour',
          description: 'Menjelajahi keindahan Ubud',
          activities: ['Tegallalang Rice Terrace', 'Tirta Empul', 'Ubud Monkey Forest', 'Ubud Palace'],
        },
      ],
      includes: ['Transportasi AC', 'Hotel bintang 4', 'Makan sesuai program', 'Tour guide', 'Tiket masuk wisata'],
      excludes: ['Tiket pesawat', 'Tips guide dan driver', 'Pengeluaran pribadi', 'Water sports'],
      category: 'domestic',
      featured: false,
    },
    {
      id: '5',
      title: 'Raja Ampat Diving Paradise',
      slug: 'raja-ampat-diving',
      destination: 'Raja Ampat',
      duration: '6 Hari 5 Malam',
      price: 15000000,
      image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=800&q=80',
      images: [],
      availableSlots: 5,
      totalSlots: 8,
      departureDates: ['2026-07-15', '2026-08-20'],
      meetingPoint: 'Bandara Domine Eduard Osok Sorong',
      itinerary: [
        {
          day: 1,
          title: 'Sorong - Waisai',
          description: 'Perjalanan menuju Raja Ampat',
          activities: ['Airport pickup', 'Ferry ke Waisai', 'Check-in resort'],
        },
      ],
      includes: ['Transportasi laut', 'Resort', 'Makan 3x sehari', 'Snorkeling equipment', 'Guide lokal'],
      excludes: ['Tiket pesawat', 'Diving equipment', 'Pengeluaran pribadi'],
      category: 'domestic',
      featured: false,
    },
  ]

  for (const t of tripsData) {
    const existing = await prisma.trip.findUnique({
      where: { slug: t.slug },
    })

    if (!existing) {
      await prisma.trip.create({
        data: {
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
          meetingPoint: t.meetingPoint,
          category: t.category,
          featured: t.featured,
          images: {
            create: t.images.map((img, idx) => ({
              imageUrl: img,
              orderIndex: idx,
            })),
          },
          departureDates: {
            create: t.departureDates.map((date) => ({
              departureDate: date,
            })),
          },
          includes: {
            create: t.includes.map((item) => ({ item })),
          },
          excludes: {
            create: t.excludes.map((item) => ({ item })),
          },
          itineraries: {
            create: t.itinerary.map((day) => ({
              day: day.day,
              title: day.title,
              description: day.description,
              activities: {
                create: day.activities.map((act, actIdx) => ({
                  activity: act,
                  orderIndex: actIdx,
                })),
              },
            })),
          },
        },
      })
      console.log(`Trip seeded: ${t.title}`)
    }
  }

  // 3. Seed Cars
  const carsData = [
    {
      id: '1',
      name: 'Toyota Hiace Premio',
      type: 'Van',
      capacity: 14,
      pricePerDay: 1500000,
      image: 'https://images.unsplash.com/photo-1609520505218-7421df70ba5d?w=800&q=80',
      features: ['AC', 'Reclining Seat', 'Audio System', 'USB Charger', 'WiFi'],
    },
    {
      id: '2',
      name: 'Toyota Innova Reborn',
      type: 'MPV',
      capacity: 7,
      pricePerDay: 800000,
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80',
      features: ['AC', 'Leather Seat', 'Audio System', 'USB Charger'],
    },
    {
      id: '3',
      name: 'Toyota Alphard',
      type: 'Luxury MPV',
      capacity: 7,
      pricePerDay: 2500000,
      image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80',
      features: ['AC', 'Premium Leather Seat', 'Premium Audio', 'Captain Seat', 'WiFi', 'TV'],
    },
    {
      id: '4',
      name: 'Mercedes Sprinter',
      type: 'Van',
      capacity: 16,
      pricePerDay: 2000000,
      image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
      features: ['AC', 'Reclining Seat', 'Premium Audio', 'WiFi', 'Toilet'],
    },
  ]

  for (const c of carsData) {
    const existing = await prisma.car.findUnique({
      where: { id: c.id },
    })

    if (!existing) {
      await prisma.car.create({
        data: {
          id: c.id,
          name: c.name,
          type: c.type,
          capacity: c.capacity,
          pricePerDay: c.pricePerDay,
          image: c.image,
          features: {
            create: c.features.map((feat) => ({ feature: feat })),
          },
        },
      })
      console.log(`Car seeded: ${c.name}`)
    }
  }

  // 4. Seed Testimonials
  const testimonialsData = [
    {
      id: '1',
      name: 'Sarah Wijaya',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80',
      location: 'Jakarta',
      rating: 5,
      comment: 'Pengalaman trip ke East Europe bersama Airlangga Travel luar biasa! Guide yang ramah, itinerary yang well-planned, dan semua berjalan lancar. Pasti akan repeat order!',
      tripTitle: 'East Europe Adventure',
      tripId: '1',
    },
    {
      id: '2',
      name: 'Budi Santoso',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80',
      location: 'Surabaya',
      rating: 5,
      comment: 'Trip Bromo-Yogya sangat memorable! Sunrise di Bromo indah banget, guide nya juga sangat informatif. Worth every penny!',
      tripTitle: 'Bromo Sunrise & Yogyakarta Heritage',
      tripId: '2',
    },
    {
      id: '3',
      name: 'Linda Permata',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&q=80',
      location: 'Bandung',
      rating: 5,
      comment: 'Sudah 3x ikut open trip sama Airlangga Travel dan selalu puas. Pelayanan prima, harga bersaing, dan yang paling penting aman dan nyaman.',
      tripTitle: 'Dieng Plateau & Yogyakarta Culture',
      tripId: '3',
    },
  ]

  for (const t of testimonialsData) {
    const existing = await prisma.testimonial.findUnique({
      where: { id: t.id },
    })

    if (!existing) {
      await prisma.testimonial.create({
        data: {
          id: t.id,
          name: t.name,
          avatar: t.avatar,
          location: t.location,
          rating: t.rating,
          comment: t.comment,
          tripTitle: t.tripTitle,
          tripId: t.tripId,
          isApproved: true,
        },
      })
      console.log(`Testimonial seeded: ${t.name}`)
    }
  }

  console.log('Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
