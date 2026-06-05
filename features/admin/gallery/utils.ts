export const MAX_FILE_SIZE = 10 * 1024 * 1024
export const ACCEPTED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function validateFile(file: File): string | null {
  if (!ACCEPTED_MIME.includes(file.type)) {
    return 'Only JPG, PNG, WEBP, or GIF images are allowed.'
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File exceeds 10MB limit (${formatBytes(file.size)}).`
  }
  return null
}

export function generateBlurPlaceholder(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = 20
        canvas.height = Math.max(1, Math.round((20 * img.height) / img.width))
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          URL.revokeObjectURL(objectUrl)
          resolve('')
          return
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.5)
        URL.revokeObjectURL(objectUrl)
        resolve(dataUrl)
      } catch (err) {
        URL.revokeObjectURL(objectUrl)
        reject(err)
      }
    }
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      reject(new Error('Failed to load image'))
    }
    img.src = objectUrl
  })
}

export function readPreviewUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('Failed to read file'))
    reader.readAsDataURL(file)
  })
}
