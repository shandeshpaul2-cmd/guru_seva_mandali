'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, IndianRupee, Calendar, User, Phone, Heart, Clock, CheckCircle, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/shared/contexts/contexts/LanguageContext'
import { useRazorpay } from '@/features/payments/hooks/useRazorpay'

export type PaymentType = 'donation' | 'pooja'

export interface PaymentItem {
  id: string
  name: string
  description?: string
  amount: number
  type: PaymentType
  metadata?: Record<string, any>
}

export interface UserInfo {
  fullName: string
  phoneNumber: string
}

interface PaymentPortalProps {
  items: PaymentItem[]
  userInfo: UserInfo
  onBack: () => void
  onSuccess: (receiptNumber: string, paymentId: string) => void
  onError: (error: string) => void
}

export default function PaymentPortal({ items, userInfo, onBack, onSuccess, onError }: PaymentPortalProps) {
  const { t } = useLanguage()
  const router = useRouter()
  const { isLoaded, openRazorpay } = useRazorpay()
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentStep, setPaymentStep] = useState<'review' | 'processing' | 'success' | 'error'>('review')
  const [receiptNumber, setReceiptNumber] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Calculate totals - 2% fee is deducted from the amount (not added on top)
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0)
  const platformFee = Math.round(totalAmount * 0.02) // 2% platform fee (deducted)
  const templeAmount = totalAmount - platformFee // Amount received by temple (98%)
  const finalAmount = totalAmount // User pays the entered amount

  useEffect(() => {
    // Load Razorpay script when component mounts
    if (!isLoaded) {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.async = true
      script.onload = () => {
        // Razorpay loaded
      }
      document.body.appendChild(script)

      return () => {
        document.body.removeChild(script)
      }
    }
  }, [isLoaded])

  const handlePayment = async () => {
    if (!isLoaded) {
      onError('Payment gateway is loading. Please wait...')
      return
    }

    setIsProcessing(true)
    setPaymentStep('processing')

    try {
      // Check if this is a pooja booking
      const isPoojaBooking = items.some(item => item.type === 'pooja')

      // Generate receipt and payment ID immediately for optimistic UI
      const receiptNumber = isPoojaBooking
        ? `PJ-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
        : `DN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
      const paymentId = 'direct-' + Date.now()

      setReceiptNumber(receiptNumber)

      // Store payment details in session storage immediately
      const paymentDetails = {
        items,
        userInfo,
        totalAmount,
        finalAmount,
        receiptNumber,
        paymentId,
        date: new Date().toISOString(),
        paymentType: isPoojaBooking ? 'pooja' : 'donation'
      }
      sessionStorage.setItem('paymentDetails', JSON.stringify(paymentDetails))

      // Create order via API in parallel (non-blocking for demo/development)
      const orderPromise = fetch('/api/donations/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          receipt: receiptNumber,
          currency: 'INR',
          notes: {
            donorName: userInfo.fullName,
            donorPhone: userInfo.phoneNumber,
            donationType: isPoojaBooking ? 'pooja' : (items.length === 1 ? items[0].name : 'Multiple Items'),
            donationPurpose: items.map(item => item.name).join(', '),
            isPoojaBooking,
            paymentId,
          },
        }),
      })

      const response = await orderPromise
      const data = await response.json()

      if (!response.ok) {
        console.error('Order creation failed:', data.error, data.details)
        throw new Error(data.details || data.error || 'Failed to create payment order')
      }

      // Validate Razorpay key is configured
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim()
      if (!razorpayKeyId) {
        throw new Error('Payment gateway not configured. Please contact support.')
      }

      // Extract order details from API response
      const razorpayOrder = data.order
      if (!razorpayOrder || !razorpayOrder.id) {
        throw new Error('Invalid order response from server')
      }

      // Real Razorpay checkout - always use actual payment gateway
      const razorpayOptions = {
        key: razorpayKeyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'Shri Raghavendra Swamy Brundavana Sannidhi',
        description: getPaymentDescription(),
        order_id: razorpayOrder.id,
        prefill: {
          name: userInfo.fullName,
          contact: userInfo.phoneNumber,
        },
        notes: {
          items: JSON.stringify(items),
          user_info: JSON.stringify(userInfo),
        },
        theme: {
          color: '#8B0000',
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            setPaymentStep('review')
            onError('Payment was cancelled')
          },
          escape: true,
          handleback: true,
          confirm_close: true,
        },
        handler: async (response: any) => {
          try {
            await processPayment(
              response.razorpay_payment_id,
              response.razorpay_order_id,
              response.razorpay_signature
            )
          } catch (error) {
            console.error('Payment processing failed:', error)
            setErrorMessage('Payment processing failed. Please contact support.')
            setPaymentStep('error')
            setIsProcessing(false)
          }
        },
      }

      openRazorpay(razorpayOptions)
    } catch (error) {
      console.error('Payment error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Payment failed')
      setPaymentStep('error')
      setIsProcessing(false)
    }
  }

  const processPayment = async (paymentId: string, orderId: string, signature: string) => {
    try {
      const paymentType = items[0]?.metadata?.paymentType || (items[0]?.type === 'donation' ? 'donation' : 'pooja')

      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentType,
          amount: finalAmount,
          userInfo: userInfo,
          items: items,
          serviceDetails: items[0]?.metadata,
          razorpayPaymentId: paymentId,
          razorpayOrderId: orderId,
          razorpaySignature: signature
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('Payment API error:', data)
        throw new Error(data.error || 'Payment processing failed')
      }

      const finalReceiptNumber = data.receiptNumber || data.data?.receiptNumber

      if (!finalReceiptNumber) {
        throw new Error('No receipt number received from payment API')
      }

      setReceiptNumber(finalReceiptNumber)
      setPaymentStep('success')
      onSuccess(finalReceiptNumber, paymentId)
    } catch (error) {
      console.error('Payment processing error:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Payment processing failed')
      setPaymentStep('error')
      throw error
    } finally {
      setIsProcessing(false)
    }
  }

  const getPaymentDescription = () => {
    if (items.length === 1) {
      const item = items[0]
      if (item.type === 'donation') {
        return `Donation to ${t.templeName}`
      } else {
        return `Pooja Booking: ${item.name}`
      }
    } else {
      return `${items.length} items - ${t.templeName}`
    }
  }

  const getItemIcon = (item: PaymentItem) => {
    switch (item.type) {
      case 'donation':
        return <Heart className="w-5 h-5 text-red-500" />
      case 'pooja':
        return <Calendar className="w-5 h-5 text-orange-500" />
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />
    }
  }

  const retryPayment = () => {
    setErrorMessage('')
    setPaymentStep('review')
    setIsProcessing(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-temple-cream via-white to-orange-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            disabled={isProcessing}
            className="flex items-center gap-2 text-temple-maroon hover:text-temple-gold transition-colors mb-4 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <div className="text-center">
            <h1 className="font-cinzel text-3xl font-bold text-temple-maroon mb-2">
              {paymentStep === 'review' && 'Payment Review'}
              {paymentStep === 'processing' && 'Processing Payment'}
              {paymentStep === 'success' && 'Payment Successful!'}
              {paymentStep === 'error' && 'Payment Failed'}
            </h1>
            <p className="text-gray-600">
              {paymentStep === 'review' && 'Please review your details before proceeding'}
              {paymentStep === 'processing' && 'Please wait while we process your payment...'}
              {paymentStep === 'success' && 'Thank you for your generous contribution!'}
              {paymentStep === 'error' && 'There was an issue with your payment'}
            </p>
          </div>
        </div>

        {/* Payment Content */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-temple-gold/20 overflow-hidden">
          {/* Review Step */}
          {paymentStep === 'review' && (
            <div className="p-6 sm:p-8">
              {/* User Information */}
              <div className="mb-6">
                <h2 className="font-cinzel text-xl font-semibold text-temple-maroon mb-4 flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Information
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{userInfo.fullName}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{userInfo.phoneNumber}</span>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="mb-6">
                <h2 className="font-cinzel text-xl font-semibold text-temple-maroon mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Order Summary
                </h2>
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {getItemIcon(item)}
                        <div>
                          <p className="font-medium text-gray-900">{item.name}</p>
                          {item.description && (
                            <p className="text-sm text-gray-600">{item.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-temple-maroon">₹{item.amount.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-6 border-t pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-lg font-bold text-temple-maroon">
                    <span>Amount to Pay</span>
                    <span>₹{finalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
                    <span>Platform Fee (2% deducted)</span>
                    <span>- ₹{platformFee.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Temple Receives</span>
                    <span>₹{templeAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              {/* Payment Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-temple-maroon text-white py-4 rounded-xl font-semibold hover:bg-temple-gold hover:text-temple-maroon transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isProcessing ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Processing Your Sacred Offering...
                  </>
                ) : (
                  <>
                    <CreditCard className="w-5 h-5" />
                    Pay ₹{finalAmount.toLocaleString('en-IN')}
                  </>
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                Payment will be processed securely
              </p>
            </div>
          )}

          {/* Processing Step */}
          {paymentStep === 'processing' && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 relative">
                <div className="w-20 h-20 border-4 border-temple-gold border-t-transparent rounded-full animate-spin"></div>
                <CreditCard className="w-8 h-8 text-temple-maroon absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
              <h2 className="text-2xl font-semibold text-temple-maroon mb-2">
                Processing Your Payment
              </h2>
              <p className="text-gray-600 mb-4">
                Processing your payment...
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Do not close this window while the payment is being processed.
                </p>
              </div>
            </div>
          )}

          {/* Success Step */}
          {paymentStep === 'success' && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-temple-maroon mb-2">
                Payment Successful!
              </h2>
              <p className="text-gray-600 mb-4">
                Thank you for your generous contribution to {t.templeName}
              </p>
              {receiptNumber && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-green-800">
                    <strong>Receipt Number:</strong> {receiptNumber}
                  </p>
                  <p className="text-xs text-green-600 mt-2">
                    A confirmation has been sent to your phone number
                  </p>
                </div>
              )}
              <div className="space-y-3">
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-temple-maroon text-white py-3 rounded-lg font-semibold hover:bg-temple-gold hover:text-temple-maroon transition-all duration-300"
                >
                  Back to Home
                </button>
                <button
                  onClick={() => window.print()}
                  className="w-full border-2 border-temple-gold text-temple-gold py-3 rounded-lg font-semibold hover:bg-temple-gold hover:text-white transition-all duration-300"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          )}

          {/* Error Step */}
          {paymentStep === 'error' && (
            <div className="p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-semibold text-temple-maroon mb-2">
                Payment Failed
              </h2>
              <p className="text-gray-600 mb-6">
                {errorMessage || 'There was an issue processing your payment. Please try again.'}
              </p>
              <div className="space-y-3">
                <button
                  onClick={retryPayment}
                  className="w-full bg-temple-maroon text-white py-3 rounded-lg font-semibold hover:bg-temple-gold hover:text-temple-maroon transition-all duration-300"
                >
                  Try Again
                </button>
                <button
                  onClick={onBack}
                  className="w-full border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all duration-300"
                >
                  Back to Form
                </button>
                <p className="text-xs text-gray-500 mt-4">
                  If the problem persists, please contact support
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}