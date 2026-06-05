import { z } from 'zod'

/**
 * Shared list-query schema for admin GET endpoints.
 * Individual routes may pick a subset of these fields via `.pick()`.
 */
export const adminListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  status: z.string().trim().optional(),
  search: z.string().trim().max(200).optional(),
  type: z.enum(['POOJA', 'PARIHARA', 'ASTROLOGY', 'ALL']).optional(),
  sortBy: z.enum(['createdAt', 'amount', 'preferredDate']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
})

export type AdminListQuery = z.infer<typeof adminListQuerySchema>

// Bookings GET: full schema (uses type filter)
export const bookingsListQuerySchema = adminListQuerySchema

// Donations GET: drop the `type` filter (donations have no type categorisation)
export const donationsListQuerySchema = adminListQuerySchema.omit({ type: true })

// Dashboard GET: no query params today, but validate anyway to catch typos
export const dashboardQuerySchema = z.object({}).strict().catchall(z.unknown())

// Gallery GET: no query params today; accept anything but normalised to empty
export const galleryListQuerySchema = z.object({}).passthrough()

/**
 * PATCH /api/admin/bookings
 */
export const bookingActionSchema = z.object({
  bookingId: z.string().min(1),
  action: z.enum(['confirm', 'complete', 'cancel']),
  reason: z.string().max(500).optional(),
})

export type BookingAction = z.infer<typeof bookingActionSchema>

/**
 * PATCH /api/admin/donations
 * Actions currently supported by the handler: 'confirm' | 'fail'
 */
export const donationActionSchema = z.object({
  donationId: z.string().min(1),
  action: z.enum(['confirm', 'fail']),
  reason: z.string().max(500).optional(),
})

export type DonationAction = z.infer<typeof donationActionSchema>
