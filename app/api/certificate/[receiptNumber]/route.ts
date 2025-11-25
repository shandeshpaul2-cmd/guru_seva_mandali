import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ receiptNumber: string }> }
) {
  try {
    const { receiptNumber } = await params

    if (!receiptNumber) {
      return NextResponse.json(
        { error: 'Receipt number is required' },
        { status: 400 }
      )
    }

    console.log('🔍 Fetching donation for receipt:', receiptNumber)

    // Fetch donation from database
    const donation = await prisma.donation.findUnique({
      where: { receiptNumber },
      select: {
        id: true,
        receiptNumber: true,
        amount: true,
        donationType: true,
        donationPurpose: true,
        razorpayPaymentId: true,
        createdAt: true,
        user: {
          select: {
            name: true,
            phone: true,
          }
        }
      }
    })

    if (!donation) {
      console.error('❌ Donation not found for receipt:', receiptNumber)
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    console.log('✅ Donation found:', donation.receiptNumber)

    // Return donation details
    return NextResponse.json({
      receiptNumber: donation.receiptNumber,
      donorName: donation.user?.name || 'Anonymous',
      phoneNumber: donation.user?.phone || '',
      amount: donation.amount,
      donationType: donation.donationType,
      donationPurpose: donation.donationPurpose || '',
      paymentId: donation.razorpayPaymentId || '',
      createdAt: donation.createdAt.toISOString(),
    })

  } catch (error) {
    console.error('❌ Error fetching donation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
