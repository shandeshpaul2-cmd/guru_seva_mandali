'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Script from 'next/script'
import { ArrowLeft, Phone, AlertCircle, IndianRupee, Calendar, User, Star, Heart } from 'lucide-react'
import { toast } from 'sonner'

function ConsultationPaymentContent() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const paymentType = searchParams.get('type') || 'astrology_consultation'
  const serviceName = searchParams.get('serviceName') || 'Consultation'
  const name = searchParams.get('name') || ''
  const phone = searchParams.get('phone') || ''
  const serviceId = searchParams.get('serviceId') || ''

  // Additional details
  const preferredDate = searchParams.get('preferredDate') || ''
  const preferredTime = searchParams.get('preferredTime') || ''
  const nakshatra = searchParams.get('nakshatra') || ''
  const gotra = searchParams.get('gotra') || ''
  const specificIssue = searchParams.get('specificIssue') || ''
  const dateOfBirth = searchParams.get('dateOfBirth') || ''
  const timeOfBirth = searchParams.get('timeOfBirth') || ''
  const placeOfBirth = searchParams.get('placeOfBirth') || ''
  const starSign = searchParams.get('starSign') || ''

  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)

  const templePhone = '+919902820105'

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setIsRazorpayLoaded(true)
    document.body.appendChild(script)

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleCallClick = () => {
    window.open(`tel:${templePhone}`, '_self')
  }

  const handleProceedToPayment = async () => {
    // Validate amount
    if (!amount.trim()) {
      setError('Please enter an amount')
      return
    }

    const amountNum = parseFloat(amount)
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Please enter a valid amount greater than 0')
      return
    }

    if (amountNum < 100) {
      setError('Minimum amount is ₹100')
      return
    }

    if (!isRazorpayLoaded) {
      toast.error('Payment gateway is loading. Please wait...')
      return
    }

    try {
      // Direct Razorpay payment integration
      const isParihara = paymentType === 'parihara_pooja'
      const receiptPrefix = isParihara ? 'PARI' : 'AC'
      const receiptNumber = `${receiptPrefix}-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

      // Create order
      const orderResponse = await fetch('/api/donations/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(amount),
          receipt: receiptNumber,
          currency: 'INR',
          notes: {
            name,
            phone,
            serviceName,
            serviceId,
            preferredDate,
            preferredTime,
            nakshatra,
            gotra,
            specificIssue,
            dateOfBirth,
            timeOfBirth,
            placeOfBirth,
            starSign,
            paymentType
          },
        }),
      })

      if (!orderResponse.ok) {
        throw new Error('Failed to create order')
      }

      const orderData = await orderResponse.json()

      // Open Razorpay checkout
      const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim()
      if (!razorpayKeyId) {
        throw new Error('Payment gateway not configured')
      }

      const options = {
        key: razorpayKeyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Shri Raghavendra Swamy Brundavana Sannidhi',
        description: serviceName,
        order_id: orderData.orderId,
        prefill: {
          name: name,
          contact: phone,
        },
        theme: {
          color: '#8B0000',
        },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          try {
            // Process payment
            const paymentResponse = await fetch('/api/payments', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentType: paymentType,
                amount: parseInt(amount),
                userInfo: {
                  fullName: name,
                  phoneNumber: phone
                },
                items: [{
                  id: serviceId || serviceName,
                  name: serviceName,
                  amount: parseInt(amount),
                  type: paymentType === 'parihara_pooja' ? 'pooja' : 'consultation'
                }],
                serviceDetails: {
                  serviceName,
                  serviceId,
                  preferredDate,
                  preferredTime,
                  nakshatra,
                  gotra,
                  specificIssue,
                  dateOfBirth,
                  timeOfBirth,
                  placeOfBirth,
                  starSign
                },
                razorpayPaymentId: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
                razorpaySignature: response.razorpay_signature
              }),
            })

            const paymentData = await paymentResponse.json()

            if (!paymentResponse.ok) {
              throw new Error(paymentData.error || 'Payment processing failed')
            }

            // Redirect to appropriate success page
            toast.success('Payment successful!')
            if (isParihara) {
              window.location.href = `/parihara-pooja/confirmation?receipt=${paymentData.receiptNumber || receiptNumber}`
            } else {
              window.location.href = `/astrology-consultation/success?receipt=${paymentData.receiptNumber || receiptNumber}`
            }
          } catch (error) {
            console.error('Payment processing error:', error)
            toast.error('Payment processing failed. Please contact support.')
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment was cancelled')
          }
        }
      }

      const razorpay = new (window as unknown as { Razorpay: new (options: unknown) => { open: () => void } }).Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.error('Payment error:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  const handleBack = () => {
    router.back()
  }

  const isParihara = paymentType === 'parihara_pooja'

  return (
    <div className="min-h-screen bg-temple-cream">
      <Script src="https://apis.google.com/js/platform.js" strategy="lazyOnload" />
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl py-8">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-temple-maroon hover:text-temple-gold transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back</span>
          </button>

          <div className="text-center">
            <div className="om-symbol text-3xl text-temple-maroon mb-2">ॐ</div>
            <h1 className="font-cinzel text-3xl font-bold text-temple-maroon mb-2">
              Consultation Payment
            </h1>
            <p className="text-gray-600">
              Complete your payment for {serviceName}
            </p>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-2xl border-2 border-temple-gold/20 overflow-hidden">
          {/* Top Accent Bar */}
          <div className="h-2 bg-gradient-to-r from-temple-maroon via-temple-gold to-temple-maroon"></div>

          <div className="p-6 sm:p-8 space-y-6">
            {/* Important Warning */}
            <div className="bg-temple-cream border-2 border-temple-gold/40 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-temple-maroon flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-temple-maroon mb-2 text-lg">
                    ⚠️ Important: Consult First, Then Pay
                  </h3>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    Please call our priest and discuss your {isParihara ? 'parihara requirements' : 'birth chart analysis'} before
                    making the payment. The consultation will help determine the exact remedies needed and the appropriate amount.
                  </p>
                  <p className="text-temple-maroon text-xs font-medium">
                    💡 After the consultation, return to this page to enter the agreed amount and complete your payment.
                  </p>
                </div>
              </div>
            </div>

            {/* Call Button */}
            <div className="bg-temple-cream border-2 border-temple-gold/40 rounded-xl p-5">
              <div className="text-center">
                <h3 className="font-bold text-temple-maroon mb-3 text-lg">
                  📞 Call for Consultation
                </h3>
                <p className="text-gray-700 text-sm mb-4">
                  Our priest is available to discuss your requirements
                </p>
                <button
                  onClick={handleCallClick}
                  className="w-full bg-gradient-to-r from-temple-maroon to-red-700 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-temple-maroon hover:to-red-800 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
                >
                  <Phone className="w-6 h-6" />
                  Call Now: {templePhone}
                </button>
                <p className="text-temple-gold text-xs mt-2">
                  Available: 8:00 AM - 8:00 PM (IST)
                </p>
              </div>
            </div>

            {/* Booking Details Summary */}
            <div className="bg-temple-cream rounded-xl p-4 border border-temple-gold/30">
              <h3 className="font-bold text-temple-maroon mb-3 flex items-center gap-2">
                <User className="w-5 h-5" />
                Booking Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone:</span>
                  <span className="font-medium text-gray-900">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Service:</span>
                  <span className="font-medium text-gray-900">{serviceName}</span>
                </div>
                {preferredDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Preferred Date:</span>
                    <span className="font-medium text-gray-900">{new Date(preferredDate).toLocaleDateString('en-IN')}</span>
                  </div>
                )}
                {nakshatra && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Nakshatra:</span>
                    <span className="font-medium text-gray-900">{nakshatra}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
              <span className="text-gray-500 text-sm font-medium">After Consultation</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            </div>

            {/* Amount Input */}
            <div className="bg-temple-cream rounded-xl p-5 border-2 border-temple-gold/40">
              <h3 className="font-bold text-temple-maroon mb-4 text-lg flex items-center gap-2">
                <IndianRupee className="w-5 h-5" />
                Enter Payment Amount
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (as discussed with priest) *
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-bold text-xl">
                      ₹
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value)
                        setError('')
                      }}
                      aria-label="Payment amount"
                      min="100"
                      step="1"
                      placeholder="Enter amount (minimum ₹100)"
                      className={`w-full pl-12 pr-4 py-4 rounded-xl border-2 text-xl font-semibold ${
                        error
                          ? 'border-red-400 focus:border-red-500 bg-red-50'
                          : 'border-temple-gold/40 focus:border-temple-gold'
                      } focus:outline-none transition-colors`}
                    />
                  </div>
                  {error && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{error}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-600">
                    Enter the amount as agreed during your consultation call
                  </p>
                </div>
              </div>
            </div>

            {/* Proceed Button */}
            <button
              onClick={handleProceedToPayment}
              disabled={!amount}
              className="w-full bg-gradient-to-r from-temple-maroon to-red-700 text-white py-5 px-6 rounded-xl font-bold text-xl hover:from-temple-gold hover:to-temple-orange hover:text-temple-maroon transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:from-temple-maroon disabled:hover:to-red-700 disabled:hover:text-white shadow-lg transform hover:scale-105"
            >
              {amount ? `Proceed to Pay ₹${parseFloat(amount).toLocaleString('en-IN')}` : 'Enter Amount to Continue'}
            </button>

            {/* Info Note */}
            <div className="bg-temple-cream border border-temple-gold/30 rounded-lg p-4 text-center">
              <p className="text-xs text-temple-maroon">
                <strong>Secure Payment:</strong> You will be redirected to Razorpay for secure payment processing
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConsultationPaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-temple-cream flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-temple-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payment page...</p>
        </div>
      </div>
    }>
      <ConsultationPaymentContent />
    </Suspense>
  )
}
