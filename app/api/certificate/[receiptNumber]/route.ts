import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { nodeCertificateGenerator } from '@/lib/certificate-generator-node'

/**
 * On-demand certificate generation endpoint
 * Generates PDF certificate when user clicks the link in WhatsApp
 * URL format: /api/certificate/DN-281125-0001
 */
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

    // Validate receipt number format (basic check)
    if (!receiptNumber.startsWith('DN-')) {
      return NextResponse.json(
        { error: 'Invalid receipt number format' },
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
    console.log('📄 Generating certificate PDF on-demand...')

    // Generate PDF on-demand
    const certificateData = {
      donor_name: donation.user?.name || 'Anonymous',
      amount: donation.amount,
      donation_id: donation.receiptNumber,
      donation_date: donation.createdAt.toISOString().split('T')[0],
      phone_number: donation.user?.phone || '',
      reason_text: 'for their valued contribution'
    }

    const pdfBuffer = await nodeCertificateGenerator.generate(certificateData)

    console.log('✅ Certificate generated, size:', Math.round(pdfBuffer.length / 1024), 'KB')

    // Return PDF as downloadable file
    const filename = `Donation_Certificate_${receiptNumber}.pdf`

    // Convert Buffer to Uint8Array for NextResponse compatibility
    const pdfUint8Array = new Uint8Array(pdfBuffer)

    return new NextResponse(pdfUint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        // Cache for 1 hour to reduce regeneration
        'Cache-Control': 'public, max-age=3600',
      }
    })

  } catch (error) {
    console.error('❌ Error generating certificate:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate certificate',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
