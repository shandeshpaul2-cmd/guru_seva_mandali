import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productionWhatsAppService } from '@/lib/whatsapp-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      bookingNumber,
      fullName,
      phoneNumber,
      dateOfBirth,
      timeOfBirth,
      placeOfBirth,
      starSign
    } = body

    // Validate required fields
    if (!bookingNumber || !fullName || !phoneNumber || !dateOfBirth || !timeOfBirth || !placeOfBirth) {
      return NextResponse.json(
        { error: 'Missing required booking information' },
        { status: 400 }
      )
    }

    // Create or update user
    const user = await prisma.user.upsert({
      where: { phone: phoneNumber },
      update: {
        name: fullName,
        updatedAt: new Date()
      },
      create: {
        name: fullName,
        phone: phoneNumber,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    })

    // Create booking record
    const booking = await prisma.poojaBooking.create({
      data: {
        bookingNumber: bookingNumber,
        userId: user.id,
        userName: fullName,
        userPhone: phoneNumber,
        poojaName: 'Vedic Astrology Consultation',
        poojaPrice: 0, // No payment
        specialInstructions: `Birth Details:
Date of Birth: ${dateOfBirth}
Time of Birth: ${timeOfBirth}
Place of Birth: ${placeOfBirth}
${starSign ? `Star Sign: ${starSign}` : ''}`,
        bookingStatus: 'PENDING',
        paymentStatus: 'NOT_REQUIRED',
        createdAt: new Date()
      }
    })

    console.log('Astrology consultation booking created successfully:', bookingNumber)

    // Send WhatsApp notifications using templates
    try {
      console.log('📱 Sending astrology consultation confirmation WhatsApp with template')

      // Format phone number with country code
      const formattedPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;

      // Send astrology consultation confirmation using template
      const whatsappResult = await productionWhatsAppService.sendAstrologyConsultationConfirmationTemplate(
        fullName,
        formattedPhone,
        bookingNumber,
        'Vedic Astrology Consultation',
        dateOfBirth,
        timeOfBirth,
        placeOfBirth,
        starSign,
        undefined, // preferredDate
        undefined  // preferredTime
      );

      if (whatsappResult.success) {
        console.log('✅ Astrology consultation WhatsApp sent successfully:', whatsappResult.clientMessageId)
      } else {
        console.error('❌ Failed to send astrology consultation WhatsApp:', whatsappResult.error);
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
    console.error('Astrology consultation booking error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}
