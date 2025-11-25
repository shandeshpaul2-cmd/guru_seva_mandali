/**
 * Shared types for payment handlers
 */

export interface PaymentUserInfo {
  fullName: string
  phoneNumber: string
  emailAddress?: string
  gotra?: string
  nakshatra?: string
}

export interface ServiceItem {
  name: string
  description?: string
  price?: number
}

export interface BirthDetails {
  dateOfBirth: string
  timeOfBirth: string
  placeOfBirth: string
  starSign?: string
}

export interface ServiceDetails {
  preferredDate?: string
  preferredTime?: string
  nakshatra?: string
  gotra?: string
  poojaName?: string
  birthDetails?: BirthDetails
}

export interface PaymentRequestBody {
  paymentType: 'donation' | 'pooja' | 'parihara_pooja' | 'astrology_consultation'
  amount: number
  userInfo: PaymentUserInfo
  items?: ServiceItem[]
  serviceDetails?: ServiceDetails
  receiptNumber?: string
  paymentId?: string
  status?: string
  razorpayPaymentId?: string
  razorpayOrderId?: string
  razorpaySignature?: string
}

export interface HandlerContext {
  body: PaymentRequestBody
  receiptNumber: string
  finalPaymentId: string
  userId: string
  timestamp: number
  dateStr: string
}

export interface HandlerResponse {
  success: boolean
  data?: Record<string, unknown>
  error?: string
}
