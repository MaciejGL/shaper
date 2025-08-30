import { GraphQLError } from 'graphql'

import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

/**
 * Factory function to copy all exercises from one day to another
 * @param input - Contains sourceDayId and targetDayId
 * @param context - GraphQL context with user information
 * @returns Promise<boolean> - Success status
 */
export const copyExercisesFromDay = async (
  input: { sourceDayId: string; targetDayId: string },
  context: GQLContext,
): Promise<boolean> => {
  const { sourceDayId, targetDayId } = input
  const user = context.user

  if (!user) {
    throw new GraphQLError('User not authenticated')
  }

  if (sourceDayId === targetDayId) {
    throw new GraphQLError('Cannot copy exercises to the same day')
  }

  const [sourceDay, targetDay] = await Promise.all([
    prisma.trainingDay.findUnique({
      where: { id: sourceDayId },
      include: {
        exercises: {
          include: {
            sets: true,
          },
          orderBy: { order: 'asc' },
        },
        week: {
          include: {
            plan: {
              select: {
                id: true,
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
                id: true,
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

  if (!sourceDay.exercises || sourceDay.exercises.length === 0) {
    throw new GraphQLError('Source day has no exercises to copy')
  }

  if (targetDay.completedAt) {
    throw new GraphQLError('Cannot copy exercises to completed day')
  }

  // Use transaction to ensure data consistency
  return await prisma.$transaction(async (tx) => {
    // Get the current max order in target day
    const maxOrder = targetDay.exercises.length

    // Copy each exercise and its sets
    for (let i = 0; i < sourceDay.exercises.length; i++) {
      const sourceExercise = sourceDay.exercises[i]

      const newExercise = await tx.trainingExercise.create({
        data: {
          dayId: targetDayId,
          name: sourceExercise.name,
          order: maxOrder + i + 1,
          restSeconds: sourceExercise.restSeconds,
          tempo: sourceExercise.tempo,
          instructions: sourceExercise.instructions,
          additionalInstructions: sourceExercise.additionalInstructions,
          type: sourceExercise.type,
          warmupSets: sourceExercise.warmupSets,
          baseId: sourceExercise.baseId,
        },
      })

      // Copy sets if they exist
      if (sourceExercise.sets && sourceExercise.sets.length > 0) {
        await tx.exerciseSet.createMany({
          data: sourceExercise.sets.map((set) => ({
            exerciseId: newExercise.id,
            order: set.order,
            reps: set.reps,
            minReps: set.minReps,
            maxReps: set.maxReps,
            weight: set.weight,
            rpe: set.rpe,
          })),
        })
      }
    }

    // Update target day to match source day's workout type if target is a rest day
    if (targetDay.isRestDay && sourceDay.workoutType) {
      await tx.trainingDay.update({
        where: { id: targetDayId },
        data: {
          isRestDay: false,
          workoutType: sourceDay.workoutType,
        },
      })
    }

    return true
  })
}
