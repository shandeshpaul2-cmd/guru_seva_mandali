'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Home, ArrowLeft, User, Phone, MapPin, Calendar } from 'lucide-react'
import { LanguageSelector } from '@/shared/components/common/LanguageSelector'

function ConfirmationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const bookingNumber = searchParams.get('booking') || ''

  const [bookingDetails, setBookingDetails] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedDetails = sessionStorage.getItem('pariharaBookingDetails')
    console.log('📦 Retrieved from sessionStorage:', storedDetails)

    if (storedDetails) {
      try {
        const details = JSON.parse(storedDetails)
        console.log('✅ Parsed booking details:', details)
        setBookingDetails(details)
      } catch (error) {
        console.error('❌ Error parsing booking details:', error)
      }
    } else if (bookingNumber) {
      // Fallback if sessionStorage is empty
      console.log('⚠️ No sessionStorage found, using fallback')
      setBookingDetails({
        bookingNumber,
        poojaName: 'Parihara Pooja',
        devoteeName: '',
        devoteePhone: ''
      })
    }

    setIsLoading(false)
  }, [bookingNumber])

  const handleCallUs = () => {
    window.open('tel:+919902820105', '_blank')
  }

  const handleGetDirections = () => {
    const templeAddress = "Sri Raghavendra Brindavana Sannidhi, #12, 1st Main Road, Girinagar, 1st Phase, Bengaluru, Karnataka - 560085"
    const encodedAddress = encodeURIComponent(templeAddress)
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank')
  }

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-temple-cream via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-temple-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    )
  }

  // Error State
  if (!bookingDetails) {
    router.push('/parihara-pooja')
    return null
  }

  // Success State - Display Booking Details
  return (
    <div className="min-h-screen bg-gradient-to-br from-temple-cream via-white to-red-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Language Selector */}
        <div className="flex justify-end mb-4">
          <LanguageSelector />
        </div>

        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-temple-maroon hover:text-temple-gold transition-colors mb-6">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>

        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-xl border-2 border-temple-gold/20 overflow-hidden">
          {/* Top Accent Bar */}
          <div className="h-1.5 bg-gradient-to-r from-temple-maroon via-temple-gold to-temple-maroon"></div>

          <div className="p-6 sm:p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-6">
              <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-temple-maroon mb-2">
                🙏 Parihara Pooja Booking Confirmed!
              </h1>
              <p className="text-gray-600 mb-2">
                Your parihara pooja booking has been successfully received
              </p>
              <p className="text-xs text-gray-500">
                We will contact you soon to discuss your requirements and confirm the pooja date
              </p>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-2 mb-6">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-temple-gold"></div>
              <div className="text-xl text-temple-gold">✦</div>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-temple-gold"></div>
            </div>

            {/* Booking Details */}
            <div className="bg-orange-50 rounded-xl p-4 border border-temple-gold/30 mb-6">
              <h3 className="font-cinzel text-lg font-bold text-temple-maroon mb-3 flex items-center justify-center gap-2">
                <Calendar className="w-5 h-5" />
                Booking Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 text-sm">Booking Number:</span>
                  <span className="font-medium text-temple-maroon font-mono text-sm">{bookingDetails.bookingNumber}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 text-sm">Parihara Service:</span>
                  <span className="font-medium text-temple-maroon text-sm text-right">{bookingDetails.poojaName}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 text-sm">Devotee Name:</span>
                  <span className="font-medium text-temple-maroon text-sm text-right">{bookingDetails.devoteeName || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 text-sm">Phone Number:</span>
                  <span className="font-medium text-temple-maroon text-sm text-right">{bookingDetails.devoteePhone || 'Not provided'}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-gray-600 text-sm">Status:</span>
                  <span className="font-medium text-green-600 text-sm">✓ Confirmed</span>
                </div>
              </div>
            </div>

            {/* Temple Information */}
            <div className="bg-temple-cream/30 rounded-xl p-4 mb-6">
              <h3 className="font-cinzel text-base font-bold text-temple-maroon mb-3 flex items-center justify-center gap-2">
                <MapPin className="w-4 h-4" />
                Visit Our Temple
              </h3>
              <div className="space-y-3">
                <div className="text-center">
                  <p className="font-medium text-gray-800 text-sm">Sri Raghavendra Brindavana Sannidhi</p>
                  <p className="text-xs text-gray-600 mt-1">
                    #12, 1st Main Road, Girinagar, 1st Phase<br />
                    Bengaluru, Karnataka - 560085
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleCallUs}
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors text-sm"
                  >
                    <Phone className="w-3 h-3" />
                    Call Us
                  </button>
                  <button
                    onClick={handleGetDirections}
                    className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
                  >
                    <MapPin className="w-3 h-3" />
                    Directions
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Link href="/" className="block">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-temple-gold/20 to-temple-gold/30 text-temple-maroon rounded-xl font-semibold hover:bg-temple-gold/40 transition-all duration-300 border-2 border-temple-gold/30">
                  <Home className="w-5 h-5" />
                  Return to Home
                </button>
              </Link>

              <Link href="/parihara-pooja" className="block">
                <button className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all duration-300">
                  <ArrowLeft className="w-5 h-5" />
                  Book Another Pooja
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Important Note */}
        <div className="mt-6 bg-yellow-50 rounded-xl p-4 border border-yellow-200">
          <p className="text-xs text-gray-700 text-center">
            <span className="font-semibold">Important:</span> Please keep your booking number ({bookingDetails.bookingNumber}) safe for future reference.
            Our temple staff will contact you to finalize the pooja details.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-temple-cream via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-temple-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  )
}
