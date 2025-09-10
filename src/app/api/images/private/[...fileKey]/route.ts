import { NextRequest, NextResponse } from 'next/server'

import { generatePrivateImageUrl } from '@/lib/aws/s3'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

/**
 * Check if user has access to a specific progress image
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
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}

/**
 * Serve private images with authentication and access control
 * Supports progress photos with trainer sharing permissions
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ fileKey: string[] }> },
) {
  try {
    const { fileKey: fileKeyArray } = await params
    const fileKey = fileKeyArray.join('/')

    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    // Verify access based on file type
    if (fileKey.startsWith('progress-private/')) {
      const hasAccess = await hasProgressImageAccess(fileKey, user.user.id)
      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    } else {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400 })
    }

    // Generate temporary signed URL
    const signedUrl = await generatePrivateImageUrl(fileKey, 3600) // 1 hour

    // Fetch the image from S3 and stream it back
    const imageResponse = await fetch(signedUrl)

    if (!imageResponse.ok) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Get the image content and headers
    const imageBuffer = await imageResponse.arrayBuffer()
    const contentType =
      imageResponse.headers.get('content-type') || 'image/jpeg'
    const contentLength = imageResponse.headers.get('content-length')

    // Create response with proper headers for caching
    const response = new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': request.headers.get('origin') || '*',
        ETag: imageResponse.headers.get('etag') || '',
        ...(contentLength && { 'Content-Length': contentLength }),
      },
    })

    return response
  } catch (error) {
    console.error('Error serving private image:', error)
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 },
    )
  }
}
