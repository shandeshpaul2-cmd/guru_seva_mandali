'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { CheckCircle, Home, Download, Share2, Calendar, Gift, MapPin, Phone } from 'lucide-react'
import { certificateService, CertificateData } from '@/lib/certificate-service'
import { LanguageSelector } from '@/shared/components/common/LanguageSelector'

interface DonationDetails {
  donorName: string
  donorPhone: string
  amount: number
  donationType: string
  donationPurpose: string
  receiptNumber: string
  paymentId: string
  date: string
}

function DonationSuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [donationDetails, setDonationDetails] = useState<DonationDetails | null>(null)
  const [certificateLoading, setCertificateLoading] = useState(false)
  const [certificateError, setCertificateError] = useState<string | null>(null)
  const [certificateGenerated, setCertificateGenerated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadDonationDetails = async () => {
      // Try to get receipt number from URL params
      const receiptFromUrl = searchParams.get('receipt')
      const paymentIdFromUrl = searchParams.get('paymentId')

      if (receiptFromUrl) {
        // We have receipt number from URL, try to fetch from API
        try {
          const response = await fetch(`/api/certificate/${receiptFromUrl}`)
          if (response.ok) {
            const data = await response.json()
            setDonationDetails({
              donorName: data.donorName || 'Devotee',
              donorPhone: data.phoneNumber || '',
              amount: data.amount || 0,
              donationType: data.donationType || 'General Donation',
              donationPurpose: data.donationPurpose || 'Temple Maintenance',
              receiptNumber: data.receiptNumber || receiptFromUrl,
              paymentId: data.paymentId || paymentIdFromUrl || '',
              date: data.createdAt || new Date().toISOString()
            })
            setLoading(false)
            return
          }
        } catch (error) {
          console.error('Error fetching donation details:', error)
        }

        // If API fetch fails, create minimal details from URL params
        setDonationDetails({
          donorName: 'Devotee',
          donorPhone: '',
          amount: 0,
          donationType: 'General Donation',
          donationPurpose: 'Temple Maintenance',
          receiptNumber: receiptFromUrl,
          paymentId: paymentIdFromUrl || '',
          date: new Date().toISOString()
        })
        setLoading(false)
        return
      }

      // Fall back to sessionStorage
      const storedDetails = sessionStorage.getItem('donationDetails')
      if (storedDetails) {
        try {
          const details = JSON.parse(storedDetails)
          setDonationDetails(details)
          setLoading(false)
          return
        } catch (error) {
          console.error('Error parsing donation details:', error)
        }
      }

      // No donation details found anywhere, redirect to donate page
      router.push('/donate')
    }

    loadDonationDetails()
  }, [router, searchParams])


  const handleDonateAgain = () => {
    sessionStorage.removeItem('donationDetails')
    router.push('/donate')
  }

  const handleGenerateCertificate = async () => {
    if (!donationDetails) return

    setCertificateLoading(true)
    setCertificateError(null)

    try {
      const certificateData: CertificateData = {
        donor_name: donationDetails.donorName,
        amount: donationDetails.amount,
        donation_id: donationDetails.receiptNumber,
        donation_date: new Date(donationDetails.date).toISOString().split('T')[0],
        phone_number: donationDetails.donorPhone || '',
        reason_text: 'for their valued contribution',
      }

      const result = await certificateService.generateAndDownload(certificateData)

      if (result.success) {
        setCertificateGenerated(true)
      } else {
        setCertificateError(result.error || 'Failed to generate certificate')
      }

    } catch (error) {
      console.error('Certificate generation error:', error)
      setCertificateError('Failed to generate certificate. Please try again.')
    } finally {
      setCertificateLoading(false)
    }
  }

  if (loading || !donationDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading donation details...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 py-8 px-4">
      {/* Language Selector */}
      <div className="max-w-xl mx-auto mb-4">
        <div className="flex justify-end">
          <LanguageSelector />
        </div>
      </div>

      <div className="max-w-xl w-full mx-auto">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-xl border-2 border-red-100 overflow-hidden">
          {/* Top Accent Bar */}
          <div className="h-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-600"></div>

          <div className="p-8">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
            </div>

            {/* Success Message */}
            <div className="text-center mb-8">
              <h1 className="font-cinzel text-3xl font-bold text-red-800 mb-3">
                Donation Successful
              </h1>
              <p className="text-gray-600 text-lg mb-2">
                Thank you for your generous contribution
              </p>
              <p className="text-sm text-gray-500">
                Your support helps us continue our spiritual services
              </p>
            </div>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-red-400"></div>
              <div className="text-2xl text-red-400">✦</div>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-red-400"></div>
            </div>

            {/* Donation Details */}
            <div className="bg-red-50 rounded-2xl p-6 mb-8">
              <h3 className="font-cinzel text-xl font-bold text-red-800 mb-4 flex items-center gap-2">
                <Gift className="w-5 h-5" />
                Donation Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Receipt Number:</span>
                  <span className="font-medium text-red-800 font-mono">{donationDetails.receiptNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Donor Name:</span>
                  <span className="font-medium text-red-800">{donationDetails.donorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Phone Number:</span>
                  <span className="font-medium text-red-800">{donationDetails.donorPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium text-red-800">
                    {new Date(donationDetails.date).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                <div className="border-t border-red-200 pt-3 mt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-bold text-gray-800">Amount Paid:</span>
                    <span className="text-xl font-bold text-green-600">
                      ₹{donationDetails.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Certificate Section */}
            <div className="bg-blue-50 rounded-2xl p-6 mb-8">
              <h3 className="font-cinzel text-lg font-bold text-blue-800 mb-4 flex items-center gap-2">
                <Download className="w-5 h-5" />
                Download Certificate
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Generate an official donation certificate for your records.
                </p>

                {certificateError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                    <p className="text-sm">{certificateError}</p>
                  </div>
                )}

                {certificateGenerated && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                    <p className="text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Certificate generated successfully! Check your downloads folder.
                    </p>
                  </div>
                )}

                <button
                  onClick={handleGenerateCertificate}
                  disabled={certificateLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all disabled:from-blue-400 disabled:to-indigo-400 disabled:cursor-not-allowed"
                >
                  {certificateLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating Certificate...
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      Download Certificate
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={handleDonateAgain}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-rose-700 transition-all"
              >
                <Gift className="w-5 h-5" />
                Donate Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-600 text-white rounded-xl font-semibold hover:bg-gray-700 transition-colors"
              >
                <Home className="w-5 h-5" />
                Go Home
              </button>
            </div>

            {/* Temple Location Section */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-6 mb-8">
              <h3 className="font-cinzel text-lg font-bold text-red-800 mb-4 flex items-center justify-center gap-2">
                <MapPin className="w-5 h-5" />
                Visit Our Temple
              </h3>
              <div className="space-y-4">
                <div className="text-center">
                  <p className="font-medium text-gray-800">Sri Raghavendra Brindavana Sannidhi</p>
                  <p className="text-sm text-gray-600 mt-1">
                    #12, 1st Main Road, Girinagar, 1st Phase<br />
                    Bengaluru, Karnataka - 560085
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const templeAddress = "Sri Raghavendra Brindavana Sannidhi, #12, 1st Main Road, Girinagar, 1st Phase, Bengaluru, Karnataka - 560085"
                      const encodedAddress = encodeURIComponent(templeAddress)
                      window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank')
                    }}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <MapPin className="w-4 h-4" />
                    Get Directions
                  </button>
                  <button
                    onClick={() => window.open('tel:+919902820105', '_blank')}
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Call Us
                  </button>
                </div>
              </div>
            </div>

            {/* WhatsApp Info */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6">
              <h3 className="font-cinzel text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                WhatsApp Confirmation
              </h3>
              <p className="text-sm text-gray-600">
                You will receive a confirmation message with your receipt details on WhatsApp shortly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DonationSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <DonationSuccessContent />
    </Suspense>
  )
}