import * as crypto from 'crypto'
import { addDays, getISOWeek } from 'date-fns'
import { GraphQLError } from 'graphql'

import {
  GQLMutationAddExerciseToDayArgs,
  GQLMutationAddSetToExerciseArgs,
  GQLMutationAddTrainingWeekArgs,
  GQLMutationDuplicateTrainingWeekArgs,
  GQLMutationMoveExerciseArgs,
  GQLMutationRemoveExerciseFromDayArgs,
  GQLMutationRemoveSetFromExerciseArgs,
  GQLMutationRemoveTrainingWeekArgs,
  GQLMutationUpdateExerciseSetArgs,
  GQLMutationUpdateTrainingDayDataArgs,
  GQLMutationUpdateTrainingExerciseArgs,
  GQLMutationUpdateTrainingPlanDetailsArgs,
  GQLMutationUpdateTrainingWeekDetailsArgs,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import {
  getTodayUTC,
  getUTCWeekStart,
  parseUTCDate,
} from '@/lib/server-date-utils'
import { GQLContext } from '@/types/gql-context'

import TrainingPlan from './model'

// Using generated GraphQL types instead of custom interfaces

const isTrainer = (user: GQLContext['user']) =>
  user?.user.role.toLowerCase() === 'trainer'

export const isEditPlanNotAllowed = (
  user: GQLContext['user'],
  completedAt: Date | null,
) => isTrainer(user) && completedAt

/**
 * Update only the basic details of a training plan
 * Much more efficient than updating the entire plan structure
 */
export async function updateTrainingPlanDetails(
  input: GQLMutationUpdateTrainingPlanDetailsArgs['input'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get plan for additional checks
  const plan = await prisma.trainingPlan.findUnique({
    relationLoadStrategy: 'query',
    where: { id: input.id },
    select: { id: true, completedAt: true },
  })

  if (!plan) {
    throw new GraphQLError('Training plan not found')
  }

  if (isEditPlanNotAllowed(user, plan.completedAt)) {
    throw new GraphQLError('Cannot edit completed training plan')
  }

  await prisma.trainingPlan.update({
    where: { id: input.id },
    data: {
      title: input.title ?? undefined,
      description: input.description ?? undefined,
      isPublic: input.isPublic ?? undefined,
      isDraft: input.isDraft ?? undefined,
      difficulty: input.difficulty,
      focusTags: input.focusTags ?? undefined,
      targetGoals: input.targetGoals ?? undefined,
      heroImageUrl:
        input.heroImageUrl !== undefined ? input.heroImageUrl : undefined,
    },
  })

  return true
}

/**
 * Update only the basic details of a training week
 */
export async function updateTrainingWeekDetails(
  input: GQLMutationUpdateTrainingWeekDetailsArgs['input'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get week with plan ID for permission check
  const week = await prisma.trainingWeek.findUnique({
    where: { id: input.id },
    include: { plan: { select: { id: true } } },
  })

  if (!week) {
    throw new GraphQLError('Training week not found')
  }

  // Prevent editing completed weeks
  if (isEditPlanNotAllowed(user, week.completedAt)) {
    throw new GraphQLError('Cannot edit completed training week')
  }

  await prisma.trainingWeek.update({
    where: { id: input.id },
    data: {
      name: input.name ?? undefined,
      description: input.description ?? undefined,
      weekNumber: input.weekNumber ?? undefined,
    },
  })

  return true
}

export async function duplicateTrainingWeek(
  input: GQLMutationDuplicateTrainingWeekArgs['input'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get the plan to determine the next week number
  const plan = await prisma.trainingPlan.findUnique({
    relationLoadStrategy: 'query',
    where: { id: input.trainingPlanId },
    include: {
      weeks: {
        select: { weekNumber: true },
        orderBy: { weekNumber: 'desc' },
        take: 1,
      },
    },
  })

  if (!plan) {
    throw new GraphQLError('Training plan not found')
  }

  // Get the week to duplicate with all necessary nested data
  const weekToDuplicate = await prisma.trainingWeek.findUnique({
    where: { id: input.weekId },
    include: {
      plan: { select: { id: true } },
      days: {
        include: {
          exercises: {
            include: {
              sets: {
                orderBy: { order: 'asc' },
              },
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { dayOfWeek: 'asc' },
      },
    },
  })

  if (!weekToDuplicate) {
    throw new GraphQLError('Training week not found')
  }

  // Verify the week belongs to the same plan we're duplicating to
  if (weekToDuplicate.plan.id !== input.trainingPlanId) {
    throw new GraphQLError(
      'Week does not belong to the specified training plan',
    )
  }

  // Note: We don't prevent duplicating completed weeks as this is creating a new week
  // The completed status is not copied to the new week

  // Determine the next week number (last week + 1)
  const nextWeekNumber =
    plan.weeks.length > 0 ? plan.weeks[0].weekNumber + 1 : 1

  return await prisma.$transaction(
    async (tx) => {
      const uuid = () => crypto.randomUUID()

      // Create the new week first
      const newWeek = await tx.trainingWeek.create({
        data: {
          planId: input.trainingPlanId,
          weekNumber: nextWeekNumber,
          name: `Week ${nextWeekNumber}`,
          description: weekToDuplicate.description,
          isExtra: weekToDuplicate.isExtra,
        },
      })

      // Prepare bulk data for all entities
      const daysData = []
      const exercisesData = []
      const setsData = []

      // Build up all the data for bulk operations
      for (const day of weekToDuplicate.days) {
        const newDayId = uuid()
        daysData.push({
          id: newDayId,
          weekId: newWeek.id,
          planId: input.trainingPlanId,
          dayOfWeek: day.dayOfWeek,
          isRestDay: day.isRestDay,
          workoutType: day.workoutType,
          isExtra: day.isExtra,
        })

        for (const exercise of day.exercises) {
          const newExerciseId = uuid()
          exercisesData.push({
            id: newExerciseId,
            dayId: newDayId,
            name: exercise.name,
            order: exercise.order,
            restSeconds: exercise.restSeconds,
            tempo: exercise.tempo,
            description: exercise.description,
            instructions: exercise.instructions,
            tips: exercise.tips,
            difficulty: exercise.difficulty,
            additionalInstructions: exercise.additionalInstructions,
            type: exercise.type,
            warmupSets: exercise.warmupSets,
            baseId: exercise.baseId,
            isExtra: exercise.isExtra,
          })

          for (const set of exercise.sets) {
            setsData.push({
              id: uuid(),
              exerciseId: newExerciseId,
              order: set.order,
              reps: set.reps,
              minReps: set.minReps,
              maxReps: set.maxReps,
              weight: set.weight,
              rpe: set.rpe,
              isExtra: set.isExtra,
            })
          }
        }
      }

      // Execute bulk operations in parallel for maximum performance
      await Promise.all([
        daysData.length > 0
          ? tx.trainingDay.createMany({ data: daysData })
          : Promise.resolve(),
        exercisesData.length > 0
          ? tx.trainingExercise.createMany({ data: exercisesData })
          : Promise.resolve(),
        setsData.length > 0
          ? tx.exerciseSet.createMany({ data: setsData })
          : Promise.resolve(),
      ])

      return newWeek.id
    },
    { timeout: 10000, maxWait: 10000 }, // Reduced timeout due to bulk operations
  )
}

export async function removeTrainingWeek(
  weekId: GQLMutationRemoveTrainingWeekArgs['weekId'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get the week to be deleted with its details
  const week = await prisma.trainingWeek.findUnique({
    where: { id: weekId },
    include: { plan: { select: { id: true, completedAt: true } } },
  })

  if (!week) {
    throw new GraphQLError('Training week not found')
  }

  // Prevent removing weeks from completed training plans or completed weeks
  if (isEditPlanNotAllowed(user, week.completedAt)) {
    throw new GraphQLError('Cannot remove completed training week')
  }
  if (isEditPlanNotAllowed(user, week.plan.completedAt)) {
    throw new GraphQLError('Cannot remove weeks from completed training plan')
  }

  return await prisma.$transaction(async (tx) => {
    // Store the week number of the week being deleted
    const deletedWeekNumber = week.weekNumber

    // Delete the week
    await tx.trainingWeek.delete({
      where: { id: weekId },
    })

    // Decrement the weekNumber of all weeks that came after the deleted one
    await tx.trainingWeek.updateMany({
      where: {
        planId: week.planId,
        weekNumber: { gt: deletedWeekNumber },
      },
      data: {
        weekNumber: { decrement: 1 },
      },
    })

    return true
  })
}

export async function addTrainingWeek(
  input: GQLMutationAddTrainingWeekArgs['input'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const plan = await prisma.trainingPlan.findUnique({
    relationLoadStrategy: 'query',
    where: { id: input.trainingPlanId },
    select: { id: true, completedAt: true },
  })

  if (!plan) {
    throw new GraphQLError('Training plan not found')
  }

  // Prevent adding weeks to completed training plans
  if (isEditPlanNotAllowed(user, plan.completedAt)) {
    throw new GraphQLError('Cannot add weeks to completed training plan')
  }

  return await prisma.$transaction(
    async (tx) => {
      // If inserting at a specific week number, increment weekNumber of all existing weeks >= input.weekNumber
      await tx.trainingWeek.updateMany({
        where: {
          planId: input.trainingPlanId,
          weekNumber: { gte: input.weekNumber },
        },
        data: {
          weekNumber: { increment: 1 },
        },
      })

      // Create the new week
      const newWeek = await tx.trainingWeek.create({
        data: {
          planId: input.trainingPlanId,
          weekNumber: input.weekNumber,
          name: `Week ${input.weekNumber}`,
          description: '',
          days: {
            create: Array.from({ length: 7 }, (_, i) => ({
              dayOfWeek: i,
            })),
          },
        },
      })

      return newWeek.id
    },
    { timeout: 30000, maxWait: 30000 },
  )
}

/**
 * Update training day data (rest day status, workout type)
 */
export async function updateTrainingDayData(
  input: GQLMutationUpdateTrainingDayDataArgs['input'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get day with plan ID for permission check
  const day = await prisma.trainingDay.findUnique({
    relationLoadStrategy: 'query',
    where: { id: input.dayId },
    include: {
      week: {
        include: {
          plan: { select: { id: true } },
        },
      },
    },
  })

  if (!day) {
    throw new GraphQLError('Training day not found')
  }

  // Prevent editing completed days or days in completed weeks
  if (isEditPlanNotAllowed(user, day.completedAt)) {
    throw new GraphQLError('Cannot edit completed training day')
  }
  if (isEditPlanNotAllowed(user, day.week.completedAt)) {
    throw new GraphQLError('Cannot edit days in completed training week')
  }

  await prisma.trainingDay.update({
    where: { id: input.dayId },
    data: {
      isRestDay: input.isRestDay ?? undefined,
      workoutType: input.workoutType ?? undefined,
    },
  })

  return true
}

/**
 * Smart update for training exercise - only updates changed fields
 * Much more efficient than delete/recreate approach
 */
export async function updateTrainingExercise(
  input: GQLMutationUpdateTrainingExerciseArgs['input'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get exercise with plan ID for permission check
  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: input.id },
    include: {
      day: {
        include: {
          week: {
            include: {
              plan: { select: { id: true } },
            },
          },
        },
      },
    },
  })

  if (!exercise) {
    throw new GraphQLError('Training exercise not found')
  }

  // Prevent editing completed exercises, days, or weeks
  if (isEditPlanNotAllowed(user, exercise.completedAt)) {
    throw new GraphQLError('Cannot edit completed training exercise')
  }
  if (isEditPlanNotAllowed(user, exercise.day.completedAt)) {
    throw new GraphQLError('Cannot edit exercises in completed training day')
  }
  if (isEditPlanNotAllowed(user, exercise.day.week.completedAt)) {
    throw new GraphQLError('Cannot edit exercises in completed training week')
  }

  await prisma.$transaction(async (tx) => {
    // Update exercise details
    await tx.trainingExercise.update({
      where: { id: input.id },
      data: {
        name: input.name ?? undefined,
        restSeconds: input.restSeconds ?? undefined,
        tempo: input.tempo ?? undefined,
        description: input.description ?? undefined,
        instructions: input.instructions ?? undefined,
        tips: input.tips ?? undefined,
        difficulty: input.difficulty ?? undefined,
        additionalInstructions: input.additionalInstructions ?? undefined,
        type: input.type ?? undefined,
        order: input.order,
        warmupSets: input.warmupSets ?? undefined,
        baseId: input.baseId ?? undefined,
      },
    })

    // Handle sets efficiently if provided
    if (input.sets) {
      // Get existing sets
      const existingSets = await tx.exerciseSet.findMany({
        where: { exerciseId: input.id },
      })

      const existingSetIds = existingSets.map((s) => s.id)
      const inputSetIds = input.sets
        .map((s) => s.id)
        .filter(Boolean) as string[]

      // Delete sets that are no longer in the input
      const setsToDelete = existingSetIds.filter(
        (id) => !inputSetIds.includes(id),
      )
      if (setsToDelete.length > 0) {
        await tx.exerciseSet.deleteMany({
          where: { id: { in: setsToDelete } },
        })
      }

      // Update or create sets
      for (const setInput of input.sets) {
        if (setInput.id && existingSetIds.includes(setInput.id)) {
          // Update existing set
          await tx.exerciseSet.update({
            where: { id: setInput.id },
            data: {
              order: setInput.order,
              reps: setInput.reps,
              minReps: setInput.minReps,
              maxReps: setInput.maxReps,
              weight: setInput.weight,
              rpe: setInput.rpe,
            },
          })
        } else {
          // Create new set
          await tx.exerciseSet.create({
            data: {
              exerciseId: input.id,
              order: setInput.order,
              reps: setInput.reps,
              minReps: setInput.minReps,
              maxReps: setInput.maxReps,
              weight: setInput.weight,
              rpe: setInput.rpe,
            },
          })
        }
      }
    }
  })

  return true
}

/**
 * Update a single exercise set
 */
export async function updateExerciseSet(
  input: GQLMutationUpdateExerciseSetArgs['input'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get set with plan ID for permission check
  const set = await prisma.exerciseSet.findUnique({
    where: { id: input.id },
    include: {
      exercise: {
        include: {
          day: {
            include: {
              week: {
                include: {
                  plan: { select: { id: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!set) {
    throw new GraphQLError('Exercise set not found')
  }

  // Prevent editing completed sets, exercises, days, or weeks
  if (isEditPlanNotAllowed(user, set.completedAt)) {
    throw new GraphQLError('Cannot edit completed exercise set')
  }
  if (isEditPlanNotAllowed(user, set.exercise.completedAt)) {
    throw new GraphQLError('Cannot edit sets in completed training exercise')
  }
  if (isEditPlanNotAllowed(user, set.exercise.day.completedAt)) {
    throw new GraphQLError('Cannot edit sets in completed training day')
  }
  if (isEditPlanNotAllowed(user, set.exercise.day.week.completedAt)) {
    throw new GraphQLError('Cannot edit sets in completed training week')
  }

  await prisma.exerciseSet.update({
    where: {
      id: input.id,
    },
    data: {
      order: input.order ?? null,
      reps: input.reps ?? null,
      minReps: input.minReps ?? null,
      maxReps: input.maxReps ?? null,
      weight: input.weight ?? null,
      rpe: input.rpe ?? null,
    },
  })

  return true
}

/**
 * Add a new exercise to a training day
 */
export async function addExerciseToDay(
  input: GQLMutationAddExerciseToDayArgs['input'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get day with plan ID for permission check
  const day = await prisma.trainingDay.findUnique({
    relationLoadStrategy: 'query',
    where: { id: input.dayId },
    include: {
      week: {
        include: { plan: { select: { id: true } } },
      },
    },
  })

  if (!day) {
    throw new GraphQLError('Training day not found')
  }

  // Prevent adding exercises to completed days or weeks
  if (isEditPlanNotAllowed(user, day.completedAt)) {
    throw new GraphQLError('Cannot add exercises to completed training day')
  }
  if (isEditPlanNotAllowed(user, day.week.completedAt)) {
    throw new GraphQLError('Cannot add exercises to completed training week')
  }

  return await prisma.$transaction(async (tx) => {
    // Check for null baseId first
    if (!input.baseId) {
      throw new GraphQLError(
        'Exercise must have a base exercise. Please create a base exercise first.',
        { extensions: { code: 'MISSING_BASE_EXERCISE' } },
      )
    }

    // Check for duplicate baseId on the same day
    const existingExercise = await tx.trainingExercise.findFirst({
      where: {
        dayId: input.dayId,
        baseId: input.baseId,
      },
      select: { id: true, name: true },
    })

    if (existingExercise) {
      throw new GraphQLError(
        `Exercise "${existingExercise.name}" with this base exercise already exists on this day`,
        { extensions: { code: 'DUPLICATE_BASE_EXERCISE' } },
      )
    }

    // If inserting at a specific order position, increment order of all exercises >= input.order
    if (input.order !== undefined) {
      await tx.trainingExercise.updateMany({
        where: {
          dayId: input.dayId,
          order: { gte: input.order },
        },
        data: {
          order: { increment: 1 },
        },
      })
    }

    // Create the new exercise
    const exercise = await tx.trainingExercise.create({
      data: {
        dayId: input.dayId,
        name: input.name,
        order: input.order,
        restSeconds: input.restSeconds,
        tempo: input.tempo,
        description: input.description,
        instructions: input.instructions || undefined,
        tips: input.tips || undefined,
        difficulty: input.difficulty,
        additionalInstructions: input.additionalInstructions,
        type: input.type,
        warmupSets: input.warmupSets,
        baseId: input.baseId,
        sets: {
          create: [
            {
              order: 1,
              reps: null,
              minReps: null,
              maxReps: null,
              weight: null,
              rpe: null,
            },
          ],
        },
      },
    })

    return exercise.id
  })
}

/**
 * Remove an exercise from a training day
 */
export async function removeExerciseFromDay(
  exerciseId: GQLMutationRemoveExerciseFromDayArgs['exerciseId'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get exercise with plan ID for permission check
  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    include: {
      day: {
        include: {
          week: {
            include: { plan: { select: { id: true } } },
          },
        },
      },
    },
  })

  if (!exercise) {
    throw new GraphQLError('Training exercise not found')
  }

  // Prevent removing exercises from completed items
  if (isEditPlanNotAllowed(user, exercise.completedAt)) {
    throw new GraphQLError('Cannot remove completed training exercise')
  }
  if (isEditPlanNotAllowed(user, exercise.day.completedAt)) {
    throw new GraphQLError(
      'Cannot remove exercises from completed training day',
    )
  }
  if (isEditPlanNotAllowed(user, exercise.day.week.completedAt)) {
    throw new GraphQLError(
      'Cannot remove exercises from completed training week',
    )
  }

  return await prisma.$transaction(async (tx) => {
    // Store the order of the exercise being deleted
    const deletedOrder = exercise.order

    // Delete the exercise
    await tx.trainingExercise.delete({
      where: { id: exerciseId },
    })

    // Decrement the order of all exercises that came after the deleted one
    if (deletedOrder !== null) {
      await tx.trainingExercise.updateMany({
        where: {
          dayId: exercise.dayId,
          order: { gt: deletedOrder },
        },
        data: {
          order: { decrement: 1 },
        },
      })
    }

    return true
  })
}

/**
 * Remove all exercises from a training day
 */
export async function removeAllExercisesFromDay(
  input: { dayId: string },
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get day with exercises and plan ID for permission check
  const day = await prisma.trainingDay.findUnique({
    relationLoadStrategy: 'query',
    where: { id: input.dayId },
    include: {
      exercises: {
        select: { id: true, completedAt: true },
      },
      week: {
        include: { plan: { select: { id: true } } },
      },
    },
  })

  if (!day) {
    throw new GraphQLError('Training day not found')
  }

  // Prevent removing exercises from completed day or week
  if (isEditPlanNotAllowed(user, day.completedAt)) {
    throw new GraphQLError(
      'Cannot remove exercises from completed training day',
    )
  }
  if (isEditPlanNotAllowed(user, day.week.completedAt)) {
    throw new GraphQLError(
      'Cannot remove exercises from completed training week',
    )
  }

  // Check if any exercises are completed
  const hasCompletedExercises = day.exercises.some((exercise) =>
    isEditPlanNotAllowed(user, exercise.completedAt),
  )
  if (hasCompletedExercises) {
    throw new GraphQLError(
      'Cannot remove all exercises: some exercises are already completed',
    )
  }

  // If no exercises exist, return success
  if (day.exercises.length === 0) {
    return true
  }

  // Delete all exercises from the day (cascade delete will handle sets)
  await prisma.trainingExercise.deleteMany({
    where: { dayId: input.dayId },
  })

  return true
}

/**
 * Move an exercise to a new order position, optionally to a different day
 * Properly handles reordering of all affected exercises
 */
export async function moveExercise(
  input: GQLMutationMoveExerciseArgs['input'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: input.exerciseId },
    include: {
      day: {
        include: {
          week: {
            include: { plan: { select: { id: true } } },
          },
        },
      },
    },
  })

  if (!exercise) {
    throw new GraphQLError('Training exercise not found')
  }

  // Prevent moving completed exercises or exercises in completed items
  if (isEditPlanNotAllowed(user, exercise.completedAt)) {
    throw new GraphQLError('Cannot move completed training exercise')
  }
  if (isEditPlanNotAllowed(user, exercise.day.completedAt)) {
    throw new GraphQLError('Cannot move exercises from completed training day')
  }
  if (isEditPlanNotAllowed(user, exercise.day.week.completedAt)) {
    throw new GraphQLError('Cannot move exercises from completed training week')
  }

  const sourceDayId = input.dayId
  const targetDayId = input.targetDayId || input.dayId // Use targetDayId if provided, otherwise same day
  const currentOrder = exercise.order
  const newOrder = input.newOrder
  const isMovingToDifferentDay = sourceDayId !== targetDayId

  // If same day and same order, no need to do anything
  if (!isMovingToDifferentDay && currentOrder === newOrder) {
    return true
  }

  return await prisma.$transaction(async (tx) => {
    if (isMovingToDifferentDay) {
      // Moving between different days

      // First, verify target day exists and user has access
      if (input.targetDayId) {
        const targetDay = await tx.trainingDay.findUnique({
          relationLoadStrategy: 'query',
          where: { id: input.targetDayId },
          include: {
            week: {
              include: { plan: { select: { id: true } } },
            },
          },
        })

        if (!targetDay) {
          throw new GraphQLError('Target day not found')
        }
      }

      // Remove from source day: decrement order of exercises that came after
      if (currentOrder !== null) {
        await tx.trainingExercise.updateMany({
          where: {
            dayId: sourceDayId,
            order: { gt: currentOrder },
          },
          data: {
            order: { decrement: 1 },
          },
        })
      }

      // Add to target day: increment order of exercises at and after the insertion point
      await tx.trainingExercise.updateMany({
        where: {
          dayId: targetDayId,
          order: { gte: newOrder },
        },
        data: {
          order: { increment: 1 },
        },
      })

      // Update the exercise to its new day and order
      await tx.trainingExercise.update({
        where: { id: input.exerciseId },
        data: {
          dayId: targetDayId,
          order: newOrder,
        },
      })
    } else {
      // Moving within the same day (original logic)
      if (currentOrder !== null && newOrder !== null) {
        if (currentOrder < newOrder) {
          // Moving down: decrement all exercises between current and new position
          await tx.trainingExercise.updateMany({
            where: {
              dayId: sourceDayId,
              order: { gt: currentOrder, lte: newOrder },
            },
            data: {
              order: { decrement: 1 },
            },
          })
        } else {
          // Moving up: increment all exercises between new and current position
          await tx.trainingExercise.updateMany({
            where: {
              dayId: sourceDayId,
              order: { gte: newOrder, lt: currentOrder },
            },
            data: {
              order: { increment: 1 },
            },
          })
        }
      }

      // Update the exercise to its new order
      await tx.trainingExercise.update({
        where: { id: input.exerciseId },
        data: { order: newOrder },
      })
    }

    return true
  })
}
/**
 * Add a new set to an exercise
 * Properly handles reordering of existing sets when inserting at a specific position
 */
export async function addSetToExercise(
  input: GQLMutationAddSetToExerciseArgs['input'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get exercise with plan ID for permission check
  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: input.exerciseId },
    include: {
      day: {
        include: {
          week: {
            include: { plan: { select: { id: true } } },
          },
        },
      },
    },
  })

  if (!exercise) {
    throw new GraphQLError('Training exercise not found')
  }

  // Prevent adding sets to completed items
  if (isEditPlanNotAllowed(user, exercise.completedAt)) {
    throw new GraphQLError('Cannot add sets to completed training exercise')
  }
  if (isEditPlanNotAllowed(user, exercise.day.completedAt)) {
    throw new GraphQLError('Cannot add sets to completed training day')
  }
  if (isEditPlanNotAllowed(user, exercise.day.week.completedAt)) {
    throw new GraphQLError('Cannot add sets to completed training week')
  }

  return await prisma.$transaction(async (tx) => {
    // If inserting at a specific order position, increment order of all sets >= input.order
    if (input.order !== undefined) {
      await tx.exerciseSet.updateMany({
        where: {
          exerciseId: input.exerciseId,
          order: { gte: input.order },
        },
        data: {
          order: { increment: 1 },
        },
      })
    }

    // Create the new set
    const set = await tx.exerciseSet.create({
      data: {
        exerciseId: input.exerciseId,
        order: input.order,
        reps: input.reps,
        minReps: input.minReps,
        maxReps: input.maxReps,
        weight: input.weight,
        rpe: input.rpe,
      },
    })

    return set.id
  })
}

/**
 * Remove a set from an exercise
 * Properly handles reordering of remaining sets to fill the gap
 */
export async function removeSetFromExercise(
  setId: GQLMutationRemoveSetFromExerciseArgs['setId'],
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get set with plan ID for permission check
  const set = await prisma.exerciseSet.findUnique({
    where: { id: setId },
    include: {
      exercise: {
        include: {
          day: {
            include: {
              week: {
                include: { plan: { select: { id: true } } },
              },
            },
          },
        },
      },
    },
  })

  if (!set) {
    throw new GraphQLError('Exercise set not found')
  }

  // Prevent removing sets from completed items
  if (isEditPlanNotAllowed(user, set.completedAt)) {
    throw new GraphQLError('Cannot remove completed exercise set')
  }
  if (isEditPlanNotAllowed(user, set.exercise.completedAt)) {
    throw new GraphQLError(
      'Cannot remove sets from completed training exercise',
    )
  }
  if (isEditPlanNotAllowed(user, set.exercise.day.completedAt)) {
    throw new GraphQLError('Cannot remove sets from completed training day')
  }
  if (isEditPlanNotAllowed(user, set.exercise.day.week.completedAt)) {
    throw new GraphQLError('Cannot remove sets from completed training week')
  }

  return await prisma.$transaction(async (tx) => {
    // Store the order of the set being deleted
    const deletedOrder = set.order

    // Delete the set
    await tx.exerciseSet.delete({
      where: { id: setId },
    })

    // Decrement the order of all sets that came after the deleted one
    if (deletedOrder !== null) {
      await tx.exerciseSet.updateMany({
        where: {
          exerciseId: set.exerciseId,
          order: { gt: deletedOrder },
        },
        data: {
          order: { decrement: 1 },
        },
      })
    }

    const updatedExercise = await tx.trainingExercise.findUnique({
      where: { id: set.exerciseId },
      include: {
        sets: true,
      },
    })

    const allSetsCompleted = updatedExercise?.sets.every(
      (set) => set.completedAt,
    )

    if (allSetsCompleted) {
      await tx.trainingExercise.update({
        where: { id: set.exerciseId },
        data: { completedAt: new Date() },
      })
    }

    return true
  })
}

export async function getQuickWorkoutPlan(context: GQLContext) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Optimized single query approach - find or create in one operation
  let quickWorkoutPlan = await prisma.trainingPlan.findFirst({
    where: {
      assignedToId: user.user.id,
      createdById: user.user.id,
    },
    // Include minimal data needed for TrainingPlan model - avoid unnecessary joins
    select: {
      id: true,
      title: true,
      description: true,
      isPublic: true,
      isDraft: true,
      createdById: true,
      assignedToId: true,
      // Required fields for TrainingPlan model
      createdAt: true,
      updatedAt: true,
      isTemplate: true,
      templateId: true,
      difficulty: true,
      active: true,
      startDate: true,
      endDate: true,
      completedAt: true,
      targetGoals: true,
      focusTags: true,
      premium: true,
      weeks: {
        orderBy: { weekNumber: 'asc' },
        select: {
          id: true,
          weekNumber: true,
          scheduledAt: true,
          days: {
            orderBy: { dayOfWeek: 'asc' },
            select: {
              id: true,
              dayOfWeek: true,
              isRestDay: true,
              scheduledAt: true,
              exercises: {
                orderBy: { order: 'asc' },
                select: {
                  id: true,
                  name: true,
                  baseId: true,
                  order: true,
                  completedAt: true,
                  base: {
                    select: {
                      id: true,
                      name: true,
                      equipment: true,
                      muscleGroups: {
                        select: {
                          id: true,
                          name: true,
                          alias: true,
                          displayGroup: true,
                        },
                      },
                    },
                  },
                  sets: {
                    orderBy: { order: 'asc' },
                    select: {
                      id: true,
                      order: true,
                      reps: true,
                      minReps: true,
                      maxReps: true,
                      weight: true,
                      rpe: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  })

  // Create plan only if it doesn't exist
  if (!quickWorkoutPlan) {
    const weekStart = getUTCWeekStart()
    const createdPlan = await prisma.trainingPlan.create({
      data: {
        title: 'Quick Workout',
        createdById: user.user.id,
        assignedToId: user.user.id,
        isPublic: false,
        isDraft: false,
        weeks: {
          create: {
            name: `Week ${getISOWeek(weekStart)}`,
            weekNumber: 1,
            isExtra: true,
            scheduledAt: weekStart,
            days: {
              createMany: {
                data: Array.from({ length: 7 }, (_, i) => ({
                  dayOfWeek: i,
                  isRestDay: false,
                  isExtra: true,
                  scheduledAt: addDays(weekStart, i),
                })),
              },
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        isPublic: true,
        isDraft: true,
        createdById: true,
        assignedToId: true,
        focusTags: true,
        premium: true,
        // Required fields for TrainingPlan model
        createdAt: true,
        updatedAt: true,
        isTemplate: true,
        templateId: true,
        difficulty: true,
        active: true,
        startDate: true,
        endDate: true,
        completedAt: true,
        targetGoals: true,
        weeks: {
          orderBy: { weekNumber: 'asc' },
          select: {
            id: true,
            weekNumber: true,
            scheduledAt: true,
            days: {
              orderBy: { dayOfWeek: 'asc' },
              select: {
                id: true,
                dayOfWeek: true,
                isRestDay: true,
                scheduledAt: true,
                exercises: {
                  orderBy: { order: 'asc' },
                  select: {
                    id: true,
                    name: true,
                    baseId: true,
                    order: true,
                    completedAt: true,
                    base: {
                      select: {
                        id: true,
                        name: true,
                        equipment: true,
                        muscleGroups: {
                          select: {
                            id: true,
                            name: true,
                            alias: true,
                            displayGroup: true,
                          },
                        },
                      },
                    },
                    sets: {
                      orderBy: { order: 'asc' },
                      select: {
                        id: true,
                        order: true,
                        reps: true,
                        minReps: true,
                        maxReps: true,
                        weight: true,
                        rpe: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    quickWorkoutPlan = createdPlan
  }

  // @ts-expect-error - Selective query result is compatible with TrainingPlan model
  return new TrainingPlan(quickWorkoutPlan, context)
}

/**
 * Shift the training schedule forward in time (week-based)
 * Moves the selected week and all following weeks to start on the target date.
 * Each week maintains its 7-day structure with days calculated as week.scheduledAt + dayOfWeek.
 */
export async function shiftTrainingSchedule(
  input: { planId: string; fromWeekId: string; startDate?: string | null },
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const profile = await prisma.userProfile.findUnique({
    where: { userId: user.user.id },
    select: { timezone: true },
  })
  const timezone = profile?.timezone ?? 'UTC'

  // Load the plan with all weeks
  const plan = await prisma.trainingPlan.findUnique({
    relationLoadStrategy: 'query',
    where: { id: input.planId },
    select: {
      id: true,
      assignedToId: true,
      completedAt: true,
      weeks: {
        orderBy: { weekNumber: 'asc' },
        select: {
          id: true,
          weekNumber: true,
          scheduledAt: true,
          days: {
            select: {
              id: true,
              dayOfWeek: true,
            },
          },
        },
      },
    },
  })

  if (!plan) {
    throw new GraphQLError('Training plan not found')
  }

  // Authorization: only the assigned user can shift their schedule
  if (plan.assignedToId !== user.user.id) {
    throw new GraphQLError('You can only shift your own training schedule')
  }

  // Don't allow shifting completed plans
  if (plan.completedAt) {
    throw new GraphQLError('Cannot shift schedule of a completed plan')
  }

  // Find the selected week
  const fromWeek = plan.weeks.find((week) => week.id === input.fromWeekId)
  if (!fromWeek) {
    throw new GraphQLError('Selected week not found in this plan')
  }

  if (!fromWeek.scheduledAt) {
    throw new GraphQLError('Selected week has no scheduled date')
  }

  // Get all weeks to shift (selected week and all following)
  const weeksToShift = plan.weeks.filter(
    (week) => week.weekNumber >= fromWeek.weekNumber,
  )

  if (weeksToShift.length === 0) {
    throw new GraphQLError('No weeks to shift')
  }

  // Calculate target start date
  const startDateString = input.startDate ? input.startDate.slice(0, 10) : null
  const targetStartDate = startDateString
    ? parseUTCDate(startDateString, timezone)
    : getTodayUTC(timezone)

  // Calculate the offset in days between current week start and target date
  const currentWeekStart = new Date(fromWeek.scheduledAt)
  const offsetMs = targetStartDate.getTime() - currentWeekStart.getTime()
  const offsetDays = Math.round(offsetMs / (1000 * 60 * 60 * 24))

  // If no change needed, return early
  if (offsetDays === 0) {
    return true
  }

  // Execute updates in a transaction
  await prisma.$transaction(
    async (tx) => {
      for (const week of weeksToShift) {
        if (!week.scheduledAt) continue

        // Calculate new week start date by adding offset
        const newWeekStart = addDays(new Date(week.scheduledAt), offsetDays)

        // Update the week's scheduledAt
        await tx.trainingWeek.update({
          where: { id: week.id },
          data: { scheduledAt: newWeekStart },
        })

        // Update each day's scheduledAt based on new week start + dayOfWeek
        for (const day of week.days) {
          const newDayScheduledAt = addDays(newWeekStart, day.dayOfWeek)
          await tx.trainingDay.update({
            where: { id: day.id },
            data: { scheduledAt: newDayScheduledAt },
          })
        }
      }
    },
    { timeout: 15000, maxWait: 15000 },
  )

  return true
}
