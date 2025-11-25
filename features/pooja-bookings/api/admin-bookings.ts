import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}

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
              { email: { contains: search } }
            ]
          }
        },
        {
          poojaService: {
            OR: [
              { poojaName: { contains: search } },
              { description: { contains: search } }
            ]
          }
        }
      ]
    }

    // Get total count
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
            email: true
          }
        },
        poojaService: {
          select: {
            id: true,
            poojaName: true,
            description: true,
            price: true
          }
        }
      }
    })

    // Get status counts
    const statusCounts = await prisma.poojaBooking.groupBy({
      by: ['bookingStatus'],
      _count: { id: true }
    })

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item.bookingStatus] = item._count.id
        return acc
      }, {} as Record<string, number>)
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { bookingId, action } = body

    if (!bookingId || !action) {
      return NextResponse.json(
        { error: 'Booking ID and action are required' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'confirm':
        updateData = {
          bookingStatus: 'CONFIRMED',
          confirmedByAdminAt: new Date()
        }
        break
      case 'complete':
        updateData = {
          bookingStatus: 'COMPLETED',
          completedAt: new Date()
        }
        break
      case 'cancel':
        updateData = {
          bookingStatus: 'CANCELLED',
          cancelledAt: new Date(),
          cancellationReason: body.reason || 'Cancelled by admin'
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const booking = await prisma.poojaBooking.update({
      where: { id: bookingId },
      data: updateData
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}