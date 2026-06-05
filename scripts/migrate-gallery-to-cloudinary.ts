// Run: npx tsx scripts/migrate-gallery-to-cloudinary.ts
import 'dotenv/config'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '../lib/prisma'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const IMAGES_DIR = path.join(process.cwd(), 'public', 'images')
const CLOUDINARY_FOLDER = 'temple/gallery'
const IMAGE_EXT_RE = /\.(jpg|jpeg|png|gif|webp)$/i
const QUALITY_VARIANT_RE = /-(480w|720w|1080w)\./i

const naturalCompare = (a: string, b: string): number =>
  a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })

async function fetchBlurPlaceholder(publicId: string, format: string): Promise<string> {
  const url = cloudinary.url(publicId, {
    transformation: [{ width: 20, effect: 'blur:1000', quality: 'auto', fetch_format: 'jpg' }],
    secure: true,
  })
  const res = await fetch(url)
  if (!res.ok) throw new Error(`blur fetch failed: ${res.status} ${res.statusText}`)
  const buf = Buffer.from(await res.arrayBuffer())
  return `data:image/jpeg;base64,${buf.toString('base64')}`
}

async function main() {
  const allFiles = readdirSync(IMAGES_DIR)
  const files = allFiles
    .filter((f) => IMAGE_EXT_RE.test(f) && !QUALITY_VARIANT_RE.test(f))
    .sort(naturalCompare)

  console.log(`Found ${files.length} candidate image(s) in ${IMAGES_DIR}`)

  let migrated = 0
  let skipped = 0
  let failed = 0

  for (let i = 0; i < files.length; i++) {
    const filename = files[i]
    const filepath = path.join(IMAGES_DIR, filename)
    const baseName = filename.replace(IMAGE_EXT_RE, '')
    const expectedPublicId = `${CLOUDINARY_FOLDER}/${baseName}`

    try {
      const existing = await prisma.galleryItem.findUnique({
        where: { cloudinaryId: expectedPublicId },
      })
      if (existing) {
        console.log(`[skip] ${filename} already migrated`)
        skipped++
        continue
      }

      const upload = await cloudinary.uploader.upload(filepath, {
        folder: CLOUDINARY_FOLDER,
        public_id: baseName,
        transformation: [{ width: 2400, height: 2400, crop: 'limit', quality: 'auto:good' }],
        overwrite: false,
        resource_type: 'image',
      })

      const blurPlaceholder = await fetchBlurPlaceholder(upload.public_id, upload.format)

      await prisma.galleryItem.create({
        data: {
          cloudinaryId: upload.public_id,
          width: upload.width,
          height: upload.height,
          bytes: upload.bytes,
          format: upload.format,
          blurPlaceholder,
          caption: null,
          sortOrder: i,
          isPublished: true,
        },
      })

      const kb = Math.round(upload.bytes / 1024)
      console.log(`[ok] ${filename} → ${upload.public_id} (${upload.width}x${upload.height}, ${kb}KB)`)
      migrated++
    } catch (err) {
      failed++
      const msg = err instanceof Error ? err.message : String(err)
      console.error(`[fail] ${filename}: ${msg}`)
    }
  }

  console.log(`\nMigrated ${migrated} images, skipped ${skipped}, failed ${failed}`)
}

main()
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
