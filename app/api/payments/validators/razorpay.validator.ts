import { RazorpayService } from '@/lib/razorpay-service'

const razorpayService = new RazorpayService()

export interface RazorpayVerificationFields {
  razorpayPaymentId?: string
  razorpayOrderId?: string
  razorpaySignature?: string
}

export interface VerificationResult {
  isValid: boolean
  error?: string
}

/**
 * Verify Razorpay payment signature
 */
export function verifyRazorpaySignature(fields: RazorpayVerificationFields): VerificationResult {
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = fields

  // If no verification fields provided, skip verification
  if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
    console.warn('⚠️ No Razorpay verification fields provided - proceeding without verification')
    return { isValid: true }
  }

  console.log('Verifying Razorpay signature...')

  const isValid = razorpayService.verifyPaymentSignature({
    razorpay_order_id: razorpayOrderId,
    razorpay_payment_id: razorpayPaymentId,
    razorpay_signature: razorpaySignature
  })

  if (!isValid) {
    console.error('Invalid Razorpay signature:', { razorpayOrderId, razorpayPaymentId })
    return {
      isValid: false,
      error: 'Invalid payment signature. Payment verification failed.'
    }
  }

  console.log('✅ Razorpay signature verified successfully')
  return { isValid: true }
}

/**
 * Get the final payment ID (Razorpay or generated)
 */
export function getFinalPaymentId(
  razorpayPaymentId?: string,
  providedPaymentId?: string
): string {
  return razorpayPaymentId || providedPaymentId || `pay_${Date.now()}`
}
