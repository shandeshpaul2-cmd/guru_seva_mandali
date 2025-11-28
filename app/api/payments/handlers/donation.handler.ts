import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { productionWhatsAppService } from '@/lib/whatsapp-production'
import { EmailService } from '@/lib/email-service'
import type { HandlerContext, HandlerResponse } from '../types'

/**
 * Handle donation payments
 */
export async function handleDonation(ctx: HandlerContext): Promise<NextResponse> {
  const { body, receiptNumber, finalPaymentId, userId, timestamp } = ctx
  const { userInfo, items, amount } = body

  console.log('🎯 DONATION CASE TRIGGERED - Starting donation processing')
  console.log('User Info:', userInfo)
  console.log('Amount:', amount)
  console.log('Items:', items)

  try {
    // Create donation record
    const donation = await prisma.donation.create({
      data: {
        receiptNumber: receiptNumber,
        userId: userId,
        amount: amount,
        donationType: items?.[0]?.name || 'General Donation',
        donationPurpose: items?.[0]?.description || 'General Purpose',
        paymentStatus: 'SUCCESS',
        paymentMethod: 'razorpay',
        razorpayOrderId: `order_${timestamp}`,
        razorpayPaymentId: finalPaymentId,
        razorpaySignature: 'development_signature',
        ipAddress: '127.0.0.1',
        userAgent: 'Development'
      }
    })

    const responseData = {
      type: 'donation',
      donationId: donation.id,
      receiptNumber: donation.receiptNumber,
      amount: donation.amount,
      donationType: donation.donationType,
      donationPurpose: donation.donationPurpose,
      userName: userInfo.fullName,
      userPhone: userInfo.phoneNumber,
      createdAt: donation.createdAt
    }

    // Send notifications asynchronously
    await sendDonationNotifications(donation, userInfo, finalPaymentId, timestamp)

    return NextResponse.json({
      success: true,
      receiptNumber,
      paymentType: 'donation',
      data: responseData
    })
  } catch (error) {
    console.error('Error processing donation:', error)
    throw error
  }
}

/**
 * Send WhatsApp and email notifications for donation
 */
async function sendDonationNotifications(
  donation: {
    receiptNumber: string
    amount: number
    donationType: string
    donationPurpose: string | null
    createdAt: Date
  },
  userInfo: {
    fullName: string
    phoneNumber: string
    emailAddress?: string
  },
  finalPaymentId: string,
  timestamp: number
): Promise<void> {
  console.log('🚀 STARTING WHATSAPP NOTIFICATION PROCESS')

  try {
    // Generate PDF certificate DIRECTLY (avoid HTTP call which fails on localhost)
    let certificateUrl: string | undefined
    let pdfBase64: string | undefined

    try {
      console.log('📄 Starting certificate generation for donation:', donation.receiptNumber)

      // Import generator and cache directly - no HTTP call needed
      const { nodeCertificateGenerator } = await import('@/lib/certificate-generator-node')
      const { storePDFTemporarily } = await import('@/lib/pdf-cache')

      const certificateData = {
        donor_name: userInfo.fullName,
        amount: donation.amount,
        donation_id: donation.receiptNumber,
        donation_date: donation.createdAt.toISOString().split('T')[0],
        phone_number: userInfo.phoneNumber || '',
        reason_text: 'for their valued contribution'
      }

      // Generate PDF directly using Puppeteer (no HTTP call)
      console.log('📄 Generating PDF with Puppeteer...')
      const pdfBuffer = await nodeCertificateGenerator.generate(certificateData)
      pdfBase64 = pdfBuffer.toString('base64')
      console.log('✅ PDF generated, size:', Math.round(pdfBuffer.length / 1024), 'KB')

      // Store in cache for download link
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
      const filename = `certificate_${donation.receiptNumber}.pdf`
      const pdfId = storePDFTemporarily(pdfBase64, filename)
      certificateUrl = `${baseUrl}/api/certificates/serve/${pdfId}`

      console.log('✅ Certificate generated and cached:', certificateUrl)
    } catch (certificateError) {
      console.error('❌ Error generating certificate:', certificateError)
      // Continue without certificate - WhatsApp will use fallback message
    }

    // Send WhatsApp notification
    console.log('📱 Sending donation receipt with template to:', userInfo.phoneNumber)
    const formattedPhone = userInfo.phoneNumber.startsWith('+')
      ? userInfo.phoneNumber
      : `+91${userInfo.phoneNumber}`

    const whatsappResult = await productionWhatsAppService.sendDonationReceiptTemplate(
      userInfo.fullName,
      formattedPhone,
      donation.receiptNumber,
      donation.amount,
      donation.donationType,
      donation.createdAt,
      finalPaymentId,
      certificateUrl,
      pdfBase64
    )

    console.log('📱 WhatsApp result:', {
      success: whatsappResult.success,
      error: whatsappResult.error,
      receiptMessageId: whatsappResult.receiptMessageId,
      adminMessageId: whatsappResult.adminMessageId
    })

    if (whatsappResult.success) {
      console.log('✅ Donation WhatsApp notifications sent successfully with certificate')
    } else {
      console.error('❌ WhatsApp notifications failed:', whatsappResult.error)
    }

    // Send email notifications
    await sendDonationEmails(donation, userInfo, certificateUrl)

  } catch (error) {
    console.error('❌ CRITICAL ERROR in donation notifications:', error)
  }
}

/**
 * Send email notifications for donation
 */
async function sendDonationEmails(
  donation: {
    receiptNumber: string
    amount: number
    donationType: string
  },
  userInfo: {
    fullName: string
    phoneNumber: string
    emailAddress?: string
  },
  certificateUrl?: string
): Promise<void> {
  try {
    const donorEmail = userInfo.emailAddress
    if (donorEmail) {
      const emailResult = await EmailService.sendDonationReceipt(
        donorEmail,
        userInfo.fullName,
        donation.amount,
        donation.receiptNumber,
        donation.donationType,
        '',
        certificateUrl
      )

      if (emailResult.success) {
        console.log('Donation receipt email sent successfully to:', donorEmail)
      } else {
        console.error('Failed to send donation receipt email:', emailResult.error)
      }
    }

    // Send notification email to admin
    const adminEmailResult = await EmailService.sendDonationNotificationToAdmin(
      userInfo.fullName,
      donation.amount,
      donation.receiptNumber,
      donation.donationType,
      'No email required',
      userInfo.phoneNumber,
      ''
    )

    if (adminEmailResult.success) {
      console.log('Donation notification email sent to admin successfully')
    } else {
      console.error('Failed to send donation notification email to admin:', adminEmailResult.error)
    }
  } catch (emailError) {
    console.error('Email notifications failed:', emailError)
  }
}
