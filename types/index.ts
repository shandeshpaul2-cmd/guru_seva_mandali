/**
 * Centralized Type Definitions
 *
 * This module re-exports all types for easy importing throughout the application.
 *
 * Usage:
 *   import { PaymentRequest, Donation, EmailOptions } from '@/types'
 *   import { paymentRequestSchema } from '@/types/schemas'
 */

// Re-export all schema types and validators
export * from './schemas'

// Re-export all service types
export * from './services'

// Re-export all API types
export * from './api'
