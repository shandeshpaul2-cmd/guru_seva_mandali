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
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const skip = (page - 1) * limit

    // Build where clause for donations
    const donationWhere: any = {}

    if (status && status !== 'all') {
      donationWhere.paymentStatus = status
    }

    if (search) {
      donationWhere.OR = [
        { receiptNumber: { contains: search } },
        { donationType: { contains: search } },
        { donationPurpose: { contains: search } },
        { razorpayOrderId: { contains: search } },
        { razorpayPaymentId: { contains: search } },
        {
          user: {
            OR: [
              { name: { contains: search } },
              { phone: { contains: search } },
              { email: { contains: search } }
            ]
          }
        }
      ]
    }

    // Date range filter
    if (startDate || endDate) {
      donationWhere.createdAt = {}
      if (startDate) {
        donationWhere.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        donationWhere.createdAt.lte = new Date(endDate)
      }
    }

    // Build where clause for pooja bookings
    const bookingWhere: any = {}

    if (status && status !== 'all') {
      bookingWhere.paymentStatus = status
    }

    if (search) {
      bookingWhere.OR = [
        { receiptNumber: { contains: search } },
        { bookingNumber: { contains: search } },
        { poojaName: { contains: search } },
        { userName: { contains: search } },
        { userPhone: { contains: search } },
        { userEmail: { contains: search } },
        { razorpayOrderId: { contains: search } },
        { razorpayPaymentId: { contains: search } }
      ]
    }

    // Date range filter for bookings
    if (startDate || endDate) {
      bookingWhere.createdAt = {}
      if (startDate) {
        bookingWhere.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        bookingWhere.createdAt.lte = new Date(endDate)
      }
    }

    // Get donations from database
    const donations = await prisma.donation.findMany({
      where: donationWhere,
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
        }
      }
    })

    // Get pooja bookings from database
    const poojaBookings = await prisma.poojaBooking.findMany({
      where: bookingWhere,
      orderBy: { [sortBy]: sortOrder },
      skip,
      take: limit,
    })

    // Combine donations and bookings, format them consistently
    const combinedRecords = [
      ...donations.map(d => ({
        ...d,
        type: 'donation',
        amount: d.amount,
        userName: d.user?.name || 'Anonymous',
        userPhone: d.user?.phone || 'N/A',
        userEmail: d.user?.email || null
      })),
      ...poojaBookings.map(b => ({
        ...b,
        type: 'pooja',
        donationType: b.poojaName,
        donationPurpose: 'Pooja Service',
        amount: b.poojaPrice,
        receiptNumber: b.receiptNumber || b.bookingNumber
      }))
    ]

    // Sort combined records
    combinedRecords.sort((a, b) => {
      if (sortOrder === 'desc') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
    })

    // Apply pagination to combined records
    const paginatedRecords = combinedRecords.slice(skip, skip + limit)

    // Calculate totals
    const totalAmount = combinedRecords.reduce((sum, record) => sum + record.amount, 0)
    const successfulAmount = combinedRecords
      .filter(r => r.paymentStatus === 'SUCCESS')
      .reduce((sum, record) => sum + record.amount, 0)

    // Get status counts
    const statusCounts = combinedRecords.reduce((acc, record) => {
      acc[record.paymentStatus] = (acc[record.paymentStatus] || { count: 0, amount: 0 })
      acc[record.paymentStatus].count += 1
      acc[record.paymentStatus].amount += record.amount
      return acc
    }, {} as Record<string, { count: number; amount: number }>)

    // Get type distribution
    const typeDistribution = combinedRecords.reduce((acc, record) => {
      const existingType = acc.find(t => t.donationType === record.donationType)
      if (existingType) {
        existingType._count.id += 1
        existingType._sum.amount = (existingType._sum.amount || 0) + record.amount
      } else {
        acc.push({
          donationType: record.donationType,
          _count: { id: 1 },
          _sum: { amount: record.amount }
        })
      }
      return acc
    }, [] as any[])

    return NextResponse.json({
      donations: paginatedRecords,
      pagination: {
        page,
        limit,
        total: combinedRecords.length,
        totalPages: Math.ceil(combinedRecords.length / limit)
      },
      statusCounts,
      typeDistribution,
      totals: {
        totalAmount,
        successfulAmount,
        pendingAmount: totalAmount - successfulAmount
      }
    })
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { donationId, action } = body

    if (!donationId || !action) {
      return NextResponse.json(
        { error: 'Donation ID and action are required' },
        { status: 400 }
      )
    }

    let updateData: any = {}

    switch (action) {
      case 'confirm':
        updateData = {
          paymentStatus: 'SUCCESS'
        }
        break
      case 'fail':
        updateData = {
          paymentStatus: 'FAILED'
        }
        break
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    const donation = await prisma.donation.update({
      where: { id: donationId },
      data: updateData
    })

    return NextResponse.json(donation)
  } catch (error) {
    console.error('Error updating donation:', error)
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    )
  }
}