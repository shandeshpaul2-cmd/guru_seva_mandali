/**
 * Gallery utility functions for media handling
 */

import { MediaItem } from '@/shared/components/carousel/MediaCarousel'
import { QualityTier, getImageSize, getVideoBitrate } from '@/shared/hooks/useBandwidthDetection'

/**
 * Get the appropriate image source based on quality tier
 * @param src Original image source path
 * @param quality Quality tier (low, medium, high)
 * @returns Image path for the specified quality
 */
export function getImageSourceForQuality(src: string, quality: QualityTier): string {
  if (!src || quality === 'high') {
    return src
  }

  const lastDot = src.lastIndexOf('.')
  const basePath = src.substring(0, lastDot)
  const extension = src.substring(lastDot)
  const imageSize = getImageSize(quality)

  return `${basePath}-${imageSize}w${extension}`
}

/**
 * Get the appropriate video source based on quality tier
 * @param src Original video source path
 * @param quality Quality tier (low, medium, high)
 * @returns Video path for the specified quality
 */
export function getVideoSourceForQuality(src: string, quality: QualityTier): string {
  if (!src || quality === 'high') {
    return src
  }

  const lastDot = src.lastIndexOf('.')
  const basePath = src.substring(0, lastDot)
  const extension = src.substring(lastDot)
  const bitrate = getVideoBitrate(quality)

  return `${basePath}-${bitrate}${extension}`
}

/**
 * Filter media items by type
 * @param items Media items to filter
 * @param type Media type to filter by ('image' | 'video')
 * @returns Filtered media items
 */
export function filterMediaByType(
  items: MediaItem[],
  type: 'image' | 'video'
): MediaItem[] {
  return items.filter((item) => item.type === type)
}

/**
 * Sort media items by date (newest first)
 * @param items Media items to sort
 * @returns Sorted media items
 */
export function sortMediaByDate(items: MediaItem[]): MediaItem[] {
  return [...items].sort((a, b) => {
    if (!a.date || !b.date) return 0
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

/**
 * Generate srcset for responsive images
 * @param src Original image source
 * @returns Srcset string for use in img element
 */
export function generateImageSrcset(src: string): string {
  const lastDot = src.lastIndexOf('.')
  const basePath = src.substring(0, lastDot)
  const extension = src.substring(lastDot)

  return [
    `${basePath}-480w${extension} 480w`,
    `${basePath}-720w${extension} 720w`,
    `${basePath}-1080w${extension} 1080w`,
  ].join(', ')
}

/**
 * Parse date string to formatted string
 * @param dateStr Date string from metadata
 * @returns Formatted date string
 */
export function formatMediaDate(dateStr?: string): string {
  if (!dateStr) return ''

  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Check if media type is a video
 * @param mediaType Media type string
 * @returns True if media is a video
 */
export function isVideoMedia(mediaType: string): mediaType is 'video' {
  return mediaType === 'video'
}

/**
 * Check if media type is an image
 * @param mediaType Media type string
 * @returns True if media is an image
 */
export function isImageMedia(mediaType: string): mediaType is 'image' {
  return mediaType === 'image'
}

/**
 * Get file extension from path
 * @param path File path
 * @returns File extension with dot
 */
export function getFileExtension(path: string): string {
  const lastDot = path.lastIndexOf('.')
  return lastDot !== -1 ? path.substring(lastDot) : ''
}

/**
 * Get file name without extension
 * @param path File path
 * @returns File name without extension
 */
export function getFileName(path: string): string {
  const lastSlash = path.lastIndexOf('/')
  const name = lastSlash !== -1 ? path.substring(lastSlash + 1) : path
  const lastDot = name.lastIndexOf('.')
  return lastDot !== -1 ? name.substring(0, lastDot) : name
}

/**
 * Check if URL needs encoding
 * @param url URL to check
 * @returns True if URL contains special characters
 */
export function needsEncoding(url: string): boolean {
  return /[\s%<>[\]{}"|\\^`]/.test(url)
}

/**
 * Safely encode URL component if needed
 * @param url URL to encode
 * @returns Encoded or original URL
 */
export function safeEncodeUrl(url: string): string {
  if (needsEncoding(url)) {
    return encodeURIComponent(url)
  }
  return url
}
