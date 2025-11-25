import { NextResponse } from 'next/server'
import { productionWhatsAppService } from '@/lib/whatsapp-production'
import { EmailService } from '@/lib/email-service'
import { getDateString } from '../services/receipt.service'
import type { HandlerContext } from '../types'

/**
 * Handle astrology consultation payments
 */
export async function handleAstrology(ctx: HandlerContext): Promise<NextResponse> {
  const { body, timestamp } = ctx
  const { userInfo, items, amount, serviceDetails } = body

  try {
    const dateStr = getDateString()
    const consultationNumber = `AC-${dateStr}-${Date.now().toString().slice(-4)}`

    // For now, create a simple record (no dedicated database table yet)
    const responseData = {
      type: 'astrology_consultation',
      consultationId: `consultation_${timestamp}`,
      receiptNumber: consultationNumber,
      consultationType: items?.[0]?.name || 'General Astrology Consultation',
      amount: amount,
      clientName: userInfo.fullName,
      clientPhone: userInfo.phoneNumber,
      createdAt: new Date().toISOString()
    }

    // Send notifications
    await sendAstrologyNotifications(
      consultationNumber,
      items?.[0]?.name || 'General Astrology Consultation',
      amount,
      userInfo,
      serviceDetails
    )

    return NextResponse.json({
      success: true,
      receiptNumber: consultationNumber,
      paymentType: 'astrology_consultation',
      data: responseData
    })
  } catch (error) {
    console.error('Error processing astrology consultation:', error)
    throw error
  }
}

/**
 * Send WhatsApp and email notifications for astrology consultation
 */
async function sendAstrologyNotifications(
  consultationNumber: string,
  consultationType: string,
  amount: number,
  userInfo: {
    fullName: string
    phoneNumber: string
    emailAddress?: string
  },
  serviceDetails?: {
    birthDetails?: {
      dateOfBirth: string
      timeOfBirth: string
      placeOfBirth: string
      starSign?: string
    }
    preferredDate?: string
    preferredTime?: string
  }
): Promise<void> {
  // Send WhatsApp notification
  try {
    console.log('📱 Sending astrology consultation confirmation with template')
    const formattedPhone = userInfo.phoneNumber.startsWith('+')
      ? userInfo.phoneNumber
      : `+91${userInfo.phoneNumber}`

    const whatsappResult = await productionWhatsAppService.sendAstrologyConsultationConfirmationTemplate(
      userInfo.fullName,
      formattedPhone,
      consultationNumber,
      consultationType,
      serviceDetails?.birthDetails?.dateOfBirth || 'Not provided',
      serviceDetails?.birthDetails?.timeOfBirth || 'Not provided',
      serviceDetails?.birthDetails?.placeOfBirth || 'Not provided',
      serviceDetails?.birthDetails?.starSign,
      serviceDetails?.preferredDate,
      serviceDetails?.preferredTime
    )

    if (whatsappResult.success) {
      console.log('✅ Astrology consultation WhatsApp notifications sent with templates')
    } else {
      console.error('❌ Astrology consultation template failed:', whatsappResult.error)
    }
  } catch (error) {
    console.error('❌ Failed to send astrology consultation WhatsApp notifications:', error)
  }

  // Send email notifications
  try {
    const clientEmail = userInfo.emailAddress
    if (clientEmail) {
      const emailResult = await EmailService.sendAstrologyConsultationConfirmation(
        clientEmail,
        userInfo.fullName,
        consultationType,
        consultationNumber,
        serviceDetails?.preferredDate || new Date().toISOString(),
        amount
      )

      if (emailResult.success) {
        console.log('Astrology consultation confirmation email sent successfully to:', clientEmail)
      } else {
        console.error('Failed to send astrology consultation confirmation email:', emailResult.error)
      }
    }

    // Send notification email to admin with complete client details
    const adminEmailResult = await EmailService.sendAstrologyConsultationNotificationToAdmin(
      userInfo.fullName,
      consultationType,
      consultationNumber,
      serviceDetails?.preferredDate || new Date().toISOString(),
      'No email required',
      userInfo.phoneNumber,
      serviceDetails?.birthDetails
    )

    if (adminEmailResult.success) {
      console.log('Astrology consultation notification email sent to admin successfully')
    } else {
      console.error('Failed to send astrology consultation notification email to admin:', adminEmailResult.error)
    }
  } catch (emailError) {
    console.error('Email notifications failed for astrology consultation:', emailError)
  }
}
