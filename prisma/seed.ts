import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Real pooja services for Sri Raghavendra Swamy Brundavana
const poojaServices = [
  {
    poojaName: 'Sri Raghavendra Swamy Maha Aradhane',
    poojaNameKannada: 'ಶ್ರೀ ರಾಘವೇಂದ್ರ ಸ್ವಾಮಿ ಮಹಾರಾಧನೆ',
    poojaNameHindi: 'श्री राघवेंद्र स्वामी महाराधन',
    description: 'Complete aradhane with all traditional rituals including abhisheka, alankara, naivedya, and archana. Includes personal blessings and prasadam distribution.',
    price: 1101,
    durationMinutes: 120,
    displayOrder: 1,
    isActive: true,
    maxBookingsPerSlot: 3,
    requiresAdvanceNotice: true,
    advanceNoticeHours: 48
  },
  {
    poojaName: 'Sri Satyanarayana Swamy Vratha',
    poojaNameKannada: 'ಶ್ರೀ ಸತ್ಯನಾರಾಯಣ ಸ್ವಾಮಿ ವ್ರತ',
    poojaNameHindi: 'श्री सत्यनारायण स्वामी व्रत',
    description: 'Traditional Satyanarayana vratha with katha, puja, and homa. Perfect for special occasions, housewarming, or seeking divine blessings for prosperity.',
    price: 801,
    durationMinutes: 180,
    displayOrder: 2,
    isActive: true,
    maxBookingsPerSlot: 4,
    requiresAdvanceNotice: true,
    advanceNoticeHours: 24
  },
  {
    poojaName: 'Sri Lakshmi Ganapathi Homa',
    poojaNameKannada: 'ಶ್ರೀ ಲಕ್ಷ್ಮಿ ಗಣಪತಿ ಹೋಮ',
    poojaNameHindi: 'श्री लक्ष्मी गणपति होम',
    description: 'Combined homa for removing obstacles and invoking prosperity. Includes Ganapathi homa for success and Lakshmi homa for wealth and prosperity.',
    price: 1251,
    durationMinutes: 150,
    displayOrder: 3,
    isActive: true,
    maxBookingsPerSlot: 2,
    requiresAdvanceNotice: true,
    advanceNoticeHours: 36
  },
  {
    poojaName: 'Sri Navagraha Shanti',
    poojaNameKannada: 'ಶ್ರೀ ನವಗ್ರಹ ಶಾಂತಿ',
    poojaNameHindi: 'श्री नवग्रह शांति',
    description: 'Comprehensive Navagraha shanti puja to pacify all nine planets and remove astrological obstacles. Includes individual archana for each graha.',
    price: 2101,
    durationMinutes: 240,
    displayOrder: 4,
    isActive: true,
    maxBookingsPerSlot: 2,
    requiresAdvanceNotice: true,
    advanceNoticeHours: 48
  },
  {
    poojaName: 'Sri Mrityunjaya Homa',
    poojaNameKannada: 'ಶ್ರೀ ಮೃತ್ಯುಂಜಯ ಹೋಮ',
    poojaNameHindi: 'श्री मृत्युंजय होम',
    description: 'Powerful Mrityunjaya homa for health, longevity, and overcoming serious illnesses. Dedicated to Lord Shiva for ultimate healing.',
    price: 1601,
    durationMinutes: 180,
    displayOrder: 5,
    isActive: true,
    maxBookingsPerSlot: 2,
    requiresAdvanceNotice: true,
    advanceNoticeHours: 24
  },
  {
    poojaName: 'Sri Sudarshana Homa',
    poojaNameKannada: 'ಶ್ರೀ ಸುದರ್ಶನ ಹೋಮ',
    poojaNameHindi: 'श्री सुदर्शन होम',
    description: 'Powerful Sudarshana homa for removing negative energies, evil forces, and bringing protection. Includes Sudarshana japa and archana.',
    price: 1851,
    durationMinutes: 200,
    displayOrder: 6,
    isActive: true,
    maxBookingsPerSlot: 2,
    requiresAdvanceNotice: true,
    advanceNoticeHours: 36
  },
  {
    poojaName: 'Sri Saneeshwara Shanti',
    poojaNameKannada: 'ಶ್ರೀ ಶನೀಶ್ವರ ಶಾಂತಿ',
    poojaNameHindi: 'श्री शनेश्वर शांति',
    description: 'Special shani shanti puja and homa for reducing Saturn malefic effects, overcoming delays, and bringing stability in life and career.',
    price: 951,
    durationMinutes: 160,
    displayOrder: 7,
    isActive: true,
    maxBookingsPerSlot: 3,
    requiresAdvanceNotice: true,
    advanceNoticeHours: 24
  },
  {
    poojaName: 'Sri Mahalakshmi Kubera Homa',
    poojaNameKannada: 'ಶ್ರೀ ಮಹಾಲಕ್ಷ್ಮಿ ಕುಬೇರ ಹೋಮ',
    poojaNameHindi: 'श्री महालक्ष्मी कुबेर होम',
    description: 'Combined Lakshmi and Kubera homa for immense wealth, prosperity, and financial stability. Ideal for business growth and abundance.',
    price: 2501,
    durationMinutes: 210,
    displayOrder: 8,
    isActive: true,
    maxBookingsPerSlot: 2,
    requiresAdvanceNotice: true,
    advanceNoticeHours: 48
  },
  {
    poojaName: 'Sri Saraswathi Devi Puja',
    poojaNameKannada: 'ಶ್ರೀ ಸರಸ್ವತಿ ದೇವಿ ಪೂಜೆ',
    poojaNameHindi: 'श्री सरस्वती देवी पूजा',
    description: 'Dedicated puja to Goddess Saraswathi for knowledge, education, wisdom, and success in studies. Perfect for students and those in academics.',
    price: 551,
    durationMinutes: 90,
    displayOrder: 9,
    isActive: true,
    maxBookingsPerSlot: 5,
    requiresAdvanceNotice: true,
    advanceNoticeHours: 12
  },
  {
    poojaName: 'Sri Dhanvanthari Puja',
    poojaNameKannada: 'ಶ್ರೀ ಧನ್ವಂತರಿ ಪೂಜೆ',
    poojaNameHindi: 'श्री धन्वंतरि पूजा',
    description: 'Puja to Lord Dhanvanthari, the divine physician, for good health, healing from diseases, and medical professionals success.',
    price: 651,
    durationMinutes: 100,
    displayOrder: 10,
    isActive: true,
    maxBookingsPerSlot: 4,
    requiresAdvanceNotice: true,
    advanceNoticeHours: 12
  },
  {
    poojaName: 'Sri Rudrabhisheka',
    poojaNameKannada: 'ಶ್ರೀ ರುದ್ರಾಭಿಷೇಕ',
    poojaNameHindi: 'श्री रुद्राभिषेक',
    description: 'Traditional Rudrabhisheka with chanting of Sri Rudram and Chamakam. Powerful for removing negative karma and receiving Lord Shiva blessings.',
    price: 1351,
    durationMinutes: 180,
    displayOrder: 11,
    isActive: true,
    maxBookingsPerSlot: 3,
    requiresAdvanceNotice: true,
    advanceNoticeHours: 24
  }
]

// Sample donation types
const donationTypes = [
  { name: 'General Donation', description: 'General donation for temple maintenance and operations' },
  { name: 'Annadana', description: 'Donation for free food service (Anna Dana) to devotees' },
  { name: 'Vidya Dana', description: 'Donation for educational support and scholarships' },
  { name: 'Vastu Shanti', description: 'Donation for temple construction and renovation' },
  { name: 'Goshala', description: 'Donation for cow protection and maintenance' },
  { name: 'Medical Camp', description: 'Donation for free medical camps and health services' },
  { name: 'Priest Support', description: 'Donation for priest welfare and support' }
]

function getCurrentFiscalYear(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1 // 1-12

  if (month >= 4) {
    // April onwards - current year to next year
    return `${year}-${(year + 1) % 100}`
  } else {
    // Jan-Mar - previous year to current year
    return `${year - 1}-${year % 100}`
  }
}

async function main() {
  console.log('🌱 Starting enhanced database seeding...')

  try {
    // Clear existing data
    console.log('🧹 Cleaning existing data...')
    await prisma.auditLog.deleteMany()
    await prisma.poojaBooking.deleteMany()
    await prisma.donation.deleteMany()
    await prisma.poojaService.deleteMany()
    await prisma.bookingSequence.deleteMany()
    await prisma.receiptSequence.deleteMany()
    await prisma.user.deleteMany()

    // Initialize receipt sequences for current fiscal year
    const currentFiscalYear = getCurrentFiscalYear()
    console.log(`📊 Initializing receipt sequences for fiscal year: ${currentFiscalYear}`)

    // Create receipt sequences using upsert for each fiscal year
    for (const fiscalYear of [currentFiscalYear, '2023-24', '2025-26']) {
      await prisma.receiptSequence.upsert({
        where: { fiscalYear },
        update: {},
        create: { fiscalYear, lastSequence: 0 }
      })

      await prisma.bookingSequence.upsert({
        where: { fiscalYear },
        update: {},
        create: { fiscalYear, lastSequence: 0 }
      })
    }

    // Seed pooja services
    console.log('🙏 Seeding enhanced pooja services...')
    for (const service of poojaServices) {
      await prisma.poojaService.create({
        data: service
      })
    }

    // Create sample users (for testing purposes)
    console.log('👥 Creating sample users...')
    const sampleUsers = [
      {
        name: 'Ravi Kumar',
        phone: '9876543210',
        email: 'ravi.kumar@example.com',
        city: 'Bangalore',
        state: 'Karnataka',
        nakshatra: 'Rohini'
      },
      {
        name: 'Lakshmi Devi',
        phone: '9876543211',
        email: 'lakshmi.devi@example.com',
        city: 'Mysore',
        state: 'Karnataka',
        nakshatra: 'Pushya'
      },
      {
        name: 'Shankar Murthy',
        phone: '9876543212',
        city: 'Hubli',
        state: 'Karnataka',
        nakshatra: 'Ashwini'
      }
    ]

    for (const user of sampleUsers) {
      await prisma.user.create({
        data: {
          ...user,
          isAnonymous: false
        }
      })
    }

    // Create some sample donations for testing
    console.log('💰 Creating sample donations...')
    const users = await prisma.user.findMany()

    // Generate current date string for new ID format
    const today = new Date()
    const dateStr = today.getDate().toString().padStart(2, '0') +
                   (today.getMonth() + 1).toString().padStart(2, '0') +
                   today.getFullYear().toString().slice(-2)

    for (let i = 0; i < 5; i++) {
      const user = users[i % users.length]
      const donationType = donationTypes[Math.floor(Math.random() * donationTypes.length)]

      await prisma.donation.create({
        data: {
          receiptNumber: `DN-${dateStr}-${(i + 1).toString().padStart(4, '0')}`,
          amount: Math.floor(Math.random() * 3000) + 500,
          donationType: donationType.name,
          donationPurpose: donationType.description,
          userId: user.id,
          paymentStatus: 'SUCCESS',
          paymentMethod: 'razorpay',
          whatsappSent: true,
          emailSent: true
        }
      })
    }

    // Create some sample bookings for testing
    console.log('📅 Creating sample bookings...')
    const services = await prisma.poojaService.findMany()

    for (let i = 0; i < 3; i++) {
      const user = users[i % users.length]
      const service = services[i % services.length]
      const bookingNumber = `PB-${dateStr}-${(i + 1).toString().padStart(4, '0')}`

      await prisma.poojaBooking.create({
        data: {
          bookingNumber: bookingNumber,
          receiptNumber: bookingNumber, // Use same format for both
          userName: user.name,
          userPhone: user.phone,
          userEmail: user.email,
          nakshatra: user.nakshatra,
          poojaId: service.id,
          poojaName: service.poojaName,
          poojaPrice: service.price,
          preferredDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Future dates
          specialInstructions: 'Please perform with full rituals',
          bookingStatus: 'CONFIRMED',
          paymentStatus: 'SUCCESS',
          paymentMethod: 'razorpay',
          userConfirmationSent: true,
          adminNotificationSent: true
        }
      })
    }

    // Create audit log entries
    console.log('📋 Creating audit log entries...')
    await prisma.auditLog.createMany({
      data: [
        {
          action: 'CREATE',
          tableName: 'pooja_services',
          recordId: 'seed_data',
          newValues: JSON.stringify({ count: poojaServices.length }),
          ipAddress: '127.0.0.1',
          userAgent: 'Database Seeder'
        },
        {
          action: 'CREATE',
          tableName: 'users',
          recordId: 'seed_data',
          newValues: JSON.stringify({ count: sampleUsers.length }),
          ipAddress: '127.0.0.1',
          userAgent: 'Database Seeder'
        }
      ]
    })

    console.log('✅ Enhanced database seeding completed successfully!')
    console.log(`📊 Summary:`)
    console.log(`   - Pooja Services: ${poojaServices.length}`)
    console.log(`   - Sample Users: ${sampleUsers.length}`)
    console.log(`   - Sample Donations: 5`)
    console.log(`   - Sample Bookings: 3`)
    console.log(`   - Fiscal Year: ${currentFiscalYear}`)
    console.log(`\n🙏 Temple database is ready for use!`)
    console.log(`\n💡 Production Recommendations:`)
    console.log(`   - Switch to PostgreSQL for production`)
    console.log(`   - Set up proper database backups`)
    console.log(`   - Configure read replicas for scaling`)
    console.log(`   - Implement database connection pooling`)

  } catch (error) {
    console.error('❌ Error during seeding:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })