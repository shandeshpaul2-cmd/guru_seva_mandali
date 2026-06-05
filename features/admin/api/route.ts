import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Row shape returned by the conditional-aggregation $queryRaw below.
 * Postgres returns numeric/bigint columns as strings or bigints via Prisma,
 * so we coerce them to Number on the way out.
 */
type DonationAggRow = {
  total_count: bigint | number
  today_count: bigint | number
  week_count: bigint | number
  month_count: bigint | number
  year_count: bigint | number
  total_revenue: number | string | null
  today_revenue: number | string | null
  week_revenue: number | string | null
  month_revenue: number | string | null
  year_revenue: number | string | null
}

type BookingAggRow = {
  total_count: bigint | number
  today_count: bigint | number
  week_count: bigint | number
  month_count: bigint | number
  year_count: bigint | number
}

const toNum = (v: bigint | number | string | null | undefined): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === 'bigint') return Number(v)
  if (typeof v === 'string') return Number(v) || 0
  return v
}

export async function GET(_request: NextRequest) {
  try {
    // Period boundaries (in server local time, matching previous behaviour).
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekStart = new Date(todayStart)
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const yearStart = new Date(now.getFullYear(), 0, 1)

    // Strategy: one conditional-aggregation $queryRaw per table replaces
    // the previous 15 separate count/aggregate calls. Each query returns one
    // row with bucketed counts/sums for today/week/month/year/all-time.
    const [donationAggRows, bookingAggRows, recentDonations, recentBookings, topPoojas, donationTypes] =
      await Promise.all([
        prisma.$queryRaw<DonationAggRow[]>`
          SELECT
            COUNT(*) AS total_count,
            COUNT(*) FILTER (WHERE created_at >= ${todayStart}) AS today_count,
            COUNT(*) FILTER (WHERE created_at >= ${weekStart}) AS week_count,
            COUNT(*) FILTER (WHERE created_at >= ${monthStart}) AS month_count,
            COUNT(*) FILTER (WHERE created_at >= ${yearStart}) AS year_count,
            COALESCE(SUM(amount) FILTER (WHERE payment_status = 'SUCCESS'), 0) AS total_revenue,
            COALESCE(SUM(amount) FILTER (WHERE payment_status = 'SUCCESS' AND created_at >= ${todayStart}), 0) AS today_revenue,
            COALESCE(SUM(amount) FILTER (WHERE payment_status = 'SUCCESS' AND created_at >= ${weekStart}), 0) AS week_revenue,
            COALESCE(SUM(amount) FILTER (WHERE payment_status = 'SUCCESS' AND created_at >= ${monthStart}), 0) AS month_revenue,
            COALESCE(SUM(amount) FILTER (WHERE payment_status = 'SUCCESS' AND created_at >= ${yearStart}), 0) AS year_revenue
          FROM donations
        `,
        prisma.$queryRaw<BookingAggRow[]>`
          SELECT
            COUNT(*) AS total_count,
            COUNT(*) FILTER (WHERE created_at >= ${todayStart}) AS today_count,
            COUNT(*) FILTER (WHERE created_at >= ${weekStart}) AS week_count,
            COUNT(*) FILTER (WHERE created_at >= ${monthStart}) AS month_count,
            COUNT(*) FILTER (WHERE created_at >= ${yearStart}) AS year_count
          FROM pooja_bookings
        `,
        prisma.donation.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, phone: true } },
          },
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
            preferredDate: true,
          },
        }),
        prisma.poojaBooking.groupBy({
          by: ['poojaName', 'poojaId'],
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
          take: 5,
        }),
        prisma.donation.groupBy({
          by: ['donationType'],
          _count: { id: true },
          _sum: { amount: true },
          orderBy: { _count: { id: 'desc' } },
        }),
      ])

    const d = donationAggRows[0]
    const b = bookingAggRows[0]

    const dashboardData = {
      overview: {
        totalDonations: toNum(d?.total_count),
        todayDonations: toNum(d?.today_count),
        weekDonations: toNum(d?.week_count),
        monthDonations: toNum(d?.month_count),
        yearDonations: toNum(d?.year_count),
        totalBookings: toNum(b?.total_count),
        todayBookings: toNum(b?.today_count),
        weekBookings: toNum(b?.week_count),
        monthBookings: toNum(b?.month_count),
        yearBookings: toNum(b?.year_count),
        totalRevenue: toNum(d?.total_revenue),
        todayRevenue: toNum(d?.today_revenue),
        weekRevenue: toNum(d?.week_revenue),
        monthRevenue: toNum(d?.month_revenue),
        yearRevenue: toNum(d?.year_revenue),
      },
      recentActivities: {
        donations: recentDonations,
        bookings: recentBookings,
      },
      topPoojas,
      donationTypes,
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('[admin/dashboard] GET failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}
