import { prisma } from '@lib/db'
import { addDays, getWeek, startOfWeek } from 'date-fns'
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
import { GQLContext } from '@/types/gql-context'

import { getFullPlanById } from '../training-utils.server'

import TrainingPlan from './model'

// Using generated GraphQL types instead of custom interfaces

const isTrainer = (user: GQLContext['user']) =>
  user?.user.role.toLowerCase() === 'trainer'

const isEditPlanNotAllowed = (
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

  // Verify ownership
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: input.id, createdById: user.user.id },
    select: { id: true, completedAt: true },
  })

  if (!plan) {
    throw new GraphQLError('Training plan not found or unauthorized')
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

  // Verify ownership through the plan
  const week = await prisma.trainingWeek.findUnique({
    where: { id: input.id },
    include: { plan: { select: { createdById: true } } },
  })

  if (!week || week.plan.createdById !== user.user.id) {
    throw new GraphQLError('Training week not found or unauthorized')
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

  // Get the plan to verify ownership and determine the next week number
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: input.trainingPlanId, createdById: user.user.id },
    include: {
      weeks: {
        select: { weekNumber: true },
        orderBy: { weekNumber: 'desc' },
        take: 1,
      },
    },
  })

  if (!plan) {
    throw new GraphQLError('Training plan not found or unauthorized')
  }

  // Get the week to duplicate with all necessary nested data
  const weekToDuplicate = await prisma.trainingWeek.findUnique({
    where: { id: input.weekId },
    include: {
      plan: { select: { createdById: true } }, // For additional ownership verification
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

  if (!weekToDuplicate || weekToDuplicate.plan.createdById !== user.user.id) {
    throw new GraphQLError('Training week not found or unauthorized')
  }

  // Note: We don't prevent duplicating completed weeks as this is creating a new week
  // The completed status is not copied to the new week

  // Determine the next week number (last week + 1)
  const nextWeekNumber =
    plan.weeks.length > 0 ? plan.weeks[0].weekNumber + 1 : 1

  return await prisma.$transaction(async (tx) => {
    // Create the new week
    const newWeek = await tx.trainingWeek.create({
      data: {
        planId: input.trainingPlanId,
        weekNumber: nextWeekNumber,
        name: `Week ${nextWeekNumber}`,
        description: weekToDuplicate.description,
        isExtra: weekToDuplicate.isExtra,
        days: {
          create: weekToDuplicate.days.map((day) => ({
            dayOfWeek: day.dayOfWeek,
            isRestDay: day.isRestDay,
            workoutType: day.workoutType,
            isExtra: day.isExtra,
            exercises: {
              create: day.exercises.map((exercise) => ({
                name: exercise.name,
                order: exercise.order,
                restSeconds: exercise.restSeconds,
                tempo: exercise.tempo,
                instructions: exercise.instructions,
                additionalInstructions: exercise.additionalInstructions,
                type: exercise.type,
                warmupSets: exercise.warmupSets,
                baseId: exercise.baseId,
                isExtra: exercise.isExtra,
                sets: {
                  create: exercise.sets.map((set) => ({
                    order: set.order,
                    reps: set.reps,
                    minReps: set.minReps,
                    maxReps: set.maxReps,
                    weight: set.weight,
                    rpe: set.rpe,
                    isExtra: set.isExtra,
                  })),
                },
              })),
            },
          })),
        },
      },
    })

    return newWeek.id
  })
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
    include: { plan: { select: { createdById: true, completedAt: true } } },
  })

  if (!week || week.plan.createdById !== user.user.id) {
    throw new GraphQLError('Training week not found or unauthorized')
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
    where: { id: input.trainingPlanId, createdById: user.user.id },
    select: { id: true, completedAt: true },
  })

  if (!plan) {
    throw new GraphQLError('Training plan not found or unauthorized')
  }

  // Prevent adding weeks to completed training plans
  if (isEditPlanNotAllowed(user, plan.completedAt)) {
    throw new GraphQLError('Cannot add weeks to completed training plan')
  }

  return await prisma.$transaction(async (tx) => {
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
  })
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

  // Verify ownership through the plan
  const day = await prisma.trainingDay.findUnique({
    where: { id: input.dayId },
    include: {
      week: {
        include: {
          plan: { select: { createdById: true } },
        },
      },
    },
  })

  if (!day || day.week.plan.createdById !== user.user.id) {
    throw new GraphQLError('Training day not found or unauthorized')
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

  // Verify ownership
  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: input.id },
    include: {
      day: {
        include: {
          week: {
            include: {
              plan: { select: { createdById: true } },
            },
          },
        },
      },
    },
  })

  if (!exercise || exercise.day.week.plan.createdById !== user.user.id) {
    throw new GraphQLError('Training exercise not found or unauthorized')
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
        instructions: input.instructions ?? undefined,
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

  // Verify ownership and check completion status
  const set = await prisma.exerciseSet.findUnique({
    where: { id: input.id },
    include: {
      exercise: {
        include: {
          day: {
            include: {
              week: {
                include: {
                  plan: { select: { createdById: true } },
                },
              },
            },
          },
        },
      },
    },
  })

  if (!set || set.exercise.day.week.plan.createdById !== user.user.id) {
    throw new GraphQLError('Exercise set not found or unauthorized')
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

  // Verify ownership
  const day = await prisma.trainingDay.findUnique({
    where: { id: input.dayId },
    include: {
      week: {
        include: { plan: { select: { createdById: true } } },
      },
    },
  })

  if (!day || day.week.plan.createdById !== user.user.id) {
    throw new GraphQLError('Training day not found or unauthorized')
  }

  // Prevent adding exercises to completed days or weeks
  if (isEditPlanNotAllowed(user, day.completedAt)) {
    throw new GraphQLError('Cannot add exercises to completed training day')
  }
  if (isEditPlanNotAllowed(user, day.week.completedAt)) {
    throw new GraphQLError('Cannot add exercises to completed training week')
  }

  return await prisma.$transaction(async (tx) => {
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
        instructions: input.instructions,
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

  // Verify ownership and get exercise details
  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    include: {
      day: {
        include: {
          week: {
            include: { plan: { select: { createdById: true } } },
          },
        },
      },
    },
  })

  if (!exercise || exercise.day.week.plan.createdById !== user.user.id) {
    throw new GraphQLError('Training exercise not found or unauthorized')
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
            include: { plan: { select: { createdById: true } } },
          },
        },
      },
    },
  })

  if (!exercise || exercise.day.week.plan.createdById !== user.user.id) {
    throw new GraphQLError('Training exercise not found or unauthorized')
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
          where: { id: input.targetDayId },
          include: {
            week: {
              include: { plan: { select: { createdById: true } } },
            },
          },
        })

        if (!targetDay || targetDay.week.plan.createdById !== user.user.id) {
          throw new GraphQLError('Target day not found or unauthorized')
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

  // Verify ownership
  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: input.exerciseId },
    include: {
      day: {
        include: {
          week: {
            include: { plan: { select: { createdById: true } } },
          },
        },
      },
    },
  })

  if (!exercise || exercise.day.week.plan.createdById !== user.user.id) {
    throw new GraphQLError('Training exercise not found or unauthorized')
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

  // Verify ownership and get set details
  const set = await prisma.exerciseSet.findUnique({
    where: { id: setId },
    include: {
      exercise: {
        include: {
          day: {
            include: {
              week: {
                include: { plan: { select: { createdById: true } } },
              },
            },
          },
        },
      },
    },
  })

  if (!set || set.exercise.day.week.plan.createdById !== user.user.id) {
    throw new GraphQLError('Exercise set not found or unauthorized')
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

  const plan = await prisma.trainingPlan.findFirst({
    where: {
      assignedToId: user.user.id,
      createdById: user.user.id,
    },
  })

  if (!plan) {
    console.info('[getQuickWorkoutPlan] Creating new quick workout plan')
    // Create a new quick workout plan
    await prisma.trainingPlan.create({
      data: {
        title: 'Quick Workout',
        createdById: user.user.id,
        assignedToId: user.user.id,
        isPublic: false,
        isDraft: false,
        weeks: {
          create: {
            name: `Week ${getWeek(startOfWeek(new Date(), { weekStartsOn: 1 }))}`,
            weekNumber: 1,
            isExtra: true,
            scheduledAt: startOfWeek(new Date(), { weekStartsOn: 1 }),

            days: {
              createMany: {
                data: Array.from({ length: 7 }, (_, i) => ({
                  dayOfWeek: i,
                  isRestDay: false,
                  isExtra: true,
                  scheduledAt: addDays(
                    startOfWeek(new Date(), { weekStartsOn: 1 }),
                    i,
                  ),
                })),
              },
            },
          },
        },
      },
    })
  }

  const quickWorkoutPlan = await prisma.trainingPlan.findFirst({
    where: {
      assignedToId: user.user.id,
      createdById: user.user.id,
    },
  })

  if (!quickWorkoutPlan) {
    console.error('[getQuickWorkoutPlan] Quick workout plan not found')
    throw new GraphQLError('Quick workout plan not found')
  }

  const fullPlan = await getFullPlanById(quickWorkoutPlan.id)

  if (!fullPlan) {
    console.error(
      '[getFullPlanById] Quick workout plan not found',
      quickWorkoutPlan.id,
    )
    throw new GraphQLError('Quick workout plan not found')
  }

  return new TrainingPlan(fullPlan, context)
}
