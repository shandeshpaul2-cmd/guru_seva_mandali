import { NextRequest, NextResponse } from 'next/server'
import { handleDonation, handlePooja, handleParihara, handleAstrology } from './handlers'
import { getOrCreateUser, generateReceiptNumber, getDateString } from './services'
import { verifyRazorpaySignature, getFinalPaymentId } from './validators/razorpay.validator'
import type { PaymentRequestBody, HandlerContext } from './types'

/**
 * POST /api/payments
 * Main payment processing endpoint
 *
 * Handles all payment types:
 * - donation
 * - pooja
 * - parihara_pooja
 * - astrology_consultation
 */
export async function POST(request: NextRequest) {
  try {
    const body: PaymentRequestBody = await request.json()
    const {
      paymentType,
      amount,
      userInfo,
      receiptNumber: providedReceiptNumber,
      paymentId: providedPaymentId,
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature
    } = body

    // Verify Razorpay signature if provided
    const verificationResult = verifyRazorpaySignature({
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature
    })

    if (!verificationResult.isValid) {
      return NextResponse.json(
        { error: verificationResult.error },
        { status: 400 }
      )
    }

    // Create or find the user
    const user = await getOrCreateUser(userInfo)

    // Generate receipt number
    const receiptNumber = await generateReceiptNumber(
      paymentType,
      providedReceiptNumber
    )

    // Get final payment ID
    const finalPaymentId = getFinalPaymentId(razorpayPaymentId, providedPaymentId)

    // Build handler context
    const timestamp = Date.now()
    const ctx: HandlerContext = {
      body,
      receiptNumber,
      finalPaymentId,
      userId: user.id,
      timestamp,
      dateStr: getDateString()
    }

    // Route to appropriate handler
    switch (paymentType) {
      case 'donation':
        return handleDonation(ctx)

      case 'pooja':
        return handlePooja(ctx)

      case 'parihara_pooja':
        return handleParihara(ctx)

      case 'astrology_consultation':
        return handleAstrology(ctx)

      default:
        // Default to donation for backwards compatibility
        console.warn(`Unknown payment type: ${paymentType}, defaulting to donation`)
        return handleDonation(ctx)
    }

  } catch (error) {
    console.error('Error processing payment:', error)

    let errorMessage = 'Failed to process payment'
    if (error instanceof Error) {
      errorMessage = `Payment processing failed: ${error.message}`
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}
