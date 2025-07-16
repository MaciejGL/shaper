import { NextRequest, NextResponse } from 'next/server'

import {
  type ImageType,
  generateFileName,
  generatePresignedUploadUrl,
  getImageUrl,
  validateImageFile,
} from '@/lib/aws/s3'
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

    // Validate image type
    if (!['avatar', 'exercise', 'progress'].includes(imageType)) {
      return NextResponse.json(
        { error: 'Invalid image type. Must be: avatar, exercise, or progress' },
        { status: 400 },
      )
    }

    // Validate content type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(contentType)) {
      return NextResponse.json(
        { error: 'Invalid content type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 },
      )
    }

    // For exercise images, relatedId (exerciseId) is required
    if (imageType === 'exercise' && !relatedId) {
      return NextResponse.json(
        { error: 'exerciseId is required for exercise images' },
        { status: 400 },
      )
    }

    // Generate unique file name
    const s3FileName = generateFileName(
      fileName,
      user.user.id,
      imageType,
      relatedId,
    )

    // Generate presigned URL
    const presignedUrl = await generatePresignedUploadUrl(
      s3FileName,
      contentType,
    )

    // Get the appropriate URL that will be used after upload (public or private based on image type)
    const publicUrl = getImageUrl(s3FileName, imageType)

    return NextResponse.json({
      success: true,
      presignedUrl,
      publicUrl,
      fileName: s3FileName,
      expiresIn: 300, // 5 minutes
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

    // Create a mock file object for validation
    const mockFile = {
      name: fileName,
      size: parseInt(fileSize),
      type: fileType,
    } as File

    const validation = validateImageFile(mockFile, imageType)

    return NextResponse.json({
      valid: validation.valid,
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
