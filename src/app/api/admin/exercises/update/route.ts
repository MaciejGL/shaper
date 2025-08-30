import { NextRequest, NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { deleteImages } from '@/lib/aws/s3'
import { prisma } from '@/lib/db'

interface ExerciseUpdate {
  id: string
  name?: string
  description?: string | null
  difficulty?: string | null
  equipment?: string | null
  videoUrl?: string | null
  isPublic?: boolean
  isPremium?: boolean
  version?: number
  additionalInstructions?: string | null
  instructions?: string | null
  tips?: string | null
  images?: {
    id: string
    url: string
    order: number
  }[]
}

export async function PATCH(request: NextRequest) {
  try {
    // Check admin access
    const hasAdminAccess = await isAdminUser()
    if (!hasAdminAccess) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { updates }: { updates: ExerciseUpdate[] } = await request.json()

    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 },
      )
    }

    // Validate each update has an ID
    for (const update of updates) {
      if (!update.id || typeof update.id !== 'string') {
        return NextResponse.json(
          { error: 'Invalid update: missing or invalid ID' },
          { status: 400 },
        )
      }
    }

    // Perform updates in a transaction
    const results = await prisma.$transaction(async (tx) => {
      const updatePromises = updates.map(async (update) => {
        const { id, images, ...updateData } = update

        // Handle image updates if present
        if (images !== undefined) {
          // Get current images for S3 cleanup
          const currentImages = await tx.image.findMany({
            where: {
              entityType: 'exercise',
              entityId: id,
            },
            select: { id: true, url: true },
          })

          // Find images to delete (current images not in new images list)
          const newImageUrls = images.map((img) => img.url)
          const imagesToDelete = currentImages.filter(
            (img) => !newImageUrls.includes(img.url),
          )

          // Delete removed images from S3
          if (imagesToDelete.length > 0) {
            await deleteImages(imagesToDelete.map((img) => img.url))
          }

          // Delete all current images from database
          await tx.image.deleteMany({
            where: {
              entityType: 'exercise',
              entityId: id,
            },
          })

          // Create new images
          if (images.length > 0) {
            await tx.image.createMany({
              data: images.map((img) => ({
                url: img.url,
                order: img.order,
                entityType: 'exercise' as const,
                entityId: id,
              })),
            })
          }
        }

        // Remove undefined values to avoid Prisma errors
        const cleanUpdateData: Record<string, unknown> = {}
        for (const [key, value] of Object.entries(updateData)) {
          if (value !== undefined) {
            cleanUpdateData[key] = value
          }
        }

        if (Object.keys(cleanUpdateData).length === 0 && images === undefined) {
          return null // Skip if no actual changes
        }

        try {
          return await tx.baseExercise.update({
            where: { id },
            data: {
              ...cleanUpdateData,
              updatedAt: new Date(),
            },
            select: {
              id: true,
              name: true,
              images: {
                select: {
                  id: true,
                  url: true,
                  order: true,
                },
                orderBy: { order: 'asc' },
              },
            },
          })
        } catch (error) {
          console.error(`Failed to update exercise ${id}:`, error)
          return null
        }
      })

      const updateResults = await Promise.all(updatePromises)
      return updateResults.filter((result) => result !== null)
    })

    return NextResponse.json({
      success: true,
      updated: results.length,
      exercises: results,
    })
  } catch (error) {
    console.error('Failed to update exercises:', error)
    return NextResponse.json(
      { error: 'Failed to update exercises' },
      { status: 500 },
    )
  }
}
