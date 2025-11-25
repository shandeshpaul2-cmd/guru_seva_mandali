import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productionWhatsAppService } from '@/lib/whatsapp-production'
import { EmailService } from '@/lib/email-service'
import { generateBookingNumber } from '../services/receipt.service'
import type { HandlerContext } from '../types'

// Pooja service name to ID mapping
const POOJA_SERVICE_MAP: Record<string, number> = {
  "Nithya Pooja": 1,
  "Padha Pooja": 2,
  "Panchmrutha Abhisheka": 3,
  "Madhu Abhisheka": 4,
  "Sarva Seva": 5,
  "Vishesha Alankara Seva": 6,
  "Belli Kavachadharane": 7,
  "Sahasranama Archane": 8,
  "Vayusthuthi Punashcharne": 9,
  "Kanakabhisheka": 10,
  "Vastra Arpane Seva": 11
}

/**
 * Handle pooja booking payments
 */
export async function handlePooja(ctx: HandlerContext): Promise<NextResponse> {
  const { body, receiptNumber, finalPaymentId } = ctx
  const { userInfo, items, amount, serviceDetails } = body

  try {
    const serviceName = items?.[0]?.name || 'Nithya Pooja'
    let poojaId = 1

    // Check if the pooja service exists, if not create it
    if (POOJA_SERVICE_MAP[serviceName]) {
      poojaId = POOJA_SERVICE_MAP[serviceName]

      const existingPoojaService = await prisma.poojaService.findUnique({
        where: { id: poojaId }
      })

      if (!existingPoojaService) {
        await prisma.poojaService.create({
          data: {
            id: poojaId,
            poojaName: serviceName,
            price: amount,
            durationMinutes: 60,
            isActive: true,
            displayOrder: poojaId,
          }
        })
        console.log(`Created pooja service: ${serviceName} with ID: ${poojaId}`)
      }
    }

    const poojaBooking = await prisma.poojaBooking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        receiptNumber: receiptNumber,
        poojaName: serviceName,
        poojaPrice: amount,
        poojaId: poojaId,
        preferredDate: serviceDetails?.preferredDate ? new Date(serviceDetails.preferredDate) : new Date(),
        preferredTime: serviceDetails?.preferredTime || 'To be scheduled',
        userName: userInfo.fullName,
        userPhone: userInfo.phoneNumber,
        userEmail: null,
        nakshatra: serviceDetails?.nakshatra || null,
        gothra: serviceDetails?.gotra || null,
        specialInstructions: null,
        bookingStatus: 'PENDING',
        paymentStatus: 'SUCCESS',
        razorpayPaymentId: finalPaymentId,
      }
    })

    const responseData = {
      type: 'pooja',
      bookingId: poojaBooking.id,
      receiptNumber: poojaBooking.receiptNumber,
      poojaName: poojaBooking.poojaName,
      amount: poojaBooking.poojaPrice,
      userName: poojaBooking.userName,
      userPhone: poojaBooking.userPhone,
      createdAt: poojaBooking.createdAt
    }

    // Send notifications
    await sendPoojaNotifications(poojaBooking, userInfo)

    return NextResponse.json({
      success: true,
      receiptNumber,
      paymentType: 'pooja',
      data: responseData
    })
  } catch (error) {
    console.error('Error processing pooja booking:', error)
    throw error
  }
}

/**
 * Send WhatsApp and email notifications for pooja booking
 */
async function sendPoojaNotifications(
  booking: {
    userName: string
    userPhone: string
    receiptNumber: string | null
    bookingNumber: string
    poojaName: string
    poojaPrice: number
    createdAt: Date
    preferredDate: Date | null
    preferredTime: string | null
    nakshatra: string | null
  },
  userInfo: {
    fullName: string
    phoneNumber: string
    emailAddress?: string
  }
): Promise<void> {
  // Send WhatsApp notification
  try {
    console.log('📱 Sending pooja booking confirmation with template')
    const formattedPhone = booking.userPhone.startsWith('+')
      ? booking.userPhone
      : `+91${booking.userPhone}`

    const whatsappResult = await productionWhatsAppService.sendPoojaBookingConfirmationTemplate(
      booking.userName,
      formattedPhone,
      booking.receiptNumber || booking.bookingNumber,
      booking.poojaName,
      booking.poojaPrice,
      booking.createdAt,
      booking.preferredDate?.toLocaleDateString('en-IN'),
      booking.preferredTime || undefined,
      booking.nakshatra || undefined
    )

    if (whatsappResult.success) {
      console.log('✅ Pooja booking WhatsApp notifications sent with templates')
    } else {
      console.error('❌ Pooja booking template failed:', whatsappResult.error)
    }
  } catch (error) {
    console.error('Failed to send pooja booking WhatsApp notifications:', error)
  }

  // Send email notifications
  try {
    const devoteeEmail = userInfo.emailAddress
    if (devoteeEmail) {
      const emailResult = await EmailService.sendPoojaBookingConfirmation(
        devoteeEmail,
        booking.userName,
        booking.poojaName,
        booking.receiptNumber || booking.bookingNumber,
        booking.preferredDate?.toISOString() || new Date().toISOString(),
        booking.poojaPrice
      )

      if (emailResult.success) {
        console.log('Pooja booking confirmation email sent successfully to:', devoteeEmail)
      } else {
        console.error('Failed to send pooja booking confirmation email:', emailResult.error)
      }
    }

    // Send notification email to admin
    const adminEmailResult = await EmailService.sendPoojaBookingNotificationToAdmin(
      booking.userName,
      booking.poojaName,
      booking.receiptNumber || booking.bookingNumber,
      booking.preferredDate?.toISOString() || new Date().toISOString(),
      'No email required',
      booking.userPhone
    )

    if (adminEmailResult.success) {
      console.log('Pooja booking notification email sent to admin successfully')
    } else {
      console.error('Failed to send pooja booking notification email to admin:', adminEmailResult.error)
    }
  } catch (emailError) {
    console.error('Email notifications failed for pooja booking:', emailError)
  }
}
