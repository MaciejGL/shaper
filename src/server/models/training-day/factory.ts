import { GraphQLError } from 'graphql'

import { GQLMoveExercisesToDayInput } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

/**
 * Factory function to move all exercises from one day to another
 * @param input - Contains sourceDayId and targetDayId
 * @param context - GraphQL context with user information
 * @returns Promise<boolean> - Success status
 */
export const moveExercisesToDay = async (
  input: GQLMoveExercisesToDayInput,
  context: GQLContext,
): Promise<boolean> => {
  const { sourceDayId, targetDayId } = input
  const user = context.user

  if (!user) {
    throw new GraphQLError('User not authenticated')
  }

  // Cannot move exercises to the same day
  if (sourceDayId === targetDayId) {
    throw new GraphQLError('Cannot move exercises to the same day')
  }

  // Fetch both days with their exercises and verify user permissions
  const [sourceDay, targetDay] = await Promise.all([
    prisma.trainingDay.findUnique({
      where: { id: sourceDayId },
      include: {
        exercises: {
          include: {
            sets: true,
          },
        },
        week: {
          include: {
            plan: {
              select: {
                createdById: true,
              },
            },
          },
        },
      },
    }),
    prisma.trainingDay.findUnique({
      where: { id: targetDayId },
      include: {
        exercises: true,
        week: {
          include: {
            plan: {
              select: {
                createdById: true,
              },
            },
          },
        },
      },
    }),
  ])

  // Verify days exist
  if (!sourceDay || !targetDay) {
    throw new GraphQLError('Source or target day not found')
  }

  // Verify user has permission to modify both days
  if (
    sourceDay.week.plan.createdById !== user.user.id ||
    targetDay.week.plan.createdById !== user.user.id
  ) {
    throw new GraphQLError('You do not have permission to move exercises')
  }

  // Check if source day has exercises to move
  if (!sourceDay.exercises || sourceDay.exercises.length === 0) {
    throw new GraphQLError('Source day has no exercises to move')
  }

  if (targetDay.exercises.length > 0) {
    throw new GraphQLError('Target day already has exercises')
  }

  // Check if either day is completed (cannot modify completed days)
  if (sourceDay.completedAt || targetDay.completedAt) {
    throw new GraphQLError('Cannot move exercises from or to completed days')
  }

  // Use transaction to ensure data consistency
  return await prisma.$transaction(async (tx) => {
    // Get the current max order in target day to append new exercises
    const maxOrder =
      targetDay.exercises.length > 0
        ? Math.max(...targetDay.exercises.map((e) => e.order))
        : 0

    // Update all exercises from source day to target day
    await tx.trainingExercise.updateMany({
      where: { dayId: sourceDayId },
      data: { dayId: targetDayId },
    })

    // Reorder exercises in target day to append moved exercises
    for (let i = 0; i < sourceDay.exercises.length; i++) {
      const exercise = sourceDay.exercises[i]
      await tx.trainingExercise.update({
        where: { id: exercise.id },
        data: {
          order: maxOrder + i + 1,
          dayId: targetDayId,
        },
      })
    }

    // If target day was a rest day, set it to not be a rest day
    if (targetDay.isRestDay) {
      await tx.trainingDay.update({
        where: { id: targetDayId },
        data: {
          isRestDay: false,
          // Set a default workout type if none exists
          workoutType: targetDay.workoutType || 'FullBody',
        },
      })
    }

    return true
  })
}
