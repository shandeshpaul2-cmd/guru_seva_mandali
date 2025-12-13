import { readdirSync, statSync } from 'fs'
import { join } from 'path'

function getFormatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export async function GET() {
  try {
    const publicDir = join(process.cwd(), 'public')

    // Get images (filter out quality variants)
    const imagesDir = join(publicDir, 'images')
    const imageFiles = readdirSync(imagesDir)
      .filter((file) => {
        // Only include original files, not quality variants
        return (
          /\.(jpg|jpeg|png|gif|webp)$/i.test(file) &&
          !file.includes('-480w') &&
          !file.includes('-720w') &&
          !file.includes('-1080w')
        )
      })
      .sort()

    // Get videos (filter out quality variants)
    const videosDir = join(publicDir, 'videos')
    const videoFiles = readdirSync(videosDir)
      .filter((file) => {
        // Only include original files, not quality variants
        return (
          /\.(mp4|webm|mov|avi)$/i.test(file) &&
          !file.includes('-360p') &&
          !file.includes('-720p') &&
          !file.includes('-1080p')
        )
      })
      .sort()

    // Build gallery items with dates
    const galleryItems = [
      ...imageFiles.map((file, index) => {
        const filePath = join(imagesDir, file)
        const stats = statSync(filePath)
        const date = getFormatDate(new Date(stats.birthtime || stats.mtime))

        return {
          id: `img-${index}`,
          type: 'image' as const,
          src: `/images/${encodeURIComponent(file)}`,
          alt: file.replace(/\.[^/.]+$/, ''),
          date,
        }
      }),
      ...videoFiles.map((file, index) => {
        const filePath = join(videosDir, file)
        const stats = statSync(filePath)
        const date = getFormatDate(new Date(stats.birthtime || stats.mtime))

        return {
          id: `vid-${index}`,
          type: 'video' as const,
          src: `/videos/${encodeURIComponent(file)}`,
          alt: file.replace(/\.[^/.]+$/, ''),
          date,
        }
      }),
    ]

    return Response.json(galleryItems)
  } catch (error) {
    console.error('Error loading gallery files:', error)
    return Response.json([], { status: 500 })
  }
}
