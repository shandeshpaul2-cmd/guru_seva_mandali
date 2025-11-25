/**
 * Email Service Types
 * Centralized type definitions for SendGrid email integration
 */

export interface EmailAttachment {
  filename: string
  content: Buffer | string
  contentType?: string
}

export interface EmailOptions {
  to: string | string[]
  subject: string
  html: string
  from?: string
  attachments?: EmailAttachment[]
}

export interface EmailResult {
  success: boolean
  error?: string
  messageId?: string
}

// Email templates for different notification types
export interface DonationEmailData {
  donorName: string
  amount: number
  receiptNumber: string
  donationType: string
  date: string
  templeName: string
}

export interface PoojaBookingEmailData {
  devoteName: string
  poojaName: string
  amount: number
  bookingNumber: string
  date: string
  time?: string
  templeName: string
}

export interface AstrologyConsultationEmailData {
  devoteName: string
  consultationType: string
  amount: number
  bookingNumber: string
  date: string
  templeName: string
}

export interface PariharaPoojaEmailData {
  devoteName: string
  poojaName: string
  amount: number
  bookingNumber: string
  date: string
  templeName: string
}
