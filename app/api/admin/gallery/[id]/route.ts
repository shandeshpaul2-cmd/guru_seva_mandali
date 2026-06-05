import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/prisma'
import {
  buildFullUrl,
  buildThumbnailUrl,
  deleteAsset,
} from '../../../../../lib/cloudinary'

const updateSchema = z.object({
  caption: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
})

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const parsed = updateSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const item = await prisma.galleryItem.update({
      where: { id },
      data: parsed.data,
    })

    return NextResponse.json({
      ...item,
      thumbnailUrl: buildThumbnailUrl(item.cloudinaryId),
      fullUrl: buildFullUrl(item.cloudinaryId),
    })
  } catch (error) {
    console.error('[admin/gallery/:id] PATCH failed:', error)
    return NextResponse.json(
      { error: 'Failed to update gallery item' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params

    const item = await prisma.galleryItem.findUnique({ where: { id } })
    if (!item) {
      return NextResponse.json(
        { error: 'Gallery item not found' },
        { status: 404 }
      )
    }

    try {
      await deleteAsset(item.cloudinaryId)
    } catch (cloudinaryError) {
      console.error(
        '[admin/gallery/:id] Cloudinary delete failed (continuing with DB delete):',
        cloudinaryError
      )
    }

    await prisma.galleryItem.delete({ where: { id } })

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[admin/gallery/:id] DELETE failed:', error)
    return NextResponse.json(
      { error: 'Failed to delete gallery item' },
      { status: 500 }
    )
  }
}
