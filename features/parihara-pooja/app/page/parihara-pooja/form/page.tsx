'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Calendar, Clock, User, Phone, IndianRupee, Check, Star, Heart } from 'lucide-react'
import { useLanguage } from '@/shared/contexts/contexts/LanguageContext'
import { Button } from '@/shared/components/ui'
import { toast } from 'sonner'

interface PariharaService {
  id: number
  poojaName: string
  description: string
  price: number
  displayOrder: number
  purpose: string
  benefits: string[]
}

interface FormData {
  name: string
  phone: string
  nakshatra: string
  gotra: string
  date: string
  timeSlot: string
  specificIssue: string
}

const TIME_SLOTS = [
  '6:00 AM - 8:00 AM',
  '8:00 AM - 10:00 AM',
  '10:00 AM - 12:00 PM',
  '12:00 PM - 2:00 PM',
  '2:00 PM - 4:00 PM',
  '4:00 PM - 6:00 PM',
  '6:00 PM - 8:00 PM',
]

const NAKSHATRAS = [
  'Ashwini (अश्विनी)',
  'Bharani (भरणी)',
  'Krittika (कृत्तिका)',
  'Rohini (रोहिणी)',
  'Mrigashirsha (मृगशिरा)',
  'Ardra (आर्द्रा)',
  'Punarvasu (पुनर्वसु)',
  'Pushya (पुष्य)',
  'Ashlesha (आश्लेषा)',
  'Magha (मघा)',
  'Purva Phalguni (पूर्व फाल्गुनी)',
  'Uttara Phalguni (उत्तर फाल्गुनी)',
  'Hasta (हस्त)',
  'Chitra (चित्रा)',
  'Swati (स्वाति)',
  'Vishakha (विशाखा)',
  'Anuradha (अनुराधा)',
  'Jyeshtha (ज्येष्ठा)',
  'Mula (मूल)',
  'Purva Ashadha (पूर्वाषाढ़ा)',
  'Uttara Ashadha (उत्तराषाढ़ा)',
  'Shravana (श्रवण)',
  'Dhanishta (धनिष्ठा)',
  'Shatabhisha (शतभिषा)',
  'Purva Bhadrapada (पूर्व भाद्रपदा)',
  'Uttara Bhadrapada (उत्तर भाद्रपदा)',
  'Revati (रेवती)',
]

const GOTRAS = [
  'Agastya (अगस्त्य)',
  'Atri (अत्रि)',
  'Bharadwaja (भरद्वाज)',
  'Bhrigu (भृगु)',
  'Chandilya (चाण्डिल्य)',
  'Garga (गर्ग)',
  'Harita (हरित)',
  'Jamadagni (जमदग्नि)',
  'Kashyapa (कश्यप)',
  'Kaundinya (कौण्डिन्य)',
  'Katyayana (कात्यायन)',
  'Kraunchi (क्रौंची)',
  'Krushna (कृष्ण)',
  'Kubera (कुबेर)',
  'Lauhitya (लौहित्य)',
  'Maanava (मानव)',
  'Mandavya (माण्डव्य)',
  'Maudgalya (मौद्गल्य)',
  'Parashara (पराशर)',
  'Paurava (पौरव)',
  'Pulastya (पुलस्त्य)',
  'Shandilya (शाण्डिल्य)',
  'Shunaka (शुनक)',
  'Upamanyu (उपमन्यु)',
  'Vashista (वशिष्ठ)',
  'Vatsa (वत्स)',
  'Vishvamitra (विश्वामित्र)',
  'Yaska (यास्क)',
  'Others (अन्य)',
]

function PariharaBookingFormPageContent() {
  const { t } = useLanguage()
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get('service')

  const [service, setService] = useState<PariharaService | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const [formData, setFormData] = useState<FormData>({
    name: '',
    phone: '',
    nakshatra: '',
    gotra: '',
    date: '',
    timeSlot: '',
    specificIssue: '',
  })

  const [errors, setErrors] = useState<Partial<FormData>>({})

  useEffect(() => {
    if (!serviceId) {
      router.push('/parihara-pooja')
      return
    }
    fetchService()
  }, [serviceId, router])

  const fetchService = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

    try {
      // For now, using static data. This can be fetched from an API later
      const pariharaServices: PariharaService[] = [
        {
          id: 1,
          poojaName: "Shani Shanti Parihara",
          description: "Powerful rituals to pacify Saturn and alleviate Sade Sati effects",
          price: 3000,
          displayOrder: 1,
          purpose: "For those experiencing Saturn-related challenges",
          benefits: ["Reduces obstacles", "Brings stability", "Improves career prospects", "Peace of mind"]
        },
        {
          id: 2,
          poojaName: "Mangal Dosha Parihara",
          description: "Sacred ceremonies to neutralize Mars dosha and remove marriage obstacles",
          price: 2500,
          displayOrder: 2,
          purpose: "For those with Mangal dosha in their horoscope",
          benefits: ["Removes marriage delays", "Harmonious relationships", "Career success", "Health improvements"]
        },
        {
          id: 3,
          poojaName: "Rahu-Ketu Shanti",
          description: "Special poojas to balance the shadow planets and remove karmic obstacles",
          price: 2800,
          displayOrder: 3,
          purpose: "For those affected by Rahu-Ketu dosha",
          benefits: ["Mental clarity", "Removes confusion", "Spiritual growth", "Financial stability"]
        },
        {
          id: 4,
          poojaName: "Guru Dosha Parihara",
          description: "Divine worship to seek Jupiter's blessings and remove educational/career obstacles",
          price: 2000,
          displayOrder: 4,
          purpose: "For those facing educational or career challenges",
          benefits: ["Enhanced knowledge", "Career growth", "Wisdom and guidance", "Family harmony"]
        },
        {
          id: 5,
          poojaName: "Kala Sarpa Dosha Parihara",
          description: "Intensive rituals to counteract the effects of Kala Sarpa yoga",
          price: 5000,
          displayOrder: 5,
          purpose: "For those with Kala Sarpa dosha in their birth chart",
          benefits: ["Removes delays", "Success in endeavors", "Relationship harmony", "Spiritual progress"]
        },
        {
          id: 6,
          poojaName: "Pitru Dosha Parihara",
          description: "Ancestral worship rituals to resolve karmic debts and ancestral issues",
          price: 1500,
          displayOrder: 6,
          purpose: "For those experiencing ancestral karma effects",
          benefits: ["Ancestral blessings", "Family peace", "Removes obstacles", "Prosperity"]
        }
      ]

      const selectedService = pariharaServices.find(s => s.id === parseInt(serviceId!))
      setService(selectedService || null)
    } catch (error) {
      console.error('Error fetching service:', error)
      setService(null)
    } finally {
      clearTimeout(timeoutId)
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else {
      const cleanPhone = formData.phone.replace(/\D/g, '')
      if (cleanPhone.length === 10 && /^[6-9]/.test(cleanPhone)) {
      } else if (cleanPhone.length === 12 && cleanPhone.startsWith('91')) {
      } else if (cleanPhone.length === 11 && cleanPhone.startsWith('0')) {
      } else {
        newErrors.phone = 'Please enter a valid phone number (10-digit or with +91)'
      }
    }

  
    if (!formData.date) {
      newErrors.date = 'Please select a date'
    } else {
      const selectedDate = new Date(formData.date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.date = 'Cannot select past dates'
      }
    }

    if (!formData.timeSlot) {
      newErrors.timeSlot = 'Please select a time slot'
    }

    if (!formData.nakshatra) {
      newErrors.nakshatra = 'Please select your Nakshatra'
    }

    if (!formData.specificIssue.trim()) {
      newErrors.specificIssue = 'Please describe the specific issue you are facing'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Parihara form submitted:', formData)
    console.log('Service:', service)

    if (!validateForm()) {
      console.log('Form validation failed:', errors)
      return
    }

    if (!service) {
      console.error('Service not loaded')
      return
    }

    try {
      // Redirect to custom consultation payment page
      const paymentUrl = new URL('/consultation-payment', window.location.origin)
      paymentUrl.searchParams.set('type', 'parihara_pooja')
      paymentUrl.searchParams.set('serviceName', service.poojaName)
      paymentUrl.searchParams.set('serviceId', service.id.toString())
      paymentUrl.searchParams.set('name', formData.name)
      paymentUrl.searchParams.set('phone', formData.phone)

      // Add service details
      if (formData.date) paymentUrl.searchParams.set('preferredDate', formData.date)
      if (formData.timeSlot) paymentUrl.searchParams.set('preferredTime', formData.timeSlot)
      if (formData.nakshatra) paymentUrl.searchParams.set('nakshatra', formData.nakshatra)
      if (formData.gotra) paymentUrl.searchParams.set('gotra', formData.gotra)
      if (formData.specificIssue) paymentUrl.searchParams.set('specificIssue', formData.specificIssue)

      window.location.href = paymentUrl.toString()
    } catch (error) {
      console.error('Parihara booking error:', error)
      toast.error('Something went wrong. Please try again.')
    }
  }

  
  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-temple-cream via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="om-symbol text-3xl text-temple-maroon mb-4 animate-pulse">ॐ</div>
          <div className="w-10 h-10 border-4 border-temple-maroon border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Preparing your parihara booking form...</p>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-temple-cream via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Parihara service not found</p>
          <Link href="/parihara-pooja" className="text-temple-maroon hover:underline">
            Back to Parihara Services
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-temple-cream via-white to-red-50">
      <div className="container mx-auto px-3 sm:px-6 lg:px-8 max-w-4xl py-4 sm:py-6">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <Link
            href="/parihara-pooja"
            className="inline-flex items-center gap-2 text-temple-maroon hover:text-temple-gold transition-colors mb-3"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium text-sm sm:text-base">Back to Parihara Services</span>
          </Link>

          <div className="text-center">
            <div className="om-symbol text-2xl sm:text-3xl text-temple-maroon mb-2">
              ॐ
            </div>
            <h1 className="font-cinzel text-lg sm:text-2xl font-bold text-temple-maroon mb-1">
              Complete Your Parihara Booking
            </h1>
            <p className="text-gray-600 text-xs sm:text-sm">
              Fill in your details to book the {service.poojaName}
            </p>
          </div>
        </div>

        {/* Service Overview */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-4 sm:p-6 mb-6 border-2 border-red-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-cinzel text-lg font-bold text-temple-maroon">{service.poojaName}</h3>
              <p className="text-sm text-purple-700 font-medium">{service.purpose}</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mb-3">{service.description}</p>
          <div className="flex flex-wrap gap-2">
            {service.benefits.map((benefit, idx) => (
              <span key={idx} className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                ✓ {benefit}
              </span>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-temple-gold/20 p-4 sm:p-6">
            <h3 className="font-semibold text-temple-maroon mb-4">Personal Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your name"
                  />
                </div>
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter phone number (9876543210 or +919876543210)"
                    maxLength={15}
                  />
                </div>
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Star className="inline w-4 h-4 mr-1" />
                  Nakshatra (Birth Star) *
                </label>
                <select
                  value={formData.nakshatra}
                  onChange={(e) => handleInputChange('nakshatra', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent ${
                    errors.nakshatra ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your Nakshatra</option>
                  {NAKSHATRAS.map(nakshatra => (
                    <option key={nakshatra} value={nakshatra}>{nakshatra}</option>
                  ))}
                </select>
                {errors.nakshatra && <p className="text-red-500 text-xs mt-1">{errors.nakshatra}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <User className="inline w-4 h-4 mr-1" />
                  Gotra (Family Name)
                </label>
                <select
                  value={formData.gotra}
                  onChange={(e) => handleInputChange('gotra', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent ${
                    errors.gotra ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select your gotra</option>
                  {GOTRAS.map(gotra => (
                    <option key={gotra} value={gotra}>{gotra}</option>
                  ))}
                </select>
                {errors.gotra && <p className="text-red-500 text-xs mt-1">{errors.gotra}</p>}
              </div>
            </div>
          </div>

          {/* Parihara Details */}
          <div className="bg-white rounded-xl shadow-lg border-2 border-temple-gold/20 p-4 sm:p-6">
            <h3 className="font-semibold text-temple-maroon mb-4">Parihara Details</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Preferred Date *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Clock className="inline w-4 h-4 mr-1" />
                  Time Slot *
                </label>
                <select
                  value={formData.timeSlot}
                  onChange={(e) => handleInputChange('timeSlot', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent ${
                    errors.timeSlot ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select time slot</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
                {errors.timeSlot && <p className="text-red-500 text-xs mt-1">{errors.timeSlot}</p>}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Heart className="inline w-4 h-4 mr-1" />
                Specific Issue / Challenge *
              </label>
              <textarea
                value={formData.specificIssue}
                onChange={(e) => handleInputChange('specificIssue', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-temple-gold focus:border-transparent ${
                  errors.specificIssue ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={4}
                placeholder="Please describe the specific issue, challenge, or problem you are facing that this parihara pooja should address..."
              />
              {errors.specificIssue && <p className="text-red-500 text-xs mt-1">{errors.specificIssue}</p>}
            </div>
          </div>

          {/* Booking Summary */}
          <div className="mt-8 p-6 bg-purple-50 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <span className="text-lg font-semibold text-purple-800">Selected Parihara:</span>
              <span className="text-xl font-bold text-purple-600">
                {service.poojaName}
              </span>
            </div>

            <button
              type="submit"
              disabled={!formData.name || !formData.phone || !formData.date || !formData.timeSlot || !formData.nakshatra || !formData.specificIssue}
              className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Proceed to Payment
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function PariharaBookingFormPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-temple-cream via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="om-symbol text-3xl text-temple-maroon mb-4 animate-pulse">ॐ</div>
          <div className="w-10 h-10 border-4 border-temple-maroon border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">Loading...</p>
        </div>
      </div>
    }>
      <PariharaBookingFormPageContent />
    </Suspense>
  )
}