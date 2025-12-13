'use client'

import { useEffect, useState } from 'react'

export type QualityTier = 'low' | 'medium' | 'high'

interface ConnectionInfo extends EventTarget {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  downlink?: number
  rtt?: number
  saveData?: boolean
}

export function useBandwidthDetection() {
  const [quality, setQuality] = useState<QualityTier>('high')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setIsLoading(true)

    // Check if navigator.connection is available
    const nav = navigator as any
    const connection: ConnectionInfo = nav.connection || nav.webkitConnection

    if (!connection) {
      // Default to medium quality if connection info not available
      setQuality('medium')
      setIsLoading(false)
      return
    }

    const determineQuality = () => {
      // Respect data saver preference
      if (connection.saveData) {
        setQuality('low')
        return
      }

      const effectiveType = connection.effectiveType
      const downlink = connection.downlink

      // Use effective connection type as primary indicator
      switch (effectiveType) {
        case 'slow-2g':
        case '2g':
          setQuality('low')
          break
        case '3g':
          // Check downlink speed if available
          if (downlink && downlink < 1) {
            setQuality('low')
          } else {
            setQuality('medium')
          }
          break
        case '4g':
          // Check if it's high-speed 4g/5g
          if (downlink && downlink > 3) {
            setQuality('high')
          } else if (downlink && downlink > 1) {
            setQuality('medium')
          } else {
            setQuality('medium')
          }
          break
        default:
          setQuality('high')
      }
    }

    determineQuality()

    // Listen for connection changes
    const handleChange = () => {
      determineQuality()
    }

    connection.addEventListener('change', handleChange)

    setIsLoading(false)

    return () => {
      connection.removeEventListener('change', handleChange)
    }
  }, [])

  return { quality, isLoading }
}

// Helper to get image size based on quality
export function getImageSize(quality: QualityTier): number {
  switch (quality) {
    case 'low':
      return 480
    case 'medium':
      return 720
    case 'high':
      return 1080
    default:
      return 1080
  }
}

// Helper to get video bitrate based on quality
export function getVideoBitrate(quality: QualityTier): string {
  switch (quality) {
    case 'low':
      return '360p'
    case 'medium':
      return '720p'
    case 'high':
      return '1080p'
    default:
      return '1080p'
  }
}
