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

  if (sourceDayId === targetDayId) {
    throw new GraphQLError('Cannot move exercises to the same day')
  }

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

  if (!sourceDay || !targetDay) {
    throw new GraphQLError('Source or target day not found')
  }

  if (
    sourceDay.week.plan.createdById !== user.user.id ||
    targetDay.week.plan.createdById !== user.user.id
  ) {
    throw new GraphQLError('You do not have permission to move exercises')
  }

  if (!sourceDay.exercises || sourceDay.exercises.length === 0) {
    throw new GraphQLError('Source day has no exercises to move')
  }

  if (targetDay.exercises.length > 0) {
    throw new GraphQLError('Target day already has exercises')
  }

  if (sourceDay.completedAt || targetDay.completedAt) {
    throw new GraphQLError('Cannot move exercises from or to completed days')
  }

  // Use transaction to ensure data consistency
  return await prisma.$transaction(async (tx) => {
    for (let i = 0; i < sourceDay.exercises.length; i++) {
      const exercise = sourceDay.exercises[i]
      await tx.trainingExercise.update({
        where: { id: exercise.id },
        data: {
          dayId: targetDayId,
        },
      })
    }

    if (targetDay.isRestDay) {
      await tx.trainingDay.update({
        where: { id: targetDayId },
        data: {
          isRestDay: false,
          workoutType: targetDay.workoutType,
        },
      })
    }

    return true
  })
}
