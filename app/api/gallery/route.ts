import { readdirSync } from 'fs'
import { join } from 'path'

export async function GET() {
  try {
    const publicDir = join(process.cwd(), 'public')

    // Get images
    const imagesDir = join(publicDir, 'images')
    const imageFiles = readdirSync(imagesDir).filter((file) =>
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    )

    // Get videos
    const videosDir = join(publicDir, 'videos')
    const videoFiles = readdirSync(videosDir).filter((file) =>
      /\.(mp4|webm|mov|avi)$/i.test(file)
    )

    // Build gallery items
    const galleryItems = [
      ...imageFiles.map((file, index) => ({
        id: `img-${index}`,
        type: 'image' as const,
        src: `/images/${encodeURIComponent(file)}`,
        alt: file.replace(/\.[^/.]+$/, ''), // Remove extension
      })),
      ...videoFiles.map((file, index) => ({
        id: `vid-${index}`,
        type: 'video' as const,
        src: `/videos/${encodeURIComponent(file)}`,
        alt: file.replace(/\.[^/.]+$/, ''), // Remove extension
      })),
    ]

    return Response.json(galleryItems)
  } catch (error) {
    console.error('Error loading gallery files:', error)
    return Response.json([], { status: 500 })
  }
}
