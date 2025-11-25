// API route for creating donation orders
import { NextRequest, NextResponse } from 'next/server'
import { RazorpayService } from '@/lib/razorpay-service'

const razorpayService = new RazorpayService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = 'INR', receipt, notes } = body

    if (!amount || !receipt) {
      return NextResponse.json(
        { error: 'Amount and receipt are required' },
        { status: 400 }
      )
    }

    console.log('Creating Razorpay order:', { amount, currency, receipt })

    const order = await razorpayService.createOrder({
      amount: amount * 100, // Convert to paise
      currency,
      receipt,
      notes
    })

    console.log('Razorpay order created successfully:', order.id)

    return NextResponse.json({ success: true, order })
  } catch (error: any) {
    console.error('❌ Error creating Razorpay order:', {
      error: error.message,
      statusCode: error.statusCode,
      description: error.error?.description
    })

    return NextResponse.json(
      {
        error: 'Failed to create payment order',
        details: error.error?.description || error.message
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Donation create-order API endpoint' })
}