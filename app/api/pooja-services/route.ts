import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const services = await prisma.poojaService.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    })

    return NextResponse.json({ success: true, services })
  } catch (error) {
    console.error('Error fetching pooja services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pooja services' },
      { status: 500 }
    )
  }
}