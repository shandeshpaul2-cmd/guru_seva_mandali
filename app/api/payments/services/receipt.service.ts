import { prisma } from '@/lib/prisma'

export type PaymentType = 'donation' | 'pooja' | 'parihara_pooja' | 'astrology_consultation'

/**
 * Get the prefix for a receipt number based on payment type
 */
export function getReceiptPrefix(paymentType: PaymentType): string {
  switch (paymentType) {
    case 'parihara_pooja':
      return 'PARI'
    case 'pooja':
      return 'PB'
    case 'astrology_consultation':
      return 'AC'
    case 'donation':
    default:
      return 'DN'
  }
}

/**
 * Format today's date as DDMMYY
 */
export function getDateString(): string {
  const today = new Date()
  return today.getDate().toString().padStart(2, '0') +
         (today.getMonth() + 1).toString().padStart(2, '0') +
         today.getFullYear().toString().slice(-2)
}

/**
 * Generate a receipt number for a payment
 */
export async function generateReceiptNumber(
  paymentType: PaymentType,
  providedReceiptNumber?: string
): Promise<string> {
  if (providedReceiptNumber) {
    return providedReceiptNumber
  }

  const dateStr = getDateString()
  const prefix = getReceiptPrefix(paymentType)
  const dailySequence = await getDailySequence(paymentType.toUpperCase(), dateStr)

  return `${prefix}-${dateStr}-${dailySequence.toString().padStart(4, '0')}`
}

/**
 * Generate a booking number
 */
export function generateBookingNumber(): string {
  const dateStr = getDateString()
  return `BK-${dateStr}-${Date.now().toString().slice(-4)}`
}

/**
 * Get or increment daily sequence for a type and date
 */
export async function getDailySequence(type: string, dateStr: string): Promise<number> {
  const result = await prisma.$transaction(async (tx) => {
    const existingRecord = await tx.dailySequence.findFirst({
      where: {
        type: type,
        date: dateStr
      }
    })

    let newSequence = 1
    if (existingRecord) {
      newSequence = existingRecord.lastSequence + 1
      await tx.dailySequence.update({
        where: { id: existingRecord.id },
        data: { lastSequence: newSequence }
      })
    } else {
      await tx.dailySequence.create({
        data: {
          type: type,
          date: dateStr,
          lastSequence: newSequence,
        }
      })
    }

    return newSequence
  }, {
    maxWait: 10000,
    timeout: 20000,
  })

  return result
}
