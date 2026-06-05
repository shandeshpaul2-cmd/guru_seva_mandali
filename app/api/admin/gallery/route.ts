import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'
import {
  buildFullUrl,
  buildThumbnailUrl,
} from '../../../../lib/cloudinary'
import { galleryListQuerySchema } from '@/types/schemas/admin'

const createSchema = z.object({
  cloudinaryId: z.string().min(1),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  bytes: z.number().int().nonnegative(),
  format: z.string().min(1),
  blurPlaceholder: z.string().min(1),
  caption: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parsed = galleryListQuerySchema.safeParse(
      Object.fromEntries(searchParams)
    )

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.format() },
        { status: 400 }
      )
    }

    const items = await prisma.galleryItem.findMany({
      orderBy: [{ sortOrder: 'asc' }, { uploadedAt: 'desc' }],
    })

    const enriched = items.map((item) => ({
      ...item,
      thumbnailUrl: buildThumbnailUrl(item.cloudinaryId),
      fullUrl: buildFullUrl(item.cloudinaryId),
    }))

    return NextResponse.json(enriched)
  } catch (error) {
    console.error('[admin/gallery] GET failed:', error)
    return NextResponse.json(
      { error: 'Failed to fetch gallery items' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = createSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const maxSort = await prisma.galleryItem.aggregate({
      _max: { sortOrder: true },
    })
    const nextSortOrder = (maxSort._max.sortOrder ?? -1) + 1

    const item = await prisma.galleryItem.create({
      data: {
        cloudinaryId: parsed.data.cloudinaryId,
        width: parsed.data.width,
        height: parsed.data.height,
        bytes: parsed.data.bytes,
        format: parsed.data.format,
        blurPlaceholder: parsed.data.blurPlaceholder,
        caption: parsed.data.caption ?? null,
        sortOrder: nextSortOrder,
      },
    })

    return NextResponse.json({
      ...item,
      thumbnailUrl: buildThumbnailUrl(item.cloudinaryId),
      fullUrl: buildFullUrl(item.cloudinaryId),
    })
  } catch (error) {
    console.error('[admin/gallery] POST failed:', error)
    return NextResponse.json(
      { error: 'Failed to create gallery item' },
      { status: 500 }
    )
  }
}
