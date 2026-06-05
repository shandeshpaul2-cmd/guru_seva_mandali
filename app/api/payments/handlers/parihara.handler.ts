import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productionWhatsAppService } from '@/lib/whatsapp-production'
import { EmailService } from '@/lib/email-service'
import { generateBookingNumber } from '../services/receipt.service'
import type { HandlerContext } from '../types'

/**
 * Handle parihara pooja payments
 */
export async function handleParihara(ctx: HandlerContext): Promise<NextResponse> {
  const { body, receiptNumber, finalPaymentId, timestamp } = ctx
  const { userInfo, items, amount, serviceDetails } = body

  try {
    const pariharaBooking = await prisma.poojaBooking.create({
      data: {
        bookingNumber: generateBookingNumber(),
        receiptNumber: receiptNumber,
        poojaName: serviceDetails?.poojaName || items?.[0]?.name || 'Parihara Pooja',
        poojaPrice: amount,
        poojaId: null, // No predefined pooja service for parihara
        preferredDate: serviceDetails?.preferredDate ? new Date(serviceDetails.preferredDate) : new Date(),
        preferredTime: serviceDetails?.preferredTime || 'To be scheduled based on horoscope',
        userName: userInfo.fullName,
        userPhone: userInfo.phoneNumber,
        userEmail: null,
        nakshatra: serviceDetails?.nakshatra || null,
        gothra: serviceDetails?.gotra || null,
        specialInstructions: 'Parihara pooja - requires horoscope analysis',
        bookingStatus: 'PENDING',
        paymentStatus: 'SUCCESS',
        razorpayPaymentId: finalPaymentId,
      }
    })

    const responseData = {
      type: 'parihara_pooja',
      bookingId: pariharaBooking.id,
      bookingNumber: pariharaBooking.bookingNumber,
      receiptNumber: pariharaBooking.receiptNumber,
      poojaName: pariharaBooking.poojaName,
      amount: pariharaBooking.poojaPrice,
      userName: pariharaBooking.userName,
      userPhone: pariharaBooking.userPhone,
      createdAt: pariharaBooking.createdAt
    }

    // Send notifications
    await sendPariharaNotifications(pariharaBooking, userInfo, timestamp)

    return NextResponse.json({
      success: true,
      receiptNumber,
      paymentType: 'parihara_pooja',
      data: responseData
    })
  } catch (error) {
    console.error('Error processing parihara pooja booking:', error)
    throw error
  }
}

/**
 * Send WhatsApp and email notifications for parihara pooja
 */
async function sendPariharaNotifications(
  booking: {
    userName: string
    userPhone: string
    receiptNumber: string | null
    poojaName: string
    poojaPrice: number
    createdAt: Date
    preferredDate: Date | null
    razorpayPaymentId: string | null
  },
  userInfo: {
    fullName: string
    phoneNumber: string
    emailAddress?: string
  },
  timestamp: number
): Promise<void> {
  // Send WhatsApp notification
  try {
    const formattedPhone = booking.userPhone.startsWith('+')
      ? booking.userPhone
      : `+91${booking.userPhone}`

    const whatsappResult = await productionWhatsAppService.sendPariharaPoojaConfirmationTemplate(
      booking.userName,
      formattedPhone,
      booking.receiptNumber || `TEMP-${timestamp}`,
      booking.poojaName,
      booking.poojaPrice,
      booking.createdAt,
      booking.razorpayPaymentId || `pay_${timestamp}`
    )

    if (!whatsappResult.success) {
      console.error('Parihara pooja template failed:', whatsappResult.error)
    }
  } catch (error) {
    console.error('Failed to send parihara pooja WhatsApp notifications:', error)
  }

  // Send email notifications
  try {
    const devoteeEmail = userInfo.emailAddress
    if (devoteeEmail) {
      const emailResult = await EmailService.sendPoojaBookingConfirmation(
        devoteeEmail,
        booking.userName,
        booking.poojaName,
        booking.receiptNumber || `TEMP-${timestamp}`,
        booking.preferredDate?.toISOString() || new Date().toISOString(),
        booking.poojaPrice
      )

      if (!emailResult.success) {
        console.error('Failed to send parihara pooja confirmation email:', emailResult.error)
      }
    }

    // Send notification email to admin
    const adminEmailResult = await EmailService.sendPoojaBookingNotificationToAdmin(
      booking.userName,
      booking.poojaName,
      booking.receiptNumber || `TEMP-${timestamp}`,
      booking.preferredDate?.toISOString() || new Date().toISOString(),
      'No email required',
      booking.userPhone
    )

    if (!adminEmailResult.success) {
      console.error('Failed to send parihara pooja notification email to admin:', adminEmailResult.error)
    }
  } catch (emailError) {
    console.error('Email notifications failed for parihara pooja:', emailError)
  }
}
