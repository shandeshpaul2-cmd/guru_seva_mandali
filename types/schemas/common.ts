import { z } from 'zod'

// Phone number validation for Indian numbers
export const phoneNumberSchema = z.string()
  .min(10, 'Phone number must be at least 10 digits')
  .regex(/^(\+91)?[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number')

// Email validation (optional)
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .optional()
  .or(z.literal(''))

// Amount validation
export const amountSchema = z.number()
  .min(1, 'Minimum amount is Rs.1')
  .max(500000, 'Maximum amount is Rs.5,00,000')

// Name validation
export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(100, 'Name must be less than 100 characters')
  .regex(/^[a-zA-Z\s\u0900-\u097F.'-]+$/, 'Name can only contain letters, spaces, and basic punctuation')

// Gotra validation (optional)
export const gotraSchema = z.string()
  .max(50, 'Gotra must be less than 50 characters')
  .optional()
  .or(z.literal(''))

// Nakshatra validation (optional)
export const nakshatraSchema = z.string()
  .max(50, 'Nakshatra must be less than 50 characters')
  .optional()
  .or(z.literal(''))

// Date string validation (YYYY-MM-DD format)
export const dateStringSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format')
  .optional()

// Time string validation (HH:MM format)
export const timeStringSchema = z.string()
  .regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format')
  .optional()

// Common user info schema
export const userInfoSchema = z.object({
  fullName: nameSchema,
  phoneNumber: phoneNumberSchema,
  emailAddress: emailSchema,
  gotra: gotraSchema,
  nakshatra: nakshatraSchema,
})

export type UserInfo = z.infer<typeof userInfoSchema>
