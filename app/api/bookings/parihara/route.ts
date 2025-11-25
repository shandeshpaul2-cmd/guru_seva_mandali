import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productionWhatsAppService } from '@/lib/whatsapp-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookingNumber,
      poojaName,
      serviceId,
      devoteeName,
      devoteePhone,
      nakshatra,
      gotra,
      gothra
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

    // Create parihara booking record using PoojaBooking table
    const booking = await prisma.poojaBooking.create({
      data: {
        bookingNumber: bookingNumber,
        userId: user.id,
        userName: devoteeName,
        userPhone: devoteePhone,
        poojaId: null, // No specific pooja service ID for parihara
        poojaName: poojaName,
        poojaPrice: 0, // No payment at booking time
        bookingStatus: 'PENDING',
        paymentStatus: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    console.log('Parihara booking created successfully:', bookingNumber)

    // Send WhatsApp notification using templates
    try {
      console.log('📱 Sending parihara booking confirmation WhatsApp with template')

      // Format phone number with country code
      const formattedPhone = devoteePhone.startsWith('+') ? devoteePhone : `+91${devoteePhone}`;

      // Send parihara booking confirmation using template
      const whatsappResult = await productionWhatsAppService.sendPariharaPoojaConfirmationTemplate(
        devoteeName,
        formattedPhone,
        bookingNumber,
        poojaName,
        0, // amount - no payment for direct bookings
        new Date(),
        'payment_id_here' // paymentId placeholder
      );

      if (whatsappResult.success) {
        console.log('✅ Parihara booking WhatsApp sent successfully:', whatsappResult.devoteeMessageId)
      } else {
        console.error('❌ Failed to send parihara booking WhatsApp:', whatsappResult.error);
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
    console.error('Parihara booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
