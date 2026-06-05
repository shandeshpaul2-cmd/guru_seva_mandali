/**
 * Razorpay Service for handling payment orders and verification
 */

import Razorpay from 'razorpay'
import crypto from 'crypto'

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
    if (!process.env.RAZORPAY_KEY_ID) {
      throw new Error('RAZORPAY_KEY_ID is required')
    }
    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error('RAZORPAY_KEY_SECRET is required')
    }

    // IMPORTANT: Trim the keys to remove any whitespace/newlines
    const keyId = process.env.RAZORPAY_KEY_ID.trim()
    const keySecret = process.env.RAZORPAY_KEY_SECRET.trim()

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
      if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new Error('RAZORPAY_KEY_SECRET is required')
      }
      const keySecret = process.env.RAZORPAY_KEY_SECRET.trim()
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