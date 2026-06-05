import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '../../../../lib/prisma'
import {
  bookingsListQuerySchema,
  bookingActionSchema,
} from '@/types/schemas/admin'

/**
 * Build a Prisma `where` clause that filters PoojaBookings by a categorical
 * "booking type" derived from the row's shape. Mirrors the JS categoriser:
 *   - ASTROLOGY: poojaName === 'Vedic Astrology Consultation'
 *                OR specialInstructions contains 'Birth Details:'
 *   - PARIHARA : poojaId IS NULL AND poojaPrice = 0 AND nakshatra IS NOT NULL
 *                (must also NOT be ASTROLOGY)
 *   - POOJA    : everything else
 */
function buildTypeWhere(
  type: 'POOJA' | 'PARIHARA' | 'ASTROLOGY'
): Prisma.PoojaBookingWhereInput {
  const astrologyWhere: Prisma.PoojaBookingWhereInput = {
    OR: [
      { poojaName: 'Vedic Astrology Consultation' },
      { specialInstructions: { contains: 'Birth Details:' } },
    ],
  }

  const pariharaWhere: Prisma.PoojaBookingWhereInput = {
    AND: [
      { poojaId: null },
      { poojaPrice: 0 },
      { NOT: { nakshatra: null } },
      // PARIHARA must not be ASTROLOGY
      { NOT: astrologyWhere },
    ],
  }

  if (type === 'ASTROLOGY') return astrologyWhere
  if (type === 'PARIHARA') return pariharaWhere
  // POOJA: not astrology AND not parihara
  return { AND: [{ NOT: astrologyWhere }, { NOT: pariharaWhere }] }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = bookingsListQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    )

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { page, limit, status, search, type, sortBy, sortOrder } = parsed.data
    const skip = (page - 1) * limit

    // Build where clause
    const where: Prisma.PoojaBookingWhereInput = {}
    const andClauses: Prisma.PoojaBookingWhereInput[] = []

    if (status && status !== 'all') {
      where.bookingStatus = status
    }

    if (search) {
      where.OR = [
        { userName: { contains: search } },
        { userPhone: { contains: search } },
        { userEmail: { contains: search } },
        { poojaName: { contains: search } },
        { bookingNumber: { contains: search } },
        { receiptNumber: { contains: search } },
        { nakshatra: { contains: search } },
        { gothra: { contains: search } },
        { specialInstructions: { contains: search } },
        { preferredTime: { contains: search } },
        {
          user: {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } },
            ],
          },
        },
        {
          poojaService: {
            OR: [
              { poojaName: { contains: search } },
              { description: { contains: search } },
            ],
          },
        },
      ]
    }

    // Server-side type filter: push categorisation into the DB so pagination
    // and counts reflect the requested category.
    if (type && type !== 'ALL') {
      andClauses.push(buildTypeWhere(type))
    }

    if (andClauses.length > 0) {
      where.AND = andClauses
    }

    // Get total count (respects type filter)
    const total = await prisma.poojaBooking.count({ where })

    // Get bookings with pagination
    const bookings = await prisma.poojaBooking.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        poojaService: {
          select: {
            id: true,
            poojaName: true,
            description: true,
            price: true,
          },
        },
      },
    })

    // Categorize bookings by type (display label only; filtering already done above)
    const categorizedBookings = bookings.map((booking) => {
      let bookingType: 'POOJA' | 'PARIHARA' | 'ASTROLOGY' = 'POOJA'

      if (booking.poojaName === 'Vedic Astrology Consultation') {
        bookingType = 'ASTROLOGY'
      } else if (booking.specialInstructions?.includes('Birth Details:')) {
        bookingType = 'ASTROLOGY'
      } else if (!booking.poojaId && booking.poojaPrice === 0 && booking.nakshatra) {
        bookingType = 'PARIHARA'
      }

      return {
        ...booking,
        bookingType,
      }
    })

    // Get status counts (whole table, not affected by current filters — keep historical behaviour)
    const statusCounts = await prisma.poojaBooking.groupBy({
      by: ['bookingStatus'],
      _count: { id: true },
    })

    // Get type counts for the current page
    const typeCounts = categorizedBookings.reduce((acc, booking) => {
      acc[booking.bookingType] = (acc[booking.bookingType] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      bookings: categorizedBookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.bookingStatus] = item._count.id
        return acc
      }, {} as Record<string, number>),
      typeCounts,
    })
  } catch (error) {
    console.error('[admin/bookings] GET failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = bookingActionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { bookingId, action, reason } = parsed.data

    let updateData: Prisma.PoojaBookingUpdateInput = {}

    switch (action) {
      case 'confirm':
        updateData = {
          bookingStatus: 'CONFIRMED',
          confirmedByAdminAt: new Date(),
        }
        break
      case 'complete':
        updateData = {
          bookingStatus: 'COMPLETED',
          completedAt: new Date(),
        }
        break
      case 'cancel':
        updateData = {
          bookingStatus: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: reason || 'Cancelled by admin',
        }
        break
    }

    const booking = await prisma.poojaBooking.update({
      where: { id: bookingId },
      data: updateData,
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('[admin/bookings] PATCH failed:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}
