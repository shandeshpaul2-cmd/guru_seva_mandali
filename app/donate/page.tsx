'use client'

import { useState, useEffect } from 'react'
import PaymentLoadingButton from '../components/PaymentLoadingButton'
import { LanguageSelector } from '@/shared/components/common/LanguageSelector'
import { useLanguage } from '@/shared/contexts/contexts/LanguageContext'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { validateName, validatePhoneNumber, validateAmount } from '@/shared/utils/validation'

export default function DonatePage() {
  const { t } = useLanguage()
  const [amount, setAmount] = useState('')
  const [donorName, setDonorName] = useState('')
  const [donorPhone, setDonorPhone] = useState('')
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false)

  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setIsRazorpayLoaded(true)
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const handleDonate = async () => {
    // Validate all fields
    const nameValidation = validateName(donorName, 'Donor name')
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error)
      return
    }

    const phoneValidation = validatePhoneNumber(donorPhone)
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error)
      return
    }

    const amountValidation = validateAmount(amount, 1, 500000)
    if (!amountValidation.isValid) {
      toast.error(amountValidation.error)
      return
    }

    try {
      // Redirect to unified payment page with Razorpay integration
      const paymentUrl = new URL('/payment', window.location.origin)
      paymentUrl.searchParams.set('type', 'donation')
      paymentUrl.searchParams.set('amount', amount)
      paymentUrl.searchParams.set('serviceName', 'General Donation')
      paymentUrl.searchParams.set('name', donorName)
      paymentUrl.searchParams.set('phone', donorPhone)

      window.location.href = paymentUrl.toString()
    } catch (error) {
      console.error('Donation error:', error)
      toast.error(t.somethingWentWrong)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header with Language Selector and Back Button */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t.backToHome}</span>
          </Link>
          <LanguageSelector />
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
            <h1 className="text-4xl font-bold text-center mb-2">
              {t.makeSacredDonation}
            </h1>
            <p className="text-center text-orange-100">
              {t.donationSubtitle}
            </p>
          </div>

           <div className="p-8">
             {/* Video Section */}
             <div className="mb-8 rounded-xl overflow-hidden shadow-lg w-64 mx-auto">
               <video 
                 width="100%" 
                 height="auto" 
                 controls
                 className="w-full bg-black"
               >
                 <source src="/videos/donaiton page vid.mp4" type="video/mp4" />
                 Your browser does not support the video tag.
               </video>
             </div>

             <div className="bg-orange-50 rounded-xl p-6 mb-8">
               <div className="text-center mb-3">
                 <span className="text-lg font-medium text-orange-800">{t.supportDivineService}</span>
               </div>
               <p className="text-gray-700 text-center">
                 {t.everyContribution}
               </p>
             </div>

            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder={t.enterYourFullName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t.phoneNumber} *
                  </label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
                    placeholder={t.enterYourPhone}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  {t.selectDonationAmount} *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                  {[500, 1100, 2100, 5100, 11000, 21000].map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmount(amt.toString())}
                      className={`px-4 py-3 border-2 rounded-xl text-sm font-semibold transition-all ${
                        amount === amt.toString()
                          ? 'border-orange-500 bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                          : 'border-gray-200 hover:border-orange-300 bg-white text-gray-700'
                      }`}
                    >
                      ₹{amt.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-center text-lg font-semibold"
                    placeholder={t.enterCustomAmount}
                    min="1"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">₹</span>
                </div>
              </div>

              <PaymentLoadingButton
                onClick={handleDonate}
                disabled={!amount || !donorName || !donorPhone}
                className="w-full py-4 px-8 rounded-xl font-bold text-lg transform hover:scale-[1.02] shadow-lg"
                loadingText={t.processingDonation}
              >
                {t.donate} ₹{amount ? parseInt(amount).toLocaleString('en-IN') : '0'}
              </PaymentLoadingButton>
            </div>

            <div className="mt-8 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl p-6">
              <div className="flex items-center justify-center mb-4">
                <span className="text-2xl">📜</span>
                <h3 className="font-bold text-orange-800 ml-3 text-lg">{t.divineAcknowledgments}</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <p className="text-sm text-gray-700">{t.instantReceipt}</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <p className="text-sm text-gray-700">{t.priestNotification}</p>
                </div>
                <div className="flex items-start">
                  <span className="text-green-500 mr-3 mt-1">✓</span>
                  <p className="text-sm text-gray-700">{t.sacredBlessings}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}