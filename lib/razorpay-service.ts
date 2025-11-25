/**
 * Razorpay Service for handling payment orders and verification
 */

import Razorpay from 'razorpay'

export interface CreateOrderParams {
  amount: number // in paise
  currency?: string
  receipt?: string
  notes?: Record<string, string>
}

export interface VerifyPaymentParams {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

class RazorpayService {
  private razorpay: Razorpay

  constructor() {
    // Initialize Razorpay with your key ID and secret
    // In production, these should be environment variables
    // IMPORTANT: Trim the keys to remove any whitespace/newlines
    const keyId = (process.env.RAZORPAY_KEY_ID || 'rzp_test_XXXXXXXXXXXX').trim()
    const keySecret = (process.env.RAZORPAY_KEY_SECRET || 'your_key_secret').trim()

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.warn('⚠️ Razorpay credentials not configured. Using test credentials.')
    }

    this.razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret
    })
  }

  /**
   * Create a Razorpay order
   */
  async createOrder(params: CreateOrderParams) {
    try {
      const order = await this.razorpay.orders.create({
        amount: params.amount,
        currency: params.currency || 'INR',
        receipt: params.receipt,
        notes: params.notes,
        payment_capture: true
      })
      return order
    } catch (error) {
      console.error('Error creating Razorpay order:', error)
      throw error
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyPaymentSignature(params: VerifyPaymentParams): boolean {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = params

      // Create the expected signature
      // IMPORTANT: Trim the key secret to remove any whitespace/newlines
      const crypto = require('crypto')
      const keySecret = (process.env.RAZORPAY_KEY_SECRET || 'your_key_secret').trim()
      const expectedSignature = crypto
        .createHmac('sha256', keySecret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex')

      // Compare signatures
      return expectedSignature === razorpay_signature
    } catch (error) {
      console.error('Error verifying payment signature:', error)
      return false
    }
  }

  /**
   * Fetch payment details
   */
  async fetchPayment(paymentId: string) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId)
      return payment
    } catch (error) {
      console.error('Error fetching payment details:', error)
      throw error
    }
  }

  /**
   * Fetch order details
   */
  async fetchOrder(orderId: string) {
    try {
      const order = await this.razorpay.orders.fetch(orderId)
      return order
    } catch (error) {
      console.error('Error fetching order details:', error)
      throw error
    }
  }
}

export { RazorpayService }
export default RazorpayService