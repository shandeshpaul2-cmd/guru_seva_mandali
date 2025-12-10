'use client'

import { useRef, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageCarouselProps {
  images: string[]
  title?: string
  imageWidth?: string
  imageHeight?: string
}

export function ImageCarousel({
  images,
  title,
  imageWidth = 'w-64',
  imageHeight = 'h-64',
}: ImageCarouselProps) {
  const carouselRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 300
      const scrollValue = direction === 'left' ? -scrollAmount : scrollAmount
      carouselRef.current.scrollBy({ left: scrollValue, behavior: 'smooth' })
    }
  }

  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      // Clear any pending reset
      clearTimeout(scrollTimeout)

      // Wait for smooth scroll animation to complete before checking
      scrollTimeout = setTimeout(() => {
        const scrollWidth = carousel.scrollWidth
        const scrollLeft = carousel.scrollLeft
        const clientWidth = carousel.clientWidth

        // Check if we've scrolled to near the end
        if (scrollLeft + clientWidth >= scrollWidth - 20) {
          carousel.scrollLeft = 0
        }
        // Check if we've scrolled to near the start (from left arrow)
        else if (scrollLeft <= 20) {
          carousel.scrollLeft = scrollWidth - clientWidth
        }
      }, 800) // Wait for smooth scroll animation to finish
    }

    carousel.addEventListener('scroll', handleScroll)
    return () => {
      clearTimeout(scrollTimeout)
      carousel.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <div className="mb-12">
      {title && (
        <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-temple-maroon text-center mb-8">
          {title}
        </h2>
      )}

      <div className="relative flex items-center justify-center gap-4">
        {/* Left Navigation Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 z-10 p-2 bg-temple-maroon hover:bg-temple-maroon/80 text-white rounded-full transition-colors shadow-lg"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Carousel Container */}
        <div
          ref={carouselRef}
          className="flex gap-4 overflow-x-auto scroll-smooth px-12 py-4 max-w-4xl mx-auto"
          style={{ scrollBehavior: 'smooth' }}
        >
          {images.map((image, index) => (
            <div
              key={index}
              className={`${imageWidth} ${imageHeight} flex-shrink-0 rounded-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer border-2 border-temple-gold/30`}
            >
              <img
                src={image}
                alt={`Gallery image ${index + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
          ))}
        </div>

        {/* Right Navigation Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 z-10 p-2 bg-temple-maroon hover:bg-temple-maroon/80 text-white rounded-full transition-colors shadow-lg"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
