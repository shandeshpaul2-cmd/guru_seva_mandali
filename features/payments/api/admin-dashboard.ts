import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    // Get current date for period comparisons
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    // Get counts for different periods
    const [
      totalDonations,
      todayDonations,
      weekDonations,
      monthDonations,
      yearDonations,
      totalBookings,
      todayBookings,
      weekBookings,
      monthBookings,
      yearBookings,
      totalRevenue,
      todayRevenue,
      weekRevenue,
      monthRevenue,
      yearRevenue
    ] = await Promise.all([
      // Donation counts
      prisma.donation.count(),
      prisma.donation.count({
        where: { createdAt: { gte: todayStart } }
      }),
      prisma.donation.count({
        where: { createdAt: { gte: weekStart } }
      }),
      prisma.donation.count({
        where: { createdAt: { gte: monthStart } }
      }),
      prisma.donation.count({
        where: { createdAt: { gte: yearStart } }
      }),
      // Booking counts
      prisma.poojaBooking.count(),
      prisma.poojaBooking.count({
        where: { createdAt: { gte: todayStart } }
      }),
      prisma.poojaBooking.count({
        where: { createdAt: { gte: weekStart } }
      }),
      prisma.poojaBooking.count({
        where: { createdAt: { gte: monthStart } }
      }),
      prisma.poojaBooking.count({
        where: { createdAt: { gte: yearStart } }
      }),
      // Revenue calculations
      prisma.donation.aggregate({
        where: { paymentStatus: 'SUCCESS' },
        _sum: { amount: true }
      }),
      prisma.donation.aggregate({
        where: {
          paymentStatus: 'SUCCESS',
          createdAt: { gte: todayStart }
        },
        _sum: { amount: true }
      }),
      prisma.donation.aggregate({
        where: {
          paymentStatus: 'SUCCESS',
          createdAt: { gte: weekStart }
        },
        _sum: { amount: true }
      }),
      prisma.donation.aggregate({
        where: {
          paymentStatus: 'SUCCESS',
          createdAt: { gte: monthStart }
        },
        _sum: { amount: true }
      }),
      prisma.donation.aggregate({
        where: {
          paymentStatus: 'SUCCESS',
          createdAt: { gte: yearStart }
        },
        _sum: { amount: true }
      })
    ])

    // Get recent activities
    const [recentDonations, recentBookings] = await Promise.all([
      prisma.donation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              name: true,
              phone: true
            }
          }
        }
      }),
      prisma.poojaBooking.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          bookingNumber: true,
          receiptNumber: true,
          poojaName: true,
          poojaPrice: true,
          bookingStatus: true,
          paymentStatus: true,
          createdAt: true,
          userName: true,
          userPhone: true,
          preferredDate: true
        }
      })
    ])

    // Get top pooja services
    const topPoojas = await prisma.poojaBooking.groupBy({
      by: ['poojaName', 'poojaId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    })

    // Get donation types distribution
    const donationTypes = await prisma.donation.groupBy({
      by: ['donationType'],
      _count: { id: true },
      _sum: { amount: true },
      orderBy: { _count: { id: 'desc' } }
    })

    const dashboardData = {
      overview: {
        totalDonations,
        todayDonations,
        weekDonations,
        monthDonations,
        yearDonations,
        totalBookings,
        todayBookings,
        weekBookings,
        monthBookings,
        yearBookings,
        totalRevenue: totalRevenue._sum.amount || 0,
        todayRevenue: todayRevenue._sum.amount || 0,
        weekRevenue: weekRevenue._sum.amount || 0,
        monthRevenue: monthRevenue._sum.amount || 0,
        yearRevenue: yearRevenue._sum.amount || 0
      },
      recentActivities: {
        donations: recentDonations,
        bookings: recentBookings
      },
      topPoojas,
      donationTypes
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}