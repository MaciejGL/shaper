import { NextRequest, NextResponse } from 'next/server'
import sharp from 'sharp'

import { generatePrivateImageUrl } from '@/lib/aws/s3'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

/**
 * Check if user has access to a specific progress image
 * (Duplicated from private route for consistency)
 */
async function hasProgressImageAccess(
  fileKey: string,
  userId: string,
): Promise<boolean> {
  // Extract userId from file path: progress-private/{userId}/...
  const pathParts = fileKey.split('/')
  const imageUserId = pathParts[1]

  // Users can always access their own images
  if (userId === imageUserId) {
    return true
  }

  // Check if this is a trainer accessing client's shared images
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId: imageUserId },
  })

  if (!userProfile) {
    return false
  }

  // Check if image is shared with trainer and verify trainer-client relationship
  const [progressLog, client] = await Promise.all([
    prisma.bodyProgressLog.findFirst({
      where: {
        userProfileId: userProfile.id,
        shareWithTrainer: true,
        OR: [
          { image1Url: { contains: fileKey } },
          { image2Url: { contains: fileKey } },
          { image3Url: { contains: fileKey } },
        ],
      },
    }),
    prisma.user.findUnique({
      where: { id: imageUserId },
    }),
  ])

  return !!progressLog && !!client && client.trainerId === userId
}

/**
 * Optimized image API route with authentication
 * Handles image resizing and optimization for private images
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')
    const width = searchParams.get('w')
    const quality = searchParams.get('q')

    // Validate required parameters
    if (!key || !width) {
      return NextResponse.json(
        { error: 'Missing required parameters: key, width' },
        { status: 400 },
      )
    }

    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    // Verify access based on file type
    if (key.startsWith('progress-private/')) {
      const hasAccess = await hasProgressImageAccess(key, user.user.id)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Parse optimization parameters
    const targetWidth = Math.min(parseInt(width), 2000) // Cap at 2000px
    const targetQuality = Math.min(Math.max(parseInt(quality || '75'), 10), 100) // 10-100

    // Generate temporary signed URL for the original image
    const signedUrl = await generatePrivateImageUrl(key, 3600) // 1 hour

    // Fetch the original image from S3
    const imageResponse = await fetch(signedUrl)
    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const originalBuffer = await imageResponse.arrayBuffer()

    // Optimize the image with Sharp
    const optimizedBuffer = await sharp(Buffer.from(originalBuffer))
      .resize(targetWidth, null, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({
        quality: targetQuality,
        progressive: true,
        mozjpeg: true,
      })
      .toBuffer()

    // Return optimized image with proper caching headers
    return new NextResponse(new Uint8Array(optimizedBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable', // 1 year cache
        'Content-Length': optimizedBuffer.length.toString(),
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      },
    })
  } catch (error) {
    console.error('Error optimizing private image:', error)
    return NextResponse.json(
      { error: 'Failed to optimize image' },
      { status: 500 },
    )
  }
}
