'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { LanguageSelector } from '@/shared/components/common/LanguageSelector'
import { useLanguage } from '@/shared/contexts/contexts/LanguageContext'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { validateName, validatePhoneNumber, validateDate } from '@/shared/utils/validation'

export default function BookPoojaPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [poojaName, setPoojaName] = useState('')
  const [devoteeName, setDevoteeName] = useState('')
  const [devoteePhone, setDevoteePhone] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [timeHour, setTimeHour] = useState('')
  const [timeMinute, setTimeMinute] = useState('')
  const [timePeriod, setTimePeriod] = useState('AM')
  const [nakshatra, setNakshatra] = useState('')
  const [gotra, setGotra] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Update preferredTime when hour, minute, or period changes
  const updatePreferredTime = (hour: string, minute: string, period: string) => {
    if (hour && minute) {
      setPreferredTime(`${hour}:${minute} ${period}`)
    } else {
      setPreferredTime('')
    }
  }

  const poojaOptions = [
    { name: 'Nithya Pooja' },
    { name: 'Padha Pooja' },
    { name: 'Panchmrutha Abhisheka' },
    { name: 'Madhu Abhisheka' },
    { name: 'Sarva Seva' },
    { name: 'Vishesha Alankara Seva' },
    { name: 'Belli Kavachadharane' },
    { name: 'Sahasranama Archane' },
    { name: 'Vayusthuthi Punashcharne' },
    { name: 'Kanakabhisheka' },
    { name: 'Vastra Arpane Seva' }
  ]

  const nakshatraOptions = [
    'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashirsha', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
    'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha',
    'Jyeshtha', 'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
    'Uttara Bhadrapada', 'Revati'
  ]

  const handlePoojaSelect = (pooja: { name: string }) => {
    setPoojaName(pooja.name)
  }

  const handleBookPooja = async () => {
    // Validate required fields
    if (!poojaName) {
      toast.error('Please select a pooja')
      return
    }

    const nameValidation = validateName(devoteeName, 'Devotee name')
    if (!nameValidation.isValid) {
      toast.error(nameValidation.error)
      return
    }

    const phoneValidation = validatePhoneNumber(devoteePhone)
    if (!phoneValidation.isValid) {
      toast.error(phoneValidation.error)
      return
    }

    // Validate optional date if provided
    if (preferredDate) {
      const dateValidation = validateDate(preferredDate, false)
      if (!dateValidation.isValid) {
        toast.error(dateValidation.error)
        return
      }
    }

    setIsSubmitting(true)
    try {
      // Generate booking reference number
      const bookingNumber = `BK-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

      // Submit booking (no payment)
      const bookingResponse = await fetch('/api/bookings/pooja', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingNumber,
          poojaName,
          devoteeName,
          devoteePhone,
          preferredDate,
          preferredTime,
          nakshatra,
          gotra
        }),
      })

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking')
      }

      const bookingData = await bookingResponse.json()

      // Store booking details for success page
      sessionStorage.setItem('poojaBookingDetails', JSON.stringify({
        bookingNumber,
        poojaName,
        devoteeName,
        devoteePhone,
        preferredDate,
        preferredTime,
        nakshatra,
        gotra
      }))

      // Show success message
      toast.success('Pooja booked successfully!')

      // Redirect to success page
      router.push(`/book-pooja/success?booking=${bookingNumber}`)
    } catch (error) {
      console.error('Pooja booking error:', error)
      toast.error(t.somethingWentWrong)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-temple-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header with Language Selector and Back Button */}
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-temple-maroon hover:text-temple-gold transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">{t.backToHome}</span>
          </Link>
          <LanguageSelector />
        </div>

        <div className="bg-white rounded-lg shadow-lg border-2 border-temple-gold/20 p-8">
          <h1 className="font-cinzel text-3xl font-bold text-temple-maroon text-center mb-8">
            🕉️ {t.bookPooja}
          </h1>

          <p className="text-gray-600 text-center mb-8">
            {t.bookPoojaDesc}
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.selectPoojaService}</h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {poojaOptions.map((pooja) => (
                  <div
                    key={pooja.name}
                    onClick={() => handlePoojaSelect(pooja)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      poojaName === pooja.name
                        ? 'border-temple-gold bg-orange-50 shadow-sm'
                        : 'border-gray-200 hover:border-temple-gold/50 hover:bg-gray-50'
                    }`}
                  >
                    <span className="font-medium text-gray-800">{pooja.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4">{t.devoteeInfo}</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.fullName} *
                  </label>
                  <input
                    type="text"
                    value={devoteeName}
                    onChange={(e) => setDevoteeName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent"
                    placeholder={t.enterYourFullName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.phoneNumber} *
                  </label>
                  <input
                    type="tel"
                    value={devoteePhone}
                    onChange={(e) => setDevoteePhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent"
                    placeholder={t.enterYourPhone}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.preferredDate}
                  </label>
                  <input
                    type="date"
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.preferredTime}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={timeHour}
                      onChange={(e) => {
                        setTimeHour(e.target.value)
                        updatePreferredTime(e.target.value, timeMinute, timePeriod)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent"
                    >
                      <option value="">Hour</option>
                      {Array.from({ length: 12 }, (_, i) => {
                        const hour = String(i + 1).padStart(2, '0')
                        return <option key={hour} value={hour}>{hour}</option>
                      })}
                    </select>
                    <select
                      value={timeMinute}
                      onChange={(e) => {
                        setTimeMinute(e.target.value)
                        updatePreferredTime(timeHour, e.target.value, timePeriod)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent"
                    >
                      <option value="">Min</option>
                      {Array.from({ length: 6 }, (_, i) => {
                        const minute = String(i * 10).padStart(2, '0')
                        return <option key={minute} value={minute}>{minute}</option>
                      })}
                    </select>
                    <select
                      value={timePeriod}
                      onChange={(e) => {
                        setTimePeriod(e.target.value)
                        updatePreferredTime(timeHour, timeMinute, e.target.value)
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.nakshatra}
                  </label>
                  <select
                    value={nakshatra}
                    onChange={(e) => setNakshatra(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent"
                  >
                    <option value="">{t.selectNakshatra}</option>
                    {nakshatraOptions.map((nak) => (
                      <option key={nak} value={nak}>{nak}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t.gotra}
                  </label>
                  <input
                    type="text"
                    value={gotra}
                    onChange={(e) => setGotra(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent"
                    placeholder={t.enterGotra}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-orange-50 rounded-lg border border-temple-gold/30">
            {poojaName && (
              <div className="mb-4">
                <span className="text-sm text-gray-600">Selected Pooja:</span>
                <p className="font-cinzel text-xl font-bold text-temple-maroon">{poojaName}</p>
              </div>
            )}

            <button
              onClick={handleBookPooja}
              disabled={!poojaName || !devoteeName || !devoteePhone || isSubmitting}
              className="w-full bg-temple-maroon hover:bg-temple-gold hover:text-temple-maroon py-3 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? t.processing : t.bookPooja}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}