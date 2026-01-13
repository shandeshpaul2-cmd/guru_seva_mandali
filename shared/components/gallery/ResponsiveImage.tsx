'use client'

import { useState } from 'react'

interface ResponsiveImageProps {
  src: string
  alt: string
  date?: string
  className?: string
  priority?: boolean
  onLoad?: () => void
}

export function ResponsiveImage({
  src,
  alt,
  date,
  className = 'w-full h-full object-cover',
  priority = false,
  onLoad,
}: ResponsiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  return (
    <div className="relative w-full h-full">
      <img
        src={src}
        alt={alt}
        className={`${className} ${!isLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        loading={priority ? 'eager' : 'lazy'}
        onLoad={handleLoad}
        decoding="async"
      />

      {/* Loading placeholder */}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
      )}
    </div>
  )
}
