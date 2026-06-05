import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/prisma'

const reorderSchema = z.object({
  ids: z.array(z.string().min(1)),
})

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = reorderSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: parsed.error.flatten() },
        { status: 400 }
      )
    }

    const { ids } = parsed.data

    await prisma.$transaction(
      ids.map((id, index) =>
        prisma.galleryItem.update({
          where: { id },
          data: { sortOrder: index },
        })
      )
    )

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error reordering gallery items:', error)
    return NextResponse.json(
      { error: 'Failed to reorder gallery items' },
      { status: 500 }
    )
  }
}
