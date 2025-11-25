'use client'

import Link from 'next/link'
import { LanguageSelector } from '@/shared/components/common/LanguageSelector'
import { LocationCard } from '@/shared/components/common/LocationCard'
import { ArrowRight, Phone, MapPin, Heart, Calendar, Star, Sun } from 'lucide-react'
import { useLanguage } from '@/shared/contexts/contexts/LanguageContext'

export default function Home() {
  const { t } = useLanguage()

  return (
    <div className="min-h-screen bg-temple-cream">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex justify-between items-center py-6">
          <Link
            href="/admin/login"
            className="w-8 h-8 flex items-center justify-center text-gray-600 hover:text-temple-maroon transition-colors border border-gray-300 hover:border-temple-maroon rounded"
            title="Admin"
          >
            <div className="w-3 h-3 border border-current rounded-full"></div>
          </Link>
          <LanguageSelector />
        </div>

        {/* Hero Section */}
        <header className="text-center py-8">
          {/* Logo */}
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

          {/* Title */}
          <div className="mb-6">
            <h1 className="font-cinzel text-2xl sm:text-3xl font-bold text-temple-maroon mb-2">
              {t.templeDeity}
            </h1>
            <p className="text-lg sm:text-xl text-temple-gold font-medium mb-1">
              {t.templeName}
            </p>
            <p className="text-sm sm:text-base text-gray-600">
              {t.templeSubtitle}
            </p>
          </div>

          {/* Address */}
          <div className="flex items-center justify-center gap-2 text-gray-600 text-sm mb-4">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span>{t.address}</span>
          </div>

          {/* Divider */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="h-px w-12 bg-temple-gold"></div>
            <div className="text-temple-gold text-sm">●</div>
            <div className="h-px w-12 bg-temple-gold"></div>
          </div>
        </header>

        {/* Services */}
        <main className="py-6">
          <div className="text-center mb-8">
            <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-temple-maroon mb-2">
              {t.ourServices}
            </h2>
            <p className="text-gray-600 text-sm">{t.chooseService}</p>
          </div>

          {/* Service Grid */}
          <div className="grid grid-cols-2 gap-4 max-w-xl mx-auto mb-12">
            {/* Donation */}
            <Link href="/donate" className="group">
              <div className="h-full p-4 bg-white border border-gray-200 rounded-lg hover:border-temple-gold hover:shadow-md transition-all">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-10 h-10 bg-temple-maroon rounded-full flex items-center justify-center">
                    <Heart className="w-4 h-4 text-white" fill="white" />
                  </div>
                  <h3 className="font-cinzel text-sm font-bold text-temple-maroon">
                    {t.donation}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {t.donationDesc}
                  </p>
                  <div className="flex items-center gap-1 text-temple-maroon text-xs font-medium">
                    <span>{t.makeDonation}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Pooja Booking */}
            <Link href="/book-pooja" className="group">
              <div className="h-full p-4 bg-white border border-gray-200 rounded-lg hover:border-temple-gold hover:shadow-md transition-all">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-10 h-10 bg-temple-maroon rounded-full flex items-center justify-center">
                    <Calendar className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-cinzel text-sm font-bold text-temple-maroon">
                    {t.bookPooja}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {t.bookPoojaDesc}
                  </p>
                  <div className="flex items-center gap-1 text-temple-maroon text-xs font-medium">
                    <span>{t.bookAPuja}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Astrology */}
            <Link href="/astrology-consultation" className="group">
              <div className="h-full p-4 bg-white border border-gray-200 rounded-lg hover:border-temple-gold hover:shadow-md transition-all">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-10 h-10 bg-temple-maroon rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-cinzel text-sm font-bold text-temple-maroon">
                    {t.astrology}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {t.astrologyDesc}
                  </p>
                  <div className="flex items-center gap-1 text-temple-maroon text-xs font-medium">
                    <span>{t.consultNow}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>

            {/* Parihara Pooja */}
            <Link href="/parihara-pooja" className="group">
              <div className="h-full p-4 bg-white border border-gray-200 rounded-lg hover:border-temple-gold hover:shadow-md transition-all">
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="w-10 h-10 bg-temple-maroon rounded-full flex items-center justify-center">
                    <Sun className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="font-cinzel text-sm font-bold text-temple-maroon">
                    {t.pariharaPoojaShort}
                  </h3>
                  <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                    {t.pariharaPoojaShortDesc}
                  </p>
                  <div className="flex items-center gap-1 text-temple-maroon text-xs font-medium">
                    <span>{t.bookParihara}</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Location Section */}
          <div className="mb-12">
            <LocationCard />
          </div>
        </main>

        {/* Contact Section */}
        <div className="py-8">
          <div className="max-w-lg mx-auto text-center">
            <h3 className="font-cinzel text-lg font-semibold text-temple-maroon mb-4">
              Contact Us
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <a href="tel:+919902820105" className="flex items-center gap-2 text-temple-maroon hover:text-temple-gold transition-colors">
                <Phone className="w-4 h-4" />
                <span>99028 20105</span>
              </a>
              <a href="tel:+917019337306" className="flex items-center gap-2 text-temple-maroon hover:text-temple-gold transition-colors">
                <Phone className="w-4 h-4" />
                <span>70193 37306</span>
              </a>
            </div>
            <p className="text-gray-600 text-sm mt-2">
              Halasuru, Bangalore
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}