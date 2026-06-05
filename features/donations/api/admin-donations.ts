import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import {
  donationsListQuerySchema,
  donationActionSchema,
} from '@/types/schemas/admin'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = donationsListQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    )

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const {
      page,
      limit,
      status,
      search,
      sortBy,
      sortOrder,
      startDate,
      endDate,
    } = parsed.data

    const skip = (page - 1) * limit

    // Build where clause for donations
    const where: Prisma.DonationWhereInput = {}

    if (status && status !== 'all') {
      where.paymentStatus = status
    }

    if (search) {
      where.OR = [
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
              { email: { contains: search } },
            ],
          },
        },
      ]
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // Run paginated query, true count, and aggregates in parallel.
    const [donations, total, statusGroups, typeGroups, totalsAgg, successAgg] =
      await Promise.all([
        prisma.donation.findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          skip,
          take: limit,
          include: {
            user: {
              select: { id: true, name: true, phone: true, email: true },
            },
          },
        }),
        prisma.donation.count({ where }),
        prisma.donation.groupBy({
          by: ['paymentStatus'],
          where,
          _count: { id: true },
          _sum: { amount: true },
        }),
        prisma.donation.groupBy({
          by: ['donationType'],
          where,
          _count: { id: true },
          _sum: { amount: true },
          orderBy: { _count: { id: 'desc' } },
        }),
        prisma.donation.aggregate({ where, _sum: { amount: true } }),
        prisma.donation.aggregate({
          where: { ...where, paymentStatus: 'SUCCESS' },
          _sum: { amount: true },
        }),
      ])

    // Project rows into the shape the admin UI expects.
    const projected = donations.map((d) => ({
      ...d,
      type: 'donation' as const,
      userName: d.user?.name || 'Anonymous',
      userPhone: d.user?.phone || 'N/A',
      userEmail: d.user?.email || null,
    }))

    const statusCounts = statusGroups.reduce(
      (acc, item) => {
        acc[item.paymentStatus] = {
          count: item._count.id,
          amount: item._sum.amount || 0,
        }
        return acc
      },
      {} as Record<string, { count: number; amount: number }>
    )

    const typeDistribution = typeGroups.map((t) => ({
      donationType: t.donationType,
      _count: { id: t._count.id },
      _sum: { amount: t._sum.amount || 0 },
    }))

    const totalAmount = totalsAgg._sum.amount || 0
    const successfulAmount = successAgg._sum.amount || 0

    return NextResponse.json({
      donations: projected,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      statusCounts,
      typeDistribution,
      totals: {
        totalAmount,
        successfulAmount,
        pendingAmount: totalAmount - successfulAmount,
      },
    })
  } catch (error) {
    console.error('[admin/donations] GET failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null)
    const parsed = donationActionSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const { donationId, action } = parsed.data

    let updateData: Prisma.DonationUpdateInput = {}

    switch (action) {
      case 'confirm':
        updateData = { paymentStatus: 'SUCCESS' }
        break
      case 'fail':
        updateData = { paymentStatus: 'FAILED' }
        break
    }

    const donation = await prisma.donation.update({
      where: { id: donationId },
      data: updateData,
    })

    return NextResponse.json(donation)
  } catch (error) {
    console.error('[admin/donations] PATCH failed:', error)
    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    )
  }
}
