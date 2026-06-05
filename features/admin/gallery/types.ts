export interface GalleryItem {
  id: string
  cloudinaryId: string
  width: number
  height: number
  bytes: number
  format: string
  blurPlaceholder: string | null
  caption: string | null
  sortOrder: number
  isPublished: boolean
  uploadedAt: string
  thumbnailUrl: string
  fullUrl: string
}

export interface SignResponse {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
  folder: string
  transformation: string
}

export type UploadStatus = 'pending' | 'uploading' | 'saving' | 'success' | 'error'

export interface UploadJob {
  id: string
  file: File
  previewUrl: string
  progress: number
  status: UploadStatus
  errorMessage?: string
  savedItem?: GalleryItem
}

export type LibraryFilter = 'all' | 'published' | 'hidden'
