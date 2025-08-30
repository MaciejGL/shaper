import { NextRequest, NextResponse } from 'next/server'

import { Prisma } from '@/generated/prisma/client'
import {
  moderatorAccessDeniedResponse,
  requireModeratorUser,
} from '@/lib/admin-auth'
import { deleteImages } from '@/lib/aws/s3'
import { prisma } from '@/lib/db'

interface ExerciseUpdate {
  id: string
  name?: string
  description?: string | null
  instructions?: string[]
  tips?: string[]
  equipment?: string
  isPublic?: boolean
  isPremium?: boolean
  version?: number
  videoUrl?: string | null
  images?: {
    id: string
    url: string
    order: number
  }[]
  muscleGroupIds?: string[]
  secondaryMuscleGroupIds?: string[]
  substituteIds?: string[]
}

export async function PATCH(request: NextRequest) {
  try {
    // Check moderator access
    await requireModeratorUser()

    const { updates }: { updates: ExerciseUpdate[] } = await request.json()

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Invalid updates format' },
        { status: 400 },
      )
    }

    // Process updates in parallel
    const updatePromises = updates.map(async (update) => {
      const {
        id,
        muscleGroupIds,
        secondaryMuscleGroupIds,
        substituteIds,
        images,
        ...updateData
      } = update

      // Remove undefined values from basic update data
      const cleanedData = Object.fromEntries(
        Object.entries(updateData).filter(([, value]) => value !== undefined),
      )

      // Prepare muscle group and substitute updates
      const relationUpdates: Prisma.BaseExerciseUpdateInput = {}

      if (muscleGroupIds !== undefined) {
        relationUpdates.muscleGroups = {
          set: muscleGroupIds.map((id) => ({ id })),
        }
      }

      if (secondaryMuscleGroupIds !== undefined) {
        relationUpdates.secondaryMuscleGroups = {
          set: secondaryMuscleGroupIds.map((id) => ({ id })),
        }
      }

      // Handle substitute exercises
      if (substituteIds !== undefined) {
        // First, remove existing substitutes for this exercise
        await prisma.baseExerciseSubstitute.deleteMany({
          where: { originalId: id },
        })

        // Then add new substitutes
        if (substituteIds.length > 0) {
          await prisma.baseExerciseSubstitute.createMany({
            data: substituteIds.map((substituteId) => ({
              originalId: id,
              substituteId,
              reason: null,
            })),
          })
        }
      }

      // Handle image updates
      if (images !== undefined) {
        // Get current images for S3 cleanup
        const currentImages = await prisma.image.findMany({
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

        // Update images in database
        relationUpdates.images = {
          deleteMany: {}, // Delete all existing images
          create: images.map((img) => ({
            url: img.url,
            order: img.order,
            entityType: 'exercise' as const,
          })),
        }
      }

      // Combine all updates
      const allUpdates = { ...cleanedData, ...relationUpdates }

      if (Object.keys(allUpdates).length === 0) {
        return null // Skip empty updates
      }

      return prisma.baseExercise.update({
        where: { id },
        data: allUpdates,
        select: {
          id: true,
          name: true,
          description: true,
          instructions: true,
          tips: true,
          equipment: true,
          isPublic: true,
          isPremium: true,
          version: true,
          videoUrl: true,
          images: {
            select: {
              id: true,
              url: true,
              order: true,
            },
            orderBy: { order: 'asc' },
          },
          muscleGroups: {
            select: {
              id: true,
              name: true,
              alias: true,
              groupSlug: true,
            },
          },
          secondaryMuscleGroups: {
            select: {
              id: true,
              name: true,
              alias: true,
              groupSlug: true,
            },
          },
          updatedAt: true,
        },
      })
    })

    const results = await Promise.all(updatePromises)
    const successfulUpdates = results.filter(Boolean)

    return NextResponse.json({
      success: true,
      updated: successfulUpdates.length,
      exercises: successfulUpdates,
    })
  } catch (error) {
    console.error('Error updating exercises for moderator:', error)

    if (
      error instanceof Error &&
      error.message.includes('Moderator access required')
    ) {
      return moderatorAccessDeniedResponse()
    }

    return NextResponse.json(
      { error: 'Failed to update exercises' },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check moderator access
    await requireModeratorUser()

    const { exerciseId }: { exerciseId: string } = await request.json()

    if (!exerciseId) {
      return NextResponse.json(
        { error: 'Exercise ID is required' },
        { status: 400 },
      )
    }

    // Check if exercise exists
    const exercise = await prisma.baseExercise.findUnique({
      where: { id: exerciseId },
    })

    if (!exercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 })
    }

    // Delete the exercise
    await prisma.baseExercise.delete({
      where: { id: exerciseId },
    })

    return NextResponse.json({
      success: true,
      message: 'Exercise deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting exercise for moderator:', error)

    if (
      error instanceof Error &&
      error.message.includes('Moderator access required')
    ) {
      return moderatorAccessDeniedResponse()
    }

    return NextResponse.json(
      { error: 'Failed to delete exercise' },
      { status: 500 },
    )
  }
}
