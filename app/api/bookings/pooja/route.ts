import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productionWhatsAppService } from '@/lib/whatsapp-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookingNumber,
      poojaName,
      devoteeName,
      devoteePhone,
      preferredDate,
      preferredTime,
      nakshatra,
      gotra
    } = body

    // Validate required fields
    if (!bookingNumber || !poojaName || !devoteeName || !devoteePhone) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      )
    }

    // Create or update user
    const user = await prisma.user.upsert({
      where: { phone: devoteePhone },
      update: {
        name: devoteeName,
        updatedAt: new Date()
      },
      create: {
        name: devoteeName,
        phone: devoteePhone,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create booking record
    const booking = await prisma.poojaBooking.create({
      data: {
        bookingNumber: bookingNumber,
        userId: user.id,
        userName: devoteeName,
        userPhone: devoteePhone,
        poojaId: null, // No specific pooja service ID
        poojaName: poojaName,
        poojaPrice: 0, // No payment
        preferredDate: preferredDate ? new Date(preferredDate) : null,
        preferredTime: preferredTime || null,
        nakshatra: nakshatra || null,
        gothra: gotra || null,
        bookingStatus: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('Pooja booking created successfully:', bookingNumber)

    // Send WhatsApp notifications using templates
    try {
      console.log('📱 Sending pooja booking confirmation WhatsApp with template')

      // Format phone number with country code
      const formattedPhone = devoteePhone.startsWith('+') ? devoteePhone : `+91${devoteePhone}`;

      // Send pooja booking confirmation using template
      const whatsappResult = await productionWhatsAppService.sendPoojaBookingConfirmationTemplate(
        devoteeName,
        formattedPhone,
        bookingNumber,
        poojaName,
        0, // amount - no payment for direct bookings
        new Date(),
        preferredDate,
        preferredTime,
        nakshatra
      );

      if (whatsappResult.success) {
        console.log('✅ Pooja booking WhatsApp sent successfully:', whatsappResult.devoteeMessageId)
      } else {
        console.error('❌ Failed to send pooja booking WhatsApp:', whatsappResult.error);
      }

    } catch (whatsappError) {
      console.error('❌ WhatsApp notification failed:', whatsappError)
      // Don't fail the booking if WhatsApp fails
    }

    return NextResponse.json({
      success: true,
      bookingNumber,
      message: 'Booking created successfully'
    })

  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
