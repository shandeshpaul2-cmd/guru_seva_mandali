import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'
import {
  buildFullUrl,
  buildThumbnailUrl,
} from '../../../lib/cloudinary'

function getFormatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export async function GET() {
  try {
    const items = await prisma.galleryItem.findMany({
      where: { isPublished: true },
      orderBy: [{ sortOrder: 'asc' }, { uploadedAt: 'desc' }],
    })

    const mediaItems = items.map((item) => ({
      id: item.id,
      src: buildFullUrl(item.cloudinaryId),
      type: 'image' as const,
      alt: item.caption || '',
      thumbnail: buildThumbnailUrl(item.cloudinaryId),
      date: getFormatDate(item.uploadedAt),
    }))

    return NextResponse.json(mediaItems)
  } catch (error) {
    console.error('Error loading gallery items:', error)
    return NextResponse.json([], { status: 500 })
  }
}
