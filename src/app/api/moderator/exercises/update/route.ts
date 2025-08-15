import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

import {
  moderatorAccessDeniedResponse,
  requireModeratorUser,
} from '@/lib/admin-auth'
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
