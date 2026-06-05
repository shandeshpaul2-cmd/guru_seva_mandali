'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, User, Phone, Calendar, MapPin, Clock, Star, Sparkles, Heart } from 'lucide-react'
import { useLanguage } from '@/shared/contexts/contexts/LanguageContext'
import { Input, Button } from '@/shared/components/ui'
import { LanguageSelector } from '@/shared/components/common/LanguageSelector'
import { toast } from 'sonner'
import { validateName, validatePhoneNumber, validateDateOfBirth, validateTime, validateTextField } from '@/shared/utils/validation'

interface FormData {
  fullName: string
  phoneNumber: string
  dateOfBirth: string
  timeOfBirth: string
  placeOfBirth: string
  starSign: string
}


export default function AstrologyConsultationPage() {
  const { t } = useLanguage()
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phoneNumber: '',
    dateOfBirth: '',
    timeOfBirth: '',
    placeOfBirth: '',
    starSign: '',
  })

  const [timeHour, setTimeHour] = useState('')
  const [timeMinute, setTimeMinute] = useState('')
  const [timePeriod, setTimePeriod] = useState('AM')

  const [errors, setErrors] = useState<Partial<FormData>>({})

  // Update timeOfBirth when hour, minute, or period changes
  const updateTimeOfBirth = (hour: string, minute: string, period: string) => {
    if (hour && minute) {
      setFormData(prev => ({ ...prev, timeOfBirth: `${hour}:${minute} ${period}` }))
    } else {
      setFormData(prev => ({ ...prev, timeOfBirth: '' }))
    }

    // Clear error when user updates time
    if (errors.timeOfBirth) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors.timeOfBirth
        return newErrors
      })
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof FormData]
        return newErrors
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof FormData]
        return newErrors
      })
    }
  }

  // Function to calculate star sign based on date of birth
  const getStarSign = (dateString: string): string => {
    if (!dateString) return ''

    const date = new Date(dateString)
    const month = date.getMonth() + 1 // 1-12
    const day = date.getDate()

    if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries ♈'
    if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus ♉'
    if ((month === 5 && day >= 21) || (month === 6 && day <= 20)) return 'Gemini ♊'
    if ((month === 6 && day >= 21) || (month === 7 && day <= 22)) return 'Cancer ♋'
    if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo ♌'
    if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo ♍'
    if ((month === 9 && day >= 23) || (month === 10 && day <= 22)) return 'Libra ♎'
    if ((month === 10 && day >= 23) || (month === 11 && day <= 21)) return 'Scorpio ♏'
    if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius ♐'
    if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn ♑'
    if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius ♒'
    if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces ♓'

    return ''
  }

  // Auto-update star sign when date of birth changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      starSign: name === 'dateOfBirth' ? getStarSign(value) : prev.starSign
    }))

    // Clear error when user starts typing
    if (errors[name as keyof FormData]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name as keyof FormData]
        return newErrors
      })
    }
  }

  const validateForm = () => {
    const newErrors: Partial<FormData> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = t.nameRequired
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = t.phoneRequired
    } else {
      const cleanPhone = formData.phoneNumber.replace(/\D/g, '')
      if (cleanPhone.length < 6 || cleanPhone.length > 15) {
        newErrors.phoneNumber = t.validPhone
      }
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = t.dobRequired
    } else {
      const dob = new Date(formData.dateOfBirth)
      const today = new Date()
      if (dob > today) {
        newErrors.dateOfBirth = t.dobFuture
      }
    }

    if (!formData.timeOfBirth) {
      newErrors.timeOfBirth = t.timeRequired
    }

    if (!formData.placeOfBirth.trim()) {
      newErrors.placeOfBirth = t.locationRequired
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      toast.error(t.fillRequiredCorrectly)
      return
    }

    try {
      // Generate booking reference number
      const bookingNumber = `AC-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

      // Create booking
      const bookingResponse = await fetch('/api/bookings/astrology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingNumber,
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          timeOfBirth: formData.timeOfBirth,
          placeOfBirth: formData.placeOfBirth,
          starSign: formData.starSign
        }),
      })

      if (!bookingResponse.ok) {
        throw new Error('Failed to create booking')
      }

      await bookingResponse.json()

      router.push(`/astrology-consultation/success?booking=${bookingNumber}`)
    } catch (error) {
      console.error('Consultation booking error:', error)
      toast.error(t.somethingWentWrong)
    }
  }

  return (
    <div className="min-h-screen bg-temple-cream">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
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

          <div className="text-center">
            {/* Sri Raghavendra Swamy Logo */}
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto overflow-hidden rounded-full">
                <img
                  src="/sri-raghavendra-logo.png"
                  alt="Sri Raghavendra Swamy"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 35%' }}
                />
              </div>
            </div>

            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-temple-maroon mb-2">
              {t.astrologyConsultation}
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto mb-6">
              {t.astrologySubtitle}
            </p>

            {/* Decorative Divider */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="h-px w-12 bg-temple-gold"></div>
              <div className="text-temple-gold text-sm">●</div>
              <div className="h-px w-12 bg-temple-gold"></div>
            </div>
          </div>
        </div>

        {/* Service Benefits */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-8">
          <div className="text-center mb-6">
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-temple-maroon mb-2">
              {t.completeLifeGuidance}
            </h2>
            <p className="text-gray-600 text-sm">{t.allInclusiveConsultation}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-temple-maroon rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-temple-maroon text-sm mb-2">{t.birthChartAnalysis}</h3>
              <p className="text-xs text-gray-600">{t.birthChartDesc}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-temple-maroon rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-temple-maroon text-sm mb-2">{t.personalGuidance}</h3>
              <p className="text-xs text-gray-600">{t.personalGuidanceDesc}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-temple-maroon rounded-full flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-temple-maroon text-sm mb-2">{t.futurePredictions}</h3>
              <p className="text-xs text-gray-600">{t.futurePredictionsDesc}</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-temple-maroon rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-temple-maroon text-sm mb-2">{t.remediesSolutions}</h3>
              <p className="text-xs text-gray-600">{t.remediesSolutionsDesc}</p>
            </div>
          </div>
        </div>


        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-lg border-2 border-temple-gold/20 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Personal Information Section */}
            <div>
              <h2 className="font-cinzel text-xl font-bold text-temple-maroon mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-temple-maroon" />
                {t.personalInformation}
              </h2>

              <div className="space-y-6">
                <Input
                  label={t.fullName}
                  name="fullName"
                  placeholder={t.enterYourFullName}
                  value={formData.fullName}
                  onChange={handleInputChange}
                  error={errors.fullName}
                  required
                  leftIcon={<User className="w-5 h-5 text-gray-400" />}
                />

                <Input
                  label={t.phoneNumber}
                  name="phoneNumber"
                  type="tel"
                  placeholder={t.enterYourPhone}
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  error={errors.phoneNumber}
                  required
                  leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                />
              </div>
            </div>

            {/* Birth Details Section */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="font-cinzel text-xl font-bold text-temple-maroon mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-temple-maroon" />
                {t.birthDetails}
              </h2>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      {t.dateOfBirth} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleDateChange}
                      aria-label={t.dateOfBirth}
                      max={new Date().toISOString().split('T')[0]}
                      className={`w-full px-3 py-2 rounded-lg border text-base ${
                        errors.dateOfBirth
                          ? 'border-red-300 focus:border-red-500'
                          : 'border-gray-300 focus:ring-2 focus:ring-temple-gold focus:border-transparent'
                      } focus:outline-none transition-colors`}
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-2 text-sm text-red-500">{errors.dateOfBirth}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      {t.timeOfBirth} <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      <select
                        value={timeHour}
                        onChange={(e) => {
                          setTimeHour(e.target.value)
                          updateTimeOfBirth(e.target.value, timeMinute, timePeriod)
                        }}
                        className={`px-3 py-2 rounded-lg border text-base ${
                          errors.timeOfBirth
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300 focus:ring-2 focus:ring-temple-gold focus:border-transparent'
                        } focus:outline-none transition-colors bg-white`}
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
                          updateTimeOfBirth(timeHour, e.target.value, timePeriod)
                        }}
                        className={`px-3 py-2 rounded-lg border text-base ${
                          errors.timeOfBirth
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300 focus:ring-2 focus:ring-temple-gold focus:border-transparent'
                        } focus:outline-none transition-colors bg-white`}
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
                          updateTimeOfBirth(timeHour, timeMinute, e.target.value)
                        }}
                        className={`px-3 py-2 rounded-lg border text-base font-semibold ${
                          errors.timeOfBirth
                            ? 'border-red-300 focus:border-red-500'
                            : 'border-gray-300 focus:ring-2 focus:ring-temple-gold focus:border-transparent'
                        } focus:outline-none transition-colors bg-white`}
                      >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                      </select>
                    </div>
                    {errors.timeOfBirth && (
                      <p className="mt-2 text-sm text-red-500">{errors.timeOfBirth}</p>
                    )}
                    <p className="mt-2 text-sm text-gray-500">Select hour, minute, and AM/PM</p>
                  </div>
                </div>

                <Input
                  label={t.birthLocation}
                  name="placeOfBirth"
                  placeholder={t.enterLocation}
                  value={formData.placeOfBirth}
                  onChange={handleInputChange}
                  error={errors.placeOfBirth}
                  required
                  leftIcon={<MapPin className="w-5 h-5 text-gray-400" />}
                />

                {/* Moon Sign (Rashi) Field */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    {t.moonSign}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="starSign"
                      value={formData.starSign}
                      readOnly
                      aria-label={t.moonSign}
                      placeholder={t.autoCalculated}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 bg-gray-50 text-base font-semibold text-temple-maroon cursor-not-allowed"
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Star className="w-5 h-5 text-temple-gold" />
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    {t.autoCalculated}
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full py-3 text-lg font-bold bg-temple-maroon hover:bg-temple-maroon/90 text-white transition-all shadow-md hover:shadow-lg"
              >
                {t.bookConsultation}
              </Button>

              <div className="text-center mt-4 space-y-1">
                <p className="text-sm text-gray-600">
                  {t.instantConfirmation}
                </p>
                <p className="text-xs text-gray-500">
                  {t.trustedByThousands}
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}