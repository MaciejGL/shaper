import { NextRequest, NextResponse } from 'next/server'

import { Prisma } from '@/generated/prisma/client'
import {
  moderatorAccessDeniedResponse,
  requireModeratorUser,
} from '@/lib/admin-auth'
import { ImageHandler } from '@/lib/aws/image-handler'
import { prisma } from '@/lib/db'
import {
  deleteExerciseImageVariants,
  processExerciseImageToOptimized,
} from '@/lib/image-optimization'

interface ExerciseUpdate {
  id: string
  name?: string
  description?: string | null
  instructions?: string[]
  tips?: string[]
  equipment?: string
  isPublic?: boolean
  isPremium?: boolean
  verified?: boolean
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
        // Get existing images to clean up from S3 (delete all variants)
        const existingImages = await prisma.image.findMany({
          where: {
            entityType: 'exercise',
            entityId: id,
          },
          select: { url: true },
        })

        // Delete existing images and all variants from S3
        if (existingImages.length > 0) {
          const deletePromises = existingImages.map(async (img) => {
            // Delete all variants (original, thumbnail, medium, large)
            await deleteExerciseImageVariants(img.url)
          })
          await Promise.all(deletePromises)
        }

        // Remove existing images from database
        await prisma.image.deleteMany({
          where: {
            entityType: 'exercise',
            entityId: id,
          },
        })

        // Add new images with optimization
        if (images && images.length > 0) {
          const newImageUrls = images.map((img) => img.url)

          // Step 1: Move images from temp to final location
          const moveResult = await ImageHandler.move({
            fromUrls: newImageUrls,
            toId: id,
            imageType: 'exercise',
          })

          if (!moveResult.success || !moveResult.data) {
            throw new Error('Failed to move images to final location')
          }

          // Step 2: Process each moved image to create optimized versions
          const processedImages = await Promise.all(
            moveResult.data.movedUrls.map(async (url, index) => {
              const optimized = await processExerciseImageToOptimized(url)
              return {
                url,
                thumbnail: optimized.thumbnail,
                medium: optimized.medium,
                large: optimized.large,
                order: index,
                entityType: 'exercise' as const,
                entityId: id,
              }
            }),
          )

          await prisma.image.createMany({
            data: processedImages,
          })
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
          verified: true,
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
