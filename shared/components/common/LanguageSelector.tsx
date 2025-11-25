'use client'

import { useState } from 'react'
import { Globe } from 'lucide-react'
import { useLanguage } from '@/shared/contexts/contexts/LanguageContext'
import { Language } from '@/shared/lib/translations'

interface LanguageOption {
  code: Language
  name: string
  nativeName: string
}

const languages: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी' },
]

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find(lang => lang.code === language)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/90 backdrop-blur-sm border-2 border-temple-gold/30 hover:border-temple-gold hover:bg-white transition-all duration-300 shadow-md"
      >
        <Globe className="w-4 h-4 text-temple-maroon" />
        <span className="font-medium text-temple-maroon text-sm">{currentLanguage?.nativeName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-44 bg-white rounded-xl shadow-2xl border-2 border-temple-gold/20 overflow-hidden z-20">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-4 py-3 text-left transition-colors flex items-center justify-between
                  ${language === lang.code
                    ? 'bg-temple-gold/10 text-temple-maroon font-semibold'
                    : 'hover:bg-temple-cream text-gray-700'
                  }
                `}
              >
                <span className="text-sm">{lang.nativeName}</span>
                {language === lang.code && (
                  <span className="text-temple-gold">✓</span>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
