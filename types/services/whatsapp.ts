/**
 * WhatsApp Service Types
 * Centralized type definitions for WhatsApp/Twilio integration
 */

export interface ProductionWhatsAppConfig {
  accountSid: string
  authToken: string
  phoneNumber: string
  webhookUrl?: string
  webhookToken?: string
  rateLimitPerSecond: number
  rateLimitPerMinute: number
  businessProfileId?: string
  enableDeliveryReports: boolean
  logLevel: 'debug' | 'info' | 'warn' | 'error'
}

export interface MessageMetrics {
  sent: number
  delivered: number
  failed: number
  read: number
  lastSentTime?: Date
  averageDeliveryTime?: number
}

export interface DeliveryReport {
  messageId: string
  status: 'queued' | 'sent' | 'delivered' | 'read' | 'failed' | 'undelivered'
  timestamp: Date
  errorCode?: string
  errorMessage?: string
  deliveryTime?: number
}

export interface WhatsAppTemplate {
  name: string
  namespace?: string
  language: {
    code: string
    policy: 'deterministic' | 'fallback'
  }
  components: Array<{
    type: 'body' | 'header' | 'footer'
    text?: string
    parameters?: Array<{ type: string; text: string }>
  }>
}

export interface ProductionWhatsAppMessage {
  phoneNumber: string
  message: string
  type: 'donation' | 'pooja_booking' | 'parihara_pooja' | 'astrology_consultation' | 'template'
  templateName?: string
  templateParams?: string[]
  mediaUrl?: string
  priority?: 'high' | 'normal' | 'low'
  deliveryCallbackUrl?: string
  metadata?: Record<string, unknown>
}

export interface RateLimiter {
  tokens: number
  lastRefill: Date
  windowStart: Date
  countInWindow: number
}

// Template types from whatsapp-templates.ts
export type TemplateKey =
  | 'donation_receipt'
  | 'pooja_booking'
  | 'parihara_pooja'
  | 'astrology_consultation'

export interface WhatsAppTemplateVariable {
  name: string
  type: 'text' | 'currency' | 'date_time'
  value: string
}

export interface TemplateConfig {
  sid: string
  variables: WhatsAppTemplateVariable[]
}

// Message sending result
export interface SendMessageResult {
  success: boolean
  messageId?: string
  error?: string
  status?: string
}

// Donation details for WhatsApp message
export interface DonationDetails {
  donorName: string
  amount: number
  receiptNumber: string
  donationType?: string
  date: string
  phoneNumber: string
  certificateUrl?: string
}

// Pooja booking details for WhatsApp message
export interface PoojaBookingDetails {
  devoteName: string
  poojaName: string
  amount: number
  bookingNumber: string
  date: string
  time?: string
  phoneNumber: string
  certificateUrl?: string
}

// Astrology consultation details for WhatsApp message
export interface AstrologyConsultationDetails {
  devoteName: string
  consultationType: string
  amount: number
  bookingNumber: string
  date: string
  phoneNumber: string
  certificateUrl?: string
}

// Parihara pooja details for WhatsApp message
export interface PariharaPoojaDetails {
  devoteName: string
  poojaName: string
  amount: number
  bookingNumber: string
  date: string
  phoneNumber: string
  certificateUrl?: string
}
