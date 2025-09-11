import { NextRequest, NextResponse } from 'next/server'

import { ImageHandler, type ImageType } from '@/lib/aws/image-handler'
import { getCurrentUser } from '@/lib/getUser'

interface PresignedUrlRequest {
  fileName: string
  contentType: string
  imageType: ImageType
  relatedId?: string // exerciseId for exercise images, optional for others
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    // Parse request body
    const body: PresignedUrlRequest = await request.json()
    const { fileName, contentType, imageType, relatedId } = body

    // Validate required fields
    if (!fileName || !contentType || !imageType) {
      return NextResponse.json(
        { error: 'Missing required fields: fileName, contentType, imageType' },
        { status: 400 },
      )
    }

    // Use centralized image handler
    const result = await ImageHandler.upload({
      fileName,
      contentType,
      imageType,
      userId: user.user.id,
      relatedId,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const uploadData = result.data!
    return NextResponse.json({
      success: true,
      presignedUrl: uploadData.presignedUrl,
      publicUrl: uploadData.displayUrl || uploadData.finalUrl, // Use displayUrl for private images
      fileName: uploadData.s3FileName,
      expiresIn: uploadData.expiresIn,
    })
  } catch (error) {
    console.error('Error generating presigned URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate presigned URL' },
      { status: 500 },
    )
  }
}

// Optional: GET endpoint to validate file before upload
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('fileName')
    const fileSize = searchParams.get('fileSize')
    const fileType = searchParams.get('fileType')
    const imageType = searchParams.get('imageType') as ImageType

    if (!fileName || !fileSize || !fileType || !imageType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 },
      )
    }

    // Use centralized validation
    const validation = ImageHandler.validateFile({
      contentType: fileType,
      imageType,
    })

    return NextResponse.json({
      valid: validation.success,
      error: validation.error,
    })
  } catch (error) {
    console.error('Error validating file:', error)
    return NextResponse.json(
      { error: 'Failed to validate file' },
      { status: 500 },
    )
  }
}
