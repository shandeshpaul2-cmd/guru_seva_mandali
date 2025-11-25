'use client'

import { MapPin, Navigation, Phone, Clock } from 'lucide-react'
import { useLanguage } from '@/shared/contexts/contexts/LanguageContext'

export function LocationCard() {
  const { t } = useLanguage()
  const googleMapsLink = 'https://maps.app.goo.gl/fbso1qvzNyBAzFio6?g_st=aw'

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className="font-cinzel text-lg font-semibold text-temple-maroon mb-1">
          Visit Our Temple
        </h3>
        <p className="text-gray-600 text-sm">
          Experience the divine presence in person
        </p>
      </div>

      {/* Location Card */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="p-6 space-y-6">
          {/* Address */}
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="w-12 h-12 bg-temple-gold/10 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-temple-maroon" />
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-temple-maroon mb-1">
                {t.templeName}
              </h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {t.address}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href={googleMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-4 py-4 bg-temple-maroon text-white rounded-lg text-sm font-semibold hover:bg-temple-maroon/90 transition-colors shadow-md hover:shadow-lg"
            >
              <Navigation className="w-5 h-5" />
              <span>Get Directions</span>
            </a>

            <a
              href="tel:+919902820105"
              className="flex items-center justify-center gap-2 px-4 py-4 bg-temple-gold text-temple-maroon rounded-lg text-sm font-semibold hover:bg-temple-gold/90 transition-colors shadow-md hover:shadow-lg"
            >
              <Phone className="w-5 h-5" />
              <span>Call Now</span>
            </a>
          </div>

          {/* Temple Timings */}
          <div className="bg-temple-cream/30 rounded-lg p-4 border border-temple-gold/20">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-temple-maroon" />
              <p className="font-semibold text-temple-maroon text-sm">
                Temple Timings
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <p className="font-medium text-temple-maroon mb-1">Morning</p>
                <p className="text-gray-700">6:00 AM - 12:00 PM</p>
              </div>
              <div className="text-center">
                <p className="font-medium text-temple-maroon mb-1">Evening</p>
                <p className="text-gray-700">4:00 PM - 8:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}