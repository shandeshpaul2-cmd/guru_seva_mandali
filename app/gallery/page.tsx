'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { MediaCarousel, MediaItem } from '@/shared/components/carousel/MediaCarousel'

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const res = await fetch('/api/gallery')
        const data = await res.json()
        setGalleryItems(data)
      } catch (error) {
        console.error('Failed to load gallery:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchGallery()
  }, [])

  return (
    <div className="min-h-screen bg-temple-cream">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
            title="Back to home"
          >
            <ArrowLeft className="w-6 h-6 text-temple-maroon" />
          </Link>
          <div>
            <h1 className="font-cinzel text-3xl sm:text-4xl font-bold text-temple-maroon">
              Gallery
            </h1>
            <p className="text-gray-600 mt-1">
              Moments from our temple and community
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <div className="h-px flex-1 bg-temple-gold"></div>
          <div className="text-temple-gold text-lg">●</div>
          <div className="h-px flex-1 bg-temple-gold"></div>
        </div>

        {/* Media Carousel */}
        {!isLoading && (
          <MediaCarousel
            items={galleryItems}
            title="Our Moments"
            itemWidth="w-80"
            itemHeight="h-64"
          />
        )}

        {/* Info Section */}
        <div className="mt-16 bg-white rounded-xl p-8 border border-temple-gold/20">
          <h2 className="font-cinzel text-2xl font-bold text-temple-maroon mb-4">
            Explore Our Heritage
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Sri Raghavendra Brindavana Sannidhi is a sacred place of worship and spiritual
            learning. Our gallery showcases the beauty of our temple, the dedication of our
            community, and the spiritual moments that make our temple special.
          </p>
          <p className="text-gray-600">
            Click on any video to play it in full screen. Scroll through to see more moments
            from our temple life and community celebrations.
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center border-t border-gray-200 pt-8">
          <Link
            href="/"
            className="inline-block px-6 py-2 bg-temple-maroon text-white rounded-lg hover:bg-temple-maroon/80 transition-colors font-medium"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
