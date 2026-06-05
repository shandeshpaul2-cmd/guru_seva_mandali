import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export const CLOUDINARY_UPLOAD_FOLDER = 'temple/gallery'

function getCloudName(): string {
  const name =
    process.env.CLOUDINARY_CLOUD_NAME ||
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  if (!name) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not configured')
  }
  return name
}

function buildUrl(publicId: string, transformation: string): string {
  return `https://res.cloudinary.com/${getCloudName()}/image/upload/${transformation}/${publicId}`
}

export function buildThumbnailUrl(publicId: string): string {
  return buildUrl(publicId, 'c_fill,w_400,h_300,f_auto,q_auto,fl_strip_profile')
}

export function buildFullUrl(publicId: string): string {
  return buildUrl(publicId, 'c_limit,w_1600,f_auto,q_auto,fl_strip_profile')
}

export function buildBlurDataUrl(publicId: string): string {
  return buildUrl(publicId, 'w_20,e_blur:1000,f_auto,q_auto')
}

export function signUploadParams(
  params: Record<string, string | number>
): string {
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!apiSecret) {
    throw new Error('CLOUDINARY_API_SECRET is not configured')
  }
  return cloudinary.utils.api_sign_request(params, apiSecret)
}

export async function deleteAsset(publicId: string): Promise<{ result: string }> {
  return cloudinary.uploader.destroy(publicId, { invalidate: true })
}

export { cloudinary }
