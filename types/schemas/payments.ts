import { z } from 'zod'
import {
  phoneNumberSchema,
  emailSchema,
  amountSchema,
  nameSchema,
  gotraSchema,
  nakshatraSchema,
  dateStringSchema,
  timeStringSchema
} from './common'

// Payment types
export const paymentTypeSchema = z.enum([
  'donation',
  'pooja',
  'parihara_pooja',
  'astrology_consultation'
])

export type PaymentType = z.infer<typeof paymentTypeSchema>

// Donation types
export const donationTypeSchema = z.enum([
  'general',
  'anna_dana',
  'vastra_dana',
  'gau_dana',
  'vidya_dana',
  'other'
])

export type DonationType = z.infer<typeof donationTypeSchema>

// User info schema for payments
export const paymentUserInfoSchema = z.object({
  fullName: nameSchema,
  phoneNumber: phoneNumberSchema,
  emailAddress: emailSchema,
  gotra: gotraSchema,
  nakshatra: nakshatraSchema,
})

// Service item schema
export const serviceItemSchema = z.object({
  name: z.string().min(1, 'Service name is required'),
  description: z.string().optional(),
  price: z.number().optional(),
  quantity: z.number().optional().default(1),
})

// Birth details for astrology
export const birthDetailsSchema = z.object({
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  timeOfBirth: z.string().min(1, 'Time of birth is required'),
  placeOfBirth: z.string().min(1, 'Place of birth is required'),
  starSign: z.string().optional(),
})

// Service details schema
export const serviceDetailsSchema = z.object({
  preferredDate: dateStringSchema,
  preferredTime: timeStringSchema,
  nakshatra: nakshatraSchema,
  gotra: gotraSchema,
  poojaName: z.string().optional(),
  birthDetails: birthDetailsSchema.optional(),
  specialInstructions: z.string().max(500).optional(),
})

// Base payment request schema
export const paymentRequestSchema = z.object({
  paymentType: paymentTypeSchema,
  amount: amountSchema,
  userInfo: paymentUserInfoSchema,
  items: z.array(serviceItemSchema).optional(),
  serviceDetails: serviceDetailsSchema.optional(),

  // Razorpay verification fields
  razorpayPaymentId: z.string().optional(),
  razorpayOrderId: z.string().optional(),
  razorpaySignature: z.string().optional(),

  // Optional fields for internal use
  receiptNumber: z.string().optional(),
  paymentId: z.string().optional(),
  status: z.string().default('completed'),
})

export type PaymentRequest = z.infer<typeof paymentRequestSchema>

// Donation-specific request schema
export const donationRequestSchema = paymentRequestSchema.extend({
  paymentType: z.literal('donation'),
  donationType: donationTypeSchema.optional().default('general'),
  donationPurpose: z.string().max(200).optional(),
  isAnonymous: z.boolean().optional().default(false),
})

export type DonationRequest = z.infer<typeof donationRequestSchema>

// Pooja booking request schema
export const poojaBookingRequestSchema = paymentRequestSchema.extend({
  paymentType: z.literal('pooja'),
  serviceDetails: serviceDetailsSchema.required(),
})

export type PoojaBookingRequest = z.infer<typeof poojaBookingRequestSchema>

// Parihara pooja request schema
export const pariharaBookingRequestSchema = paymentRequestSchema.extend({
  paymentType: z.literal('parihara_pooja'),
  serviceDetails: serviceDetailsSchema.required(),
})

export type PariharaBookingRequest = z.infer<typeof pariharaBookingRequestSchema>

// Astrology consultation request schema
export const astrologyBookingRequestSchema = paymentRequestSchema.extend({
  paymentType: z.literal('astrology_consultation'),
  serviceDetails: serviceDetailsSchema.extend({
    birthDetails: birthDetailsSchema.required(),
  }).required(),
})

export type AstrologyBookingRequest = z.infer<typeof astrologyBookingRequestSchema>

// Payment response schema
export const paymentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  receiptNumber: z.string().optional(),
  donationId: z.string().optional(),
  bookingId: z.string().optional(),
  certificateUrl: z.string().optional(),
  error: z.string().optional(),
})

export type PaymentResponse = z.infer<typeof paymentResponseSchema>

// Razorpay order creation schema
export const createOrderRequestSchema = z.object({
  amount: amountSchema,
  currency: z.string().default('INR'),
  receipt: z.string().optional(),
  notes: z.record(z.string(), z.string()).optional(),
})

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>

// Razorpay order response
export const razorpayOrderResponseSchema = z.object({
  id: z.string(),
  entity: z.string(),
  amount: z.number(),
  amount_paid: z.number(),
  amount_due: z.number(),
  currency: z.string(),
  receipt: z.string().optional(),
  status: z.string(),
  created_at: z.number(),
})

export type RazorpayOrderResponse = z.infer<typeof razorpayOrderResponseSchema>
