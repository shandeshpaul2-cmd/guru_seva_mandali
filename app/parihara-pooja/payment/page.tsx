'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function PariharaPoojaPaymentPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to main Parihari Pooja page since payment is now handled there
    router.replace('/parihara-pooja')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-temple-cream via-white to-red-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-temple-maroon border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Redirecting to booking page...</p>
      </div>
    </div>
  )
}