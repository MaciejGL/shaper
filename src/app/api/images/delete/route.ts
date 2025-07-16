import { NextRequest, NextResponse } from 'next/server'

import { deleteImages } from '@/lib/aws/s3'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

interface DeleteImageRequest {
  imageId: string
}

export async function DELETE(request: NextRequest) {
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
    const body: DeleteImageRequest = await request.json()
    const { imageId } = body

    if (!imageId) {
      return NextResponse.json(
        { error: 'imageId is required' },
        { status: 400 },
      )
    }

    // Get the image to verify ownership and get URL for S3 cleanup
    const image = await prisma.image.findFirst({
      where: { id: imageId },
      include: {
        exercise: {
          select: {
            id: true,
            createdById: true,
          },
        },
      },
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Check ownership for exercise images
    if (image.entityType === 'exercise') {
      if (!image.exercise || image.exercise.createdById !== user.user.id) {
        return NextResponse.json(
          {
            error:
              'Access denied - you can only delete your own exercise images',
          },
          { status: 403 },
        )
      }
    }

    // For other entity types (progress photos, etc.), add ownership checks as needed
    // if (image.entityType === 'user_progress') {
    //   // Check if user owns this progress photo
    // }

    // Delete from S3
    await deleteImages([image.url])

    // Delete from database
    await prisma.image.delete({
      where: { id: imageId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: 'Failed to delete image' },
      { status: 500 },
    )
  }
}
