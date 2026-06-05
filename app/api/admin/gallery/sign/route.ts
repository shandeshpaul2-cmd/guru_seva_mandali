import { NextResponse } from 'next/server'
import {
  CLOUDINARY_UPLOAD_FOLDER,
  signUploadParams,
} from '../../../../../lib/cloudinary'

const UPLOAD_TRANSFORMATION = 'c_limit,w_2400,h_2400,q_auto:good'

export async function POST() {
  try {
    const timestamp = Math.round(Date.now() / 1000)
    const paramsToSign = {
      timestamp,
      folder: CLOUDINARY_UPLOAD_FOLDER,
      transformation: UPLOAD_TRANSFORMATION,
    }

    const signature = signUploadParams(paramsToSign)

    return NextResponse.json({
      signature,
      timestamp,
      apiKey: process.env.CLOUDINARY_API_KEY,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      folder: CLOUDINARY_UPLOAD_FOLDER,
      transformation: UPLOAD_TRANSFORMATION,
    })
  } catch (error) {
    console.error('[admin/gallery/sign] POST failed:', error)
    return NextResponse.json(
      { error: 'Failed to sign upload params' },
      { status: 500 }
    )
  }
}
