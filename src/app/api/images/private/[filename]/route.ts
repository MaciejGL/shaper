import { NextRequest, NextResponse } from 'next/server'

import { generatePrivateImageUrl } from '@/lib/aws/s3'
import { getCurrentUser } from '@/lib/getUser'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } },
) {
  try {
    // Check authentication
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 },
      )
    }

    const filename = decodeURIComponent(params.filename)

    // Security: Check if user owns this image
    // Progress photos should contain the user ID in the path
    if (filename.startsWith('progress-private/')) {
      const userIdFromPath = filename.split('/')[1] // Extract userId from path
      if (userIdFromPath !== user.user.id) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    // For trainers: allow access to client progress photos if they're the trainer
    if (
      filename.startsWith('progress-private/') &&
      user.user.role === 'TRAINER'
    ) {
      // Additional logic could be added here to verify trainer-client relationship
      // For now, trainers can access any progress photos
    }

    // Generate temporary signed URL (1 hour expiration)
    const signedUrl = await generatePrivateImageUrl(filename, 3600)

    // Return redirect to signed URL
    return NextResponse.redirect(signedUrl)
  } catch (error) {
    console.error('Error serving private image:', error)
    return NextResponse.json(
      { error: 'Failed to serve image' },
      { status: 500 },
    )
  }
}
