import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

import { getCurrentUser } from '@/lib/getUser'

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

export async function GET(request: NextRequest) {
  try {
    // Check authentication for private images
    const user = await getCurrentUser()

    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const width = searchParams.get('w')
      ? parseInt(searchParams.get('w')!)
      : undefined
    const height = searchParams.get('h')
      ? parseInt(searchParams.get('h')!)
      : undefined
    const quality = searchParams.get('q')
      ? parseInt(searchParams.get('q')!)
      : 80
    const format = (searchParams.get('f') as 'webp' | 'jpeg' | 'png') || 'webp'

    if (!key) {
      return NextResponse.json({ error: 'Missing image key' }, { status: 400 })
    }

    // Security: Only allow access to user's own progress images
    if (key.startsWith('progress-private/')) {
      if (!user) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 },
        )
      }

      // Extract user ID from path: progress-private/{userId}/filename
      const pathParts = key.split('/')
      const imageUserId = pathParts[1]

      if (imageUserId !== user.user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // Get image from S3
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    const response = await s3Client.send(command)

    if (!response.Body) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Convert stream to buffer
    const buffer = await response.Body.transformToByteArray()

    // Process image with Sharp
    let sharpImage = sharp(Buffer.from(buffer))

    // Apply transformations
    if (width || height) {
      sharpImage = sharpImage.resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    // Set format and quality
    switch (format) {
      case 'webp':
        sharpImage = sharpImage.webp({ quality })
        break
      case 'jpeg':
        sharpImage = sharpImage.jpeg({ quality })
        break
      case 'png':
        sharpImage = sharpImage.png({ quality })
        break
    }

    const processedBuffer = await sharpImage.toBuffer()

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', `image/${format}`)
    headers.set('Content-Length', processedBuffer.length.toString())
    headers.set('Cache-Control', 'public, max-age=31536000, immutable') // Cache for 1 year
    headers.set(
      'ETag',
      `"${key}-${width || 'auto'}-${height || 'auto'}-${quality}-${format}"`,
    )

    return new NextResponse(new Uint8Array(processedBuffer), { headers })
  } catch (error) {
    console.error('Error processing image:', error)
    return NextResponse.json(
      { error: 'Failed to process image' },
      { status: 500 },
    )
  }
}
