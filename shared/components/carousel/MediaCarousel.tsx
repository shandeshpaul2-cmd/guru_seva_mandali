'use client'

import { useRef, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, Play, X, Maximize2, Minimize2 } from 'lucide-react'
import { ResponsiveImage } from '../gallery/ResponsiveImage'
import { AdaptiveVideo } from '../gallery/AdaptiveVideo'

export interface MediaItem {
  id: string
  src: string
  type: 'image' | 'video'
  alt: string
  thumbnail?: string
  date?: string
}

interface MediaCarouselProps {
  items: MediaItem[]
  title?: string
  itemWidth?: string
  itemHeight?: string
}

export function MediaCarousel({
  items,
  title,
  itemWidth = 'w-80',
  itemHeight = 'h-64',
}: MediaCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [selectedIndex, setSelectedIndex] = useState<number>(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [touchStart, setTouchStart] = useState<number>(0)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint in Tailwind
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320
      const scrollValue = direction === 'left' ? -scrollAmount : scrollAmount
      carouselRef.current.scrollBy({ left: scrollValue, behavior: 'smooth' })
    }
  }

  const openMediaModal = (item: MediaItem, index: number) => {
    setSelectedMedia(item)
    setSelectedIndex(index)
  }

  const navigateMedia = (direction: 'prev' | 'next') => {
    if (!selectedMedia) return

    let newIndex = selectedIndex
    if (direction === 'next') {
      newIndex = (selectedIndex + 1) % items.length
    } else {
      newIndex = (selectedIndex - 1 + items.length) % items.length
    }

    setSelectedIndex(newIndex)
    setSelectedMedia(items[newIndex])
  }

  // Keyboard navigation
  useEffect(() => {
    if (!selectedMedia) return

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') navigateMedia('next')
      if (e.key === 'ArrowLeft') navigateMedia('prev')
      if (e.key === 'Escape') setSelectedMedia(null)
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [selectedMedia, selectedIndex])

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        scroll('right')
      } else {
        scroll('left')
      }
    }
  }

  return (
    <>
      <div className="mb-12">
        {title && (
          <h2 className="font-cinzel text-2xl sm:text-3xl font-bold text-temple-maroon text-center mb-8">
            {title}
          </h2>
        )}

        {/* Carousel Header with Expand Button */}
        <div className="flex justify-end mb-4 px-4 sm:px-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 bg-temple-maroon hover:bg-temple-maroon/80 text-white rounded-lg transition-colors shadow-md hover:shadow-lg active:scale-95"
            title={isExpanded ? 'Collapse' : 'Expand Gallery'}
          >
            {isExpanded ? (
              <Minimize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </div>

        <div
          ref={containerRef}
          className={`relative flex items-center justify-center gap-4 transition-all duration-300 ${
            isExpanded ? 'fixed inset-0 z-40 bg-temple-cream p-4 sm:p-6 flex flex-col' : ''
          }`}
        >
          {/* Left Navigation Button - Hidden in Expanded View */}
          {!isExpanded && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-0 sm:left-1 z-10 p-1.5 sm:p-2 bg-temple-maroon hover:bg-temple-maroon/80 text-white rounded-full transition-colors shadow-lg hover:shadow-xl active:scale-95"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}

          {/* Carousel Container */}
          <div
            ref={carouselRef}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className={`scroll-smooth mx-auto ${
              isExpanded
                ? `grid gap-4 w-full px-4 sm:px-6 overflow-y-auto max-h-[80vh] ${
                    isMobile ? 'grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'
                  }`
                : `flex gap-4 sm:gap-6 overflow-x-auto px-4 sm:px-6 md:px-14 py-4 max-w-6xl`
            }`}
            style={{ scrollBehavior: 'smooth' }}
          >
            {items.map((item, index) => (
              <div
                key={item.id}
                onClick={() => openMediaModal(item, index)}
                className={`${
                  !isExpanded
                    ? 'w-56 sm:w-72 flex-shrink-0'
                    : 'w-full'
                } ${
                  !isExpanded ? 'h-44 sm:h-56' : 'h-56 sm:h-64'
                } rounded-xl overflow-hidden cursor-pointer group relative bg-gray-100 transition-transform hover:scale-105`}
              >
                {/* Media Content */}
                {item.type === 'image' ? (
                  <ResponsiveImage
                    src={item.src}
                    alt={item.alt}
                    date={item.date}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <>
                    <video
                      src={item.src}
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    {/* Play Button Overlay */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300 flex items-center justify-center">
                      <div className="bg-white/90 group-hover:bg-white transition-colors rounded-full p-3 shadow-lg">
                        <Play className="w-8 h-8 text-temple-maroon fill-temple-maroon" />
                      </div>
                    </div>
                  </>
                )}

                {/* Border and Shadow */}
                <div className="absolute inset-0 border-2 border-temple-gold/20 group-hover:border-temple-gold/50 rounded-xl transition-colors pointer-events-none" />
              </div>
            ))}
          </div>

          {/* Right Navigation Button - Hidden in Expanded View */}
          {!isExpanded && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-0 sm:right-1 z-10 p-1.5 sm:p-2 bg-temple-maroon hover:bg-temple-maroon/80 text-white rounded-full transition-colors shadow-lg hover:shadow-xl active:scale-95"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Image/Video Modal */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4"
          onClick={() => setSelectedMedia(null)}
        >
          <div
            className="relative w-full max-w-2xl sm:max-w-4xl bg-black rounded-lg sm:rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Main Media Display */}
            {selectedMedia.type === 'image' ? (
              <ResponsiveImage
                src={selectedMedia.src}
                alt={selectedMedia.alt}
                date={selectedMedia.date}
                className="w-full h-auto max-h-[80vh] object-contain"
                priority={true}
              />
            ) : (
              <AdaptiveVideo
                src={selectedMedia.src}
                date={selectedMedia.date}
                className="w-full h-auto max-h-[80vh]"
                controls={true}
                autoPlay={true}
              />
            )}

            {/* Close Button */}
            <button
              onClick={() => setSelectedMedia(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-white/90 hover:bg-white text-black rounded-full p-1.5 sm:p-2 transition-colors shadow-lg active:scale-95"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            {/* Navigation Arrows */}
            {items.length > 1 && (
              <>
                <button
                  onClick={() => navigateMedia('prev')}
                  className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-1.5 sm:p-2 transition-colors shadow-lg active:scale-95"
                  aria-label="Previous"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={() => navigateMedia('next')}
                  className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-black rounded-full p-1.5 sm:p-2 transition-colors shadow-lg active:scale-95"
                  aria-label="Next"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}

            {/* Counter */}
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
              {selectedIndex + 1} / {items.length}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
