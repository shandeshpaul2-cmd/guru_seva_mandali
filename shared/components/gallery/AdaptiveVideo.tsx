'use client'

import { useRef } from 'react'

interface AdaptiveVideoProps {
  src: string
  date?: string
  className?: string
  preload?: 'none' | 'metadata' | 'auto'
  controls?: boolean
  autoPlay?: boolean
}

export function AdaptiveVideo({
  src,
  date,
  className = 'w-full h-full object-cover',
  preload = 'metadata',
  controls = true,
  autoPlay = false,
}: AdaptiveVideoProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  return (
    <div ref={containerRef} className="relative w-full h-full group">
      <video
        ref={videoRef}
        src={src}
        className={className}
        preload={preload}
        controls={controls}
        autoPlay={autoPlay}
      />

      {/* Date Overlay */}
      {date && (
        <div className="absolute bottom-12 sm:bottom-14 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent px-3 py-2 pointer-events-none">
          <p className="text-white text-xs sm:text-sm font-semibold">{date}</p>
        </div>
      )}
    </div>
  )
}
