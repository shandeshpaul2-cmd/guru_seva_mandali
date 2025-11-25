import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/prisma'

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

    console.log('Fetching booking details for receipt:', receiptNumber)

    // Look for booking by receipt number
    const booking = await prisma.poojaBooking.findFirst({
      where: {
        receiptNumber: receiptNumber
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
            nakshatra: true,
            gothra: true
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

    if (!booking) {
      console.log('Booking not found for receipt:', receiptNumber)
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    console.log('Found booking:', {
      id: booking.id,
      receiptNumber: booking.receiptNumber,
      poojaName: booking.poojaName
    })

    // Format the response to match what the confirmation page expects
    const bookingDetails = {
      id: booking.id,
      receiptNumber: booking.receiptNumber,
      poojaName: booking.poojaName,
      poojaPrice: booking.poojaPrice,
      preferredDate: booking.preferredDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
      preferredTime: booking.preferredTime,
      userName: booking.userName || booking.user?.name || 'N/A',
      userPhone: booking.userPhone || booking.user?.phone || 'N/A',
      nakshatra: booking.nakshatra || booking.user?.nakshatra || 'Not specified',
      gothra: booking.gothra || booking.user?.gothra || 'Not specified',
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      paymentId: booking.razorpayPaymentId || booking.razorpayOrderId || `BOOKING-${booking.bookingNumber}`,
      createdAt: booking.createdAt
    }

    return NextResponse.json(bookingDetails)
  } catch (error) {
    console.error('Error fetching booking details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking details' },
      { status: 500 }
    )
  }
}