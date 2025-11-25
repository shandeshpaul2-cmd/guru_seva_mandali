/**
 * Admin API Types
 * Centralized type definitions for admin dashboard and management endpoints
 */

// Dashboard data types
export interface DashboardStats {
  totalDonations: number
  totalBookings: number
  totalRevenue: number
  todayDonations: number
  todayBookings: number
  todayRevenue: number
}

export interface DashboardData {
  stats: DashboardStats
  recentDonations: DonationSummary[]
  recentBookings: BookingSummary[]
  chartData?: ChartData
}

export interface DonationSummary {
  id: string
  receiptNumber: string
  donorName: string
  amount: number
  donationType: string
  createdAt: string
  status: string
}

export interface BookingSummary {
  id: string
  bookingNumber: string
  devoteName: string
  serviceName: string
  amount: number
  bookingDate: string
  status: string
}

export interface ChartData {
  labels: string[]
  donations: number[]
  bookings: number[]
}

// Donation list types
export interface Donation {
  id: string
  receiptNumber: string
  donationType: string
  amount: number
  donorName: string
  phoneNumber: string
  emailAddress?: string
  gotra?: string
  nakshatra?: string
  status: string
  createdAt: string
  updatedAt: string
  razorpayPaymentId?: string
  razorpayOrderId?: string
}

export interface DonationsResponse {
  donations: Donation[]
  pagination: PaginationData
}

// Booking list types
export interface Booking {
  id: string
  bookingNumber: string
  devoteName: string
  phoneNumber: string
  emailAddress?: string
  serviceName: string
  serviceType: 'pooja' | 'parihara_pooja' | 'astrology_consultation'
  amount: number
  bookingDate: string
  bookingTime?: string
  status: string
  createdAt: string
  updatedAt: string
  razorpayPaymentId?: string
  razorpayOrderId?: string
  gotra?: string
  nakshatra?: string
  specialInstructions?: string
}

export interface BookingsResponse {
  bookings: Booking[]
  pagination: PaginationData
}

// Pagination types
export interface PaginationData {
  total: number
  page: number
  limit: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Filter types
export interface DonationFilters {
  status?: string
  donationType?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}

export interface BookingFilters {
  status?: string
  serviceType?: string
  startDate?: string
  endDate?: string
  search?: string
  page?: number
  limit?: number
}

// Admin action types
export interface AdminActionResult {
  success: boolean
  message?: string
  error?: string
}
