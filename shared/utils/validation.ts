/**
 * Comprehensive input validation utilities
 * Prevents spam, crashes, and improves data quality
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates phone numbers (Indian format)
 * Accepts: +91XXXXXXXXXX or XXXXXXXXXX (10 digits)
 */
export function validatePhoneNumber(phone: string): ValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' }
  }

  // Remove spaces and special characters except +
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')

  // Check for valid Indian phone number patterns
  const indianPhoneRegex = /^(\+91)?[6-9]\d{9}$/

  if (!indianPhoneRegex.test(cleaned)) {
    return {
      isValid: false,
      error: 'Please enter a valid 10-digit phone number'
    }
  }

  return { isValid: true }
}

/**
 * Validates email addresses
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim() === '') {
    return { isValid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }

  // Check for common typos
  const commonTypos = ['@gmail.con', '@gmail.co', '@yahoo.con', '@hotmail.con']
  if (commonTypos.some(typo => email.toLowerCase().includes(typo))) {
    return { isValid: false, error: 'Please check your email domain (did you mean .com?)' }
  }

  return { isValid: true }
}

/**
 * Validates name fields (prevents special characters and ensures reasonable length)
 */
export function validateName(name: string, fieldName = 'Name'): ValidationResult {
  if (!name || name.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` }
  }

  // Trim and check minimum length
  const trimmed = name.trim()
  if (trimmed.length < 2) {
    return { isValid: false, error: `${fieldName} must be at least 2 characters` }
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: `${fieldName} must be less than 100 characters` }
  }

  // Allow letters, spaces, and common Indian name characters
  const nameRegex = /^[a-zA-Z\s\u0900-\u097F.'-]+$/
  if (!nameRegex.test(trimmed)) {
    return {
      isValid: false,
      error: `${fieldName} can only contain letters, spaces, and basic punctuation`
    }
  }

  return { isValid: true }
}

/**
 * Validates amount/donation values
 */
export function validateAmount(amount: string | number, minAmount = 1, maxAmount = 500000): ValidationResult {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount) || numAmount <= 0) {
    return { isValid: false, error: 'Please enter a valid amount' }
  }

  if (numAmount < minAmount) {
    return { isValid: false, error: `Minimum amount is ₹${minAmount}` }
  }

  if (numAmount > maxAmount) {
    return { isValid: false, error: `Maximum amount is ₹${maxAmount}` }
  }

  // Check for unrealistic decimal places (no fractions of paisa)
  if (numAmount % 1 !== 0) {
    return { isValid: false, error: 'Amount must be a whole number' }
  }

  return { isValid: true }
}

/**
 * Validates date fields (ensures not in past, reasonable future range)
 */
export function validateDate(dateString: string, allowPast = false): ValidationResult {
  if (!dateString || dateString.trim() === '') {
    return { isValid: false, error: 'Date is required' }
  }

  const date = new Date(dateString)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (isNaN(date.getTime())) {
    return { isValid: false, error: 'Please enter a valid date' }
  }

  if (!allowPast && date < today) {
    return { isValid: false, error: 'Date cannot be in the past' }
  }

  // Check if date is too far in the future (more than 1 year)
  const oneYearFromNow = new Date()
  oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1)

  if (date > oneYearFromNow) {
    return { isValid: false, error: 'Date cannot be more than 1 year in the future' }
  }

  return { isValid: true }
}

/**
 * Validates date of birth
 */
export function validateDateOfBirth(dateString: string): ValidationResult {
  if (!dateString || dateString.trim() === '') {
    return { isValid: false, error: 'Date of birth is required' }
  }

  const dob = new Date(dateString)
  const today = new Date()

  if (isNaN(dob.getTime())) {
    return { isValid: false, error: 'Please enter a valid date of birth' }
  }

  // Must be in the past
  if (dob >= today) {
    return { isValid: false, error: 'Date of birth must be in the past' }
  }

  // Check reasonable age range (0-120 years)
  const age = today.getFullYear() - dob.getFullYear()
  if (age < 0 || age > 120) {
    return { isValid: false, error: 'Please enter a valid date of birth' }
  }

  return { isValid: true }
}

/**
 * Validates time format (HH:MM)
 */
export function validateTime(timeString: string): ValidationResult {
  if (!timeString || timeString.trim() === '') {
    return { isValid: false, error: 'Time is required' }
  }

  const timeRegex = /^(0?[1-9]|1[0-2]):[0-5][0-9]$/
  if (!timeRegex.test(timeString)) {
    return { isValid: false, error: 'Please enter time in HH:MM format' }
  }

  return { isValid: true }
}

/**
 * Sanitizes text input to prevent XSS and injection attacks
 */
export function sanitizeText(text: string): string {
  if (!text) return ''

  return text
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .substring(0, 1000) // Limit length
}

/**
 * Validates general text fields with reasonable constraints
 */
export function validateTextField(
  text: string,
  fieldName = 'Field',
  minLength = 1,
  maxLength = 500
): ValidationResult {
  if (!text || text.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` }
  }

  const trimmed = text.trim()

  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} character${minLength > 1 ? 's' : ''}`
    }
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be less than ${maxLength} characters`
    }
  }

  return { isValid: true }
}

/**
 * Validates optional fields (returns valid if empty, otherwise validates)
 */
export function validateOptionalField(
  value: string,
  validator: (value: string) => ValidationResult
): ValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: true }
  }
  return validator(value)
}
