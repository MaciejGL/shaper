import {
  addDays,
  getISOWeek,
  isSameDay,
  isSameWeek,
  startOfToday,
} from 'date-fns'
import { GraphQLError } from 'graphql'

import {
  GQLAddAiExerciseToWorkoutInput,
  GQLAddSetExerciseFormInput,
  GQLCreateQuickWorkoutInput,
  GQLUpdateExerciseFormInput,
  GQLWorkoutSessionEvent,
} from '@/generated/graphql-server'
import { TrainingDay } from '@/generated/prisma/client'
import { TrainingExercise as TrainingExerciseType } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import {
  createAssistantThread,
  getLastAssistantMessage,
  parseAssistantJsonResponse,
} from '@/lib/open-ai/assistant-utils'
import { getUTCWeekStart } from '@/lib/server-date-utils'
import { checkPremiumAccess } from '@/lib/subscription/subscription-validator'
import { GQLContext } from '@/types/gql-context'

import BaseExercise from '../base-exercise/model'
import ExerciseSet from '../exercise-set/model'
import { isEditPlanNotAllowed } from '../training-plan/factory-updates'
import TrainingPlan from '../training-plan/model'
import { getFullPlanById } from '../training-utils.server'

import TrainingExercise, { ExerciseSubstitute } from './model'
import { ExerciseSuggestion } from './types'

// Focused function to get a single training exercise for form editing
export const getTrainingExercise = async (
  exerciseId: string,
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    include: {
      sets: {
        orderBy: { order: 'asc' },
      },
      base: {
        include: {
          images: true,
          muscleGroups: true,
          substitutes: {
            include: {
              substitute: true,
            },
          },
        },
      },
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
    throw new GraphQLError('Exercise not found')
  }

  return new TrainingExercise(exercise, context)
}

// Focused function to update exercise form data
export const updateExerciseForm = async (
  input: GQLUpdateExerciseFormInput,
  context: GQLContext,
) => {
  const { exerciseId, sets: inputSets, ...exerciseUpdates } = input

  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Verify user has access to this exercise
  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
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
      sets: true,
    },
  })

  if (!exercise) {
    throw new GraphQLError('Exercise not found')
  }

  if (isEditPlanNotAllowed(user, exercise.completedAt)) {
    throw new GraphQLError('Cannot edit completed exercise')
  }

  // Prepare data for Prisma update (filter out null values)
  const updateData: Partial<TrainingExerciseType> = {
    name: exerciseUpdates.name ?? undefined,
    description: exerciseUpdates.description ?? null,
    additionalInstructions: exerciseUpdates.additionalInstructions ?? null,
    type: exerciseUpdates.type ?? null,
    restSeconds: exerciseUpdates.restSeconds ?? null,
    warmupSets: exerciseUpdates.warmupSets ?? null,
    tempo: exerciseUpdates.tempo ?? null,
  }
  // if (exerciseUpdates.name !== undefined && exerciseUpdates.name !== null) {
  //   updateData.name = exerciseUpdates.name
  // }
  // if (!isNil(exerciseUpdates.instructions)) {
  //   updateData.instructions = exerciseUpdates.instructions
  // }
  // if (!isNil(exerciseUpdates.additionalInstructions)) {
  //   updateData.additionalInstructions = exerciseUpdates.additionalInstructions
  // }
  // if (!isNil(exerciseUpdates.type)) {
  //   updateData.type = exerciseUpdates.type
  // }
  // if (!isNil(exerciseUpdates.restSeconds)) {
  //   updateData.restSeconds = exerciseUpdates.restSeconds
  // }
  // if (!isNil(exerciseUpdates.warmupSets)) {
  //   updateData.warmupSets = exerciseUpdates.warmupSets
  // }
  // if (!isNil(exerciseUpdates.tempo)) {
  //   updateData.tempo = exerciseUpdates.tempo
  // }

  // Update exercise data
  await prisma.trainingExercise.update({
    where: { id: exerciseId },
    data: updateData,
  })

  // Update sets if provided
  if (inputSets && inputSets.length > 0) {
    // Handle set updates/creations
    for (const setInput of inputSets) {
      if (setInput.id) {
        // Update existing set
        await prisma.exerciseSet.update({
          where: { id: setInput.id },
          data: {
            order: setInput.order,
            minReps: setInput.minReps,
            maxReps: setInput.maxReps,
            weight: setInput.weight,
            rpe: setInput.rpe,
          },
        })
      } else {
        // Create new set
        await prisma.exerciseSet.create({
          data: {
            exerciseId: exerciseId,
            order: setInput.order,
            minReps: setInput.minReps,
            maxReps: setInput.maxReps,
            weight: setInput.weight,
            rpe: setInput.rpe,
          },
        })
      }
    }
  }

  // Fetch the updated exercise with sets
  const finalExercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    include: {
      sets: {
        orderBy: { order: 'asc' },
      },
    },
  })

  return new TrainingExercise(finalExercise!, context)
}

export const addExercisesToWorkout = async (
  workoutId: string,
  exerciseIds: string[],
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  if (exerciseIds.length > 3) {
    throw new GraphQLError('You can only add up to 3 exercises at a time')
  }

  const baseExericse = await prisma.baseExercise.findMany({
    where: {
      id: { in: exerciseIds },
    },
    select: {
      id: true,
      name: true,
      description: true, // V1 description
      additionalInstructions: true, // V1 additional instructions
      instructions: true, // V2 instructions array
      tips: true, // V2 tips array
      type: true,
      difficulty: true,
    },
  })

  const trainingDay = await prisma.trainingDay.findUnique({
    where: {
      id: workoutId,
    },
    include: {
      exercises: true,
      week: {
        include: {
          plan: { select: { id: true } },
        },
      },
    },
  })

  if (!trainingDay) {
    throw new Error('Training day not found')
  }

  const trainingExercises = await Promise.all(
    baseExericse.map(async (ex, index) => {
      return await prisma.trainingExercise.create({
        data: {
          baseId: ex.id,
          dayId: trainingDay.id,
          name: ex.name,
          order: trainingDay.exercises.length + index + 1, // Fix order calculation
          description: ex.description,
          instructions: ex.instructions,
          tips: ex.tips,
          difficulty: ex.difficulty,
          additionalInstructions: ex.additionalInstructions,
          isExtra: true,
          sets: {
            createMany: {
              data: Array.from({ length: 3 }, (_, setIndex) => ({
                order: setIndex + 1,
                isExtra: true,
              })),
            },
          },
        },
      })
    }),
  )

  return trainingExercises.map((ex) => new TrainingExercise(ex, context))
}

export const addAiExerciseToWorkout = async (
  input: GQLAddAiExerciseToWorkoutInput,
  context: GQLContext,
) => {
  const { dayId, exerciseId, sets } = input

  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Check if user has premium access for AI features
  const hasPremium = await checkPremiumAccess(user.user.id)
  if (!hasPremium) {
    throw new GraphQLError(
      'Premium subscription required for AI exercise features',
    )
  }

  const baseExericse = await prisma.baseExercise.findUnique({
    where: {
      id: exerciseId,
    },
    select: {
      id: true,
      name: true,
      description: true, // V1 description
      additionalInstructions: true, // V1 additional instructions
      instructions: true, // V2 instructions array
      tips: true, // V2 tips array
      type: true,
      difficulty: true,
    },
  })

  if (!baseExericse) {
    throw new Error('Exercise not found')
  }

  const trainingDay = await prisma.trainingDay.findUnique({
    where: {
      id: dayId,
    },
    include: {
      exercises: true,
      week: {
        include: {
          plan: { select: { id: true } },
        },
      },
    },
  })

  if (!trainingDay) {
    throw new Error('Training day not found')
  }

  const trainingExercise = await prisma.trainingExercise.create({
    data: {
      baseId: baseExericse.id,
      dayId: trainingDay.id,
      name: baseExericse.name,
      order: trainingDay.exercises.length + 1,
      description: baseExericse.description,
      instructions: baseExericse.instructions,
      tips: baseExericse.tips,
      difficulty: baseExericse.difficulty,
      additionalInstructions: baseExericse.additionalInstructions,
      isExtra: true,
      sets: {
        createMany: {
          data: sets.map((set, index) => ({
            reps: set?.reps,
            rpe: set?.rpe,
            order: index + 1,
            isExtra: true,
            minReps: set?.reps,
          })),
        },
      },
    },
  })

  return new TrainingExercise(trainingExercise, context)
}

export const addSingleExerciseToDay = async (
  dayId: string,
  exerciseBaseId: string,
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Find the day and verify access
  const day = await prisma.trainingDay.findUnique({
    where: { id: dayId },
    include: {
      week: {
        include: {
          plan: {
            select: {
              assignedToId: true,
              createdById: true,
            },
          },
        },
      },
      exercises: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!day) {
    throw new GraphQLError('Training day not found')
  }

  // Verify user has access to this training day (assigned plan)
  const plan = day.week.plan
  if (plan.assignedToId !== user.user.id) {
    throw new GraphQLError('Can only add exercises to your assigned plan')
  }

  // Find the base exercise
  const baseExercise = await prisma.baseExercise.findUnique({
    where: { id: exerciseBaseId },
    select: {
      id: true,
      name: true,
      description: true,
      additionalInstructions: true,
      instructions: true,
      tips: true,
      type: true,
      difficulty: true,
    },
  })

  if (!baseExercise) {
    throw new GraphQLError('Exercise not found')
  }

  // Create training exercise with 3 sets
  const trainingExercise = await prisma.trainingExercise.create({
    data: {
      baseId: baseExercise.id,
      dayId: day.id,
      name: baseExercise.name,
      order: day.exercises.length + 1,
      description: baseExercise.description,
      instructions: baseExercise.instructions,
      tips: baseExercise.tips,
      difficulty: baseExercise.difficulty,
      additionalInstructions: baseExercise.additionalInstructions,
      isExtra: true,
      sets: {
        create: [
          {
            order: 1,
            isExtra: true,
            reps: null,
          },
          {
            order: 2,
            isExtra: true,
            reps: null,
          },
          {
            order: 3,
            isExtra: true,
            reps: null,
          },
        ],
      },
    },
    include: {
      sets: true,
    },
  })

  // Mark day as incomplete since we added a new uncompleted exercise
  await prisma.trainingDay.update({
    where: { id: day.id },
    data: { completedAt: null },
  })

  return new TrainingExercise(trainingExercise, context)
}

export const addMultipleExercisesToDay = async (
  dayId: string,
  exerciseBaseIds: string[],
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Find the day and verify access
  const day = await prisma.trainingDay.findUnique({
    where: { id: dayId },
    include: {
      week: {
        include: {
          plan: {
            select: {
              assignedToId: true,
              createdById: true,
            },
          },
        },
      },
      exercises: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!day) {
    throw new GraphQLError('Training day not found')
  }

  // Verify user has access to this training day (assigned plan)
  const plan = day.week.plan
  if (plan.assignedToId !== user.user.id) {
    throw new GraphQLError('Can only add exercises to your assigned plan')
  }

  // Find all base exercises
  const baseExercises = await prisma.baseExercise.findMany({
    where: { id: { in: exerciseBaseIds } },
    select: {
      id: true,
      name: true,
      description: true,
      additionalInstructions: true,
      instructions: true,
      tips: true,
      type: true,
      difficulty: true,
    },
  })

  if (baseExercises.length !== exerciseBaseIds.length) {
    throw new GraphQLError('Some exercises not found')
  }

  // Create a map for quick lookup while preserving order
  const exerciseMap = new Map(baseExercises.map((ex) => [ex.id, ex]))

  // Create all training exercises in a transaction
  const createdExercises = await prisma.$transaction(
    exerciseBaseIds.map((exerciseId, index) => {
      const baseExercise = exerciseMap.get(exerciseId)
      if (!baseExercise) {
        throw new GraphQLError(`Exercise ${exerciseId} not found`)
      }

      return prisma.trainingExercise.create({
        data: {
          baseId: baseExercise.id,
          dayId: day.id,
          name: baseExercise.name,
          order: day.exercises.length + index + 1,
          description: baseExercise.description,
          instructions: baseExercise.instructions,
          tips: baseExercise.tips,
          difficulty: baseExercise.difficulty,
          additionalInstructions: baseExercise.additionalInstructions,
          isExtra: true,
          sets: {
            create: [
              {
                order: 1,
                isExtra: true,
                reps: null,
              },
              {
                order: 2,
                isExtra: true,
                reps: null,
              },
              {
                order: 3,
                isExtra: true,
                reps: null,
              },
            ],
          },
        },
        include: {
          sets: true,
        },
      })
    }),
  )

  // Mark day as incomplete since we added new uncompleted exercises
  await prisma.trainingDay.update({
    where: { id: day.id },
    data: { completedAt: null },
  })

  return createdExercises.map((ex) => new TrainingExercise(ex, context))
}

export const removeExerciseFromWorkout = async (
  exerciseId: string,
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    select: {
      id: true,
      dayId: true,
      order: true,
      isExtra: true,
      day: {
        select: {
          week: {
            select: {
              plan: {
                select: {
                  assignedToId: true,
                  createdById: true,
                },
              },
            },
          },
        },
      },
    },
  })

  // Idempotent: exercise already removed (double-tap / stale UI)
  if (!exercise) {
    return true
  }

  const plan = exercise.day.week.plan

  // Access control: only assigned user can mutate this day
  if (plan.assignedToId !== user.user.id) {
    throw new GraphQLError('Access denied')
  }

  // We treat a workout as “quick” when the user both created and is assigned to the plan.
  const isUserQuickWorkout = plan.createdById === user.user.id

  // For planned trainings, only allow removing extra exercises.
  // For quick workouts, allow removing any exercise (user owns the workout).
  if (!isUserQuickWorkout && !exercise.isExtra) {
    throw new GraphQLError('Can only remove extra exercises from planned workouts')
  }

  // Idempotent delete (avoids crashing on double calls / stale UI)
  const deleteResult = await prisma.trainingExercise.deleteMany({
    where: {
      id: exerciseId,
      ...(isUserQuickWorkout ? {} : { isExtra: true }),
    },
  })
  if (deleteResult.count === 0) {
    return true
  }

  // Reorder remaining exercises
  await prisma.trainingExercise.updateMany({
    where: {
      dayId: exercise.dayId,
      ...(isUserQuickWorkout ? {} : { isExtra: true }),
      order: { gt: exercise.order },
    },
    data: { order: { decrement: 1 } },
  })

  const day = await prisma.trainingDay.findUnique({
    where: {
      id: exercise.dayId,
    },
    include: {
      exercises: true,
    },
  })

  // Safety: should not happen (exercise references dayId)
  if (!day) return true

  // Update day completion status based on remaining exercises
  const allExercisesCompleted =
    day.exercises.length > 0 &&
    day.exercises.every((exercise) => exercise.completedAt)

  await prisma.trainingDay.update({
    where: { id: exercise.dayId },
    data: { completedAt: allExercisesCompleted ? new Date() : null },
  })

  return true
}

export const clearWorkoutDay = async (dayId: string, context: GQLContext) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Find the day and verify access
  const day = await prisma.trainingDay.findUnique({
    where: { id: dayId },
    include: {
      week: {
        include: {
          plan: {
            select: {
              assignedToId: true,
              createdById: true,
            },
          },
        },
      },
      exercises: true,
    },
  })

  if (!day) {
    throw new GraphQLError('Workout day not found')
  }

  // Verify this is the user's quick workout (created by them and assigned to them)
  const plan = day.week.plan
  if (plan.assignedToId !== user.user.id || plan.createdById !== user.user.id) {
    throw new GraphQLError('Access denied')
  }

  if (day.exercises.length === 0) {
    return true // Nothing to clear
  }

  // Remove all extra exercises from this day in a transaction

  await prisma.trainingExercise.deleteMany({
    where: {
      dayId: day.id,
    },
  })

  return true
}

export const addSet = async (exerciseId: string, context: GQLContext) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const trainingExercise = await prisma.trainingExercise.findUnique({
    where: {
      id: exerciseId,
    },
    include: {
      sets: {
        select: {
          id: true,
          isExtra: true,
          order: true,
        },
      },
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

  if (!trainingExercise) {
    throw new Error('Training exercise not found')
  }

  // Find the maximum existing order to ensure proper sequential ordering
  const maxOrder =
    trainingExercise.sets.length > 0
      ? Math.max(...trainingExercise.sets.map((set) => set.order || 1))
      : 0

  const set = await prisma.exerciseSet.create({
    data: {
      exerciseId: trainingExercise.id,
      order: maxOrder + 1,
      isExtra: true,
    },
  })

  // Check completion cascade after adding set
  await checkCompletionCascadeAfterSetAddition(exerciseId)

  return new ExerciseSet(set)
}

export const removeSet = async (setId: string, context: GQLContext) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const exercise = await prisma.trainingExercise.findFirst({
    where: {
      sets: {
        some: { id: setId },
      },
    },
    include: {
      sets: {
        orderBy: { order: 'asc' },
      },
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
    throw new Error('Training exercise not found')
  }

  const removedSet = exercise.sets.find((set) => set.id === setId)
  if (!removedSet) {
    throw new Error('Set not found in exercise')
  }

  // Delete the set
  await prisma.exerciseSet.delete({
    where: { id: setId },
  })

  // Update order for remaining sets
  await prisma.exerciseSet.updateMany({
    where: {
      exerciseId: exercise.id,
      isExtra: true,
      order: { gt: removedSet.order }, // only sets after the deleted one
    },
    data: {
      order: { decrement: 1 },
    },
  })

  // Check completion cascade after set removal
  await checkCompletionCascadeAfterSetRemoval(exercise.id)

  return true
}

export const getAiExerciseSuggestions = async (
  dayId: string,
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Check if user has premium access for AI features
  // Skip check for trainers (including admins) - they can use AI for training/testing
  const isTrainer = user.user.role === 'TRAINER'
  const hasPremium = isTrainer || (await checkPremiumAccess(user.user.id))
  if (!hasPremium) {
    throw new GraphQLError(
      'Premium subscription required for AI exercise suggestions',
    )
  }

  /* 1.  Fetch workout day + logs */
  const day = await prisma.trainingDay.findUnique({
    where: { id: dayId },
    include: {
      week: { select: { plan: { select: { createdById: true } } } },
      exercises: {
        include: {
          sets: { include: { log: { select: { weight: true, reps: true } } } },
          base: { include: { muscleGroups: { select: { name: true } } } },
        },
      },
    },
  })

  const userTrainerId = context.user?.user.trainerId
  if (!day || day.exercises.length === 0) {
    throw new Error('No exercises found for this day')
  }

  /* 2. Build workout summary using utility */
  const workoutSummary = buildWorkoutSummary(day)

  /* 3. Create assistant thread and get suggestions */
  const thread = await createAssistantThread([
    {
      role: 'user',
      content: `The athlete just completed:
     ${workoutSummary}
     - trainerId: ${userTrainerId}
     - Prioritize exercises from file that were created by trainerId: ${userTrainerId}
     - Return *exactly* 3 additional exercise suggestions 
     - RPE should be highest possible for the athlete based on the workout logs`,
    },
  ])

  /* 4. Get and parse assistant response */
  const assistantReply = await getLastAssistantMessage(thread.id)
  const suggestion: { exercises: ExerciseSuggestion[] } =
    parseAssistantJsonResponse(assistantReply)
  const exercises = suggestion.exercises

  /* 5. Hydrate BaseExercise entities */
  const baseExercises = await prisma.baseExercise.findMany({
    where: { id: { in: exercises.map((s) => s.id) } },
    include: { muscleGroups: true },
  })

  const results = baseExercises.map((exercise) => {
    const s = exercises.find((x) => x.id === exercise.id)!
    return {
      exercise: new BaseExercise(exercise, context),
      sets: Array.from({ length: s.sets }).map(() => ({
        reps: s.reps,
        rpe: s.rpe,
      })),
      aiMeta: { explanation: s.explanation },
    }
  })

  return results
}

function buildWorkoutSummary(
  day: TrainingDay & {
    exercises: {
      name: string
      sets: {
        log?: { weight: number | null; reps: number | null } | null
      }[]
      base?: {
        muscleGroups: { name: string }[]
      } | null
    }[]
  },
) {
  return day.exercises
    .map((ex, idx) => {
      const setsText = ex.sets
        .map((s) => {
          const w = s.log?.weight ?? 0
          const r = s.log?.reps ?? 0
          return `${w} kg x ${r}`
        })
        .join(', ')
      const muscles = ex.base?.muscleGroups.map((m) => m.name).join(', ')
      return `${idx + 1}. ${ex.name} [${muscles}]: ${setsText}`
    })
    .join('\n')
}

export const addSetExerciseForm = async (
  input: GQLAddSetExerciseFormInput,
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const { exerciseId, set } = input

  const trainingExercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    include: {
      sets: {
        orderBy: { order: 'asc' },
      },
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

  if (!trainingExercise) {
    throw new Error('Training exercise not found')
  }

  if (isEditPlanNotAllowed(user, trainingExercise.completedAt)) {
    throw new GraphQLError('Cannot add sets to completed exercise')
  }

  // Find the maximum existing order to ensure proper sequential ordering
  const maxOrder =
    trainingExercise.sets.length > 0
      ? Math.max(...trainingExercise.sets.map((set) => set.order || 1))
      : 0

  const newSet = await prisma.exerciseSet.create({
    data: {
      exerciseId: trainingExercise.id,
      order: maxOrder + 1,
      reps: set.minReps,
      minReps: set.minReps,
      maxReps: set.maxReps,
      weight: set.weight,
      rpe: set.rpe,
    },
  })

  return new ExerciseSet(newSet)
}

export const removeSetExerciseForm = async (
  setId: string,
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Get the set with its order and exercise information
  const set = await prisma.exerciseSet.findUnique({
    where: { id: setId },
    include: {
      exercise: {
        include: {
          sets: {
            orderBy: { order: 'asc' },
          },
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
    throw new Error('Set not found')
  }

  if (isEditPlanNotAllowed(user, set.exercise.completedAt)) {
    throw new GraphQLError('Cannot remove completed set')
  }
  const setOrder = set.order
  const exerciseId = set.exerciseId

  // Delete the set
  await prisma.exerciseSet.delete({
    where: { id: setId },
  })

  // Update order for remaining sets that have a higher order than the deleted set
  await prisma.exerciseSet.updateMany({
    where: {
      exerciseId: exerciseId,
      order: { gt: setOrder },
    },
    data: {
      order: { decrement: 1 },
    },
  })

  return true
}

// Helper function to handle completion cascade after set removal
const checkCompletionCascadeAfterSetRemoval = async (exerciseId: string) => {
  // 1. Check if all remaining sets in the exercise are completed
  const incompleteSets = await prisma.exerciseSet.count({
    where: {
      exerciseId,
      completedAt: null,
    },
  })

  if (incompleteSets > 0) {
    // If there are incomplete sets, no need to cascade further
    return
  }

  // 2. Mark exercise as completed if all sets are completed
  await prisma.trainingExercise.update({
    where: { id: exerciseId },
    data: { completedAt: new Date() },
  })

  // 3. Check if all exercises in the day are completed
  const day = await prisma.trainingDay.findFirst({
    where: {
      exercises: {
        some: { id: exerciseId },
      },
    },
    select: {
      id: true,
      weekId: true,
      exercises: {
        select: { completedAt: true },
      },
    },
  })

  if (!day) return

  const allExercisesCompleted = day.exercises.every((ex) => ex.completedAt)
  if (!allExercisesCompleted) {
    return
  }

  // 4. Mark day as completed if all exercises are completed
  await prisma.trainingDay.update({
    where: { id: day.id },
    data: { completedAt: new Date() },
  })

  // Update workout session event to complete
  await updateWorkoutSessionEvent(day.id, GQLWorkoutSessionEvent.Complete)

  // 5. Check if all days in the week are completed
  const week = await prisma.trainingWeek.findUnique({
    where: { id: day.weekId },
    select: {
      id: true,
      planId: true,
      days: { select: { completedAt: true, isRestDay: true } },
    },
  })

  if (!week) return

  const allDaysCompleted = week.days
    .filter((d) => !d.isRestDay)
    .every((d) => d.completedAt)
  if (!allDaysCompleted) {
    return
  }

  // 6. Mark week as completed if all days are completed
  await prisma.trainingWeek.update({
    where: { id: week.id },
    data: { completedAt: new Date() },
  })

  // 7. Check if all weeks in the plan are completed
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: week.planId },
    select: {
      id: true,
      weeks: { select: { completedAt: true } },
    },
  })

  if (!plan) return

  const allWeeksCompleted = plan.weeks.every((w) => w.completedAt)
  if (allWeeksCompleted) {
    // 8. Mark plan as completed if all weeks are completed
    await prisma.trainingPlan.update({
      where: { id: plan.id },
      data: { completedAt: new Date() },
    })
  }
}

// Helper function to handle completion cascade after set addition
const checkCompletionCascadeAfterSetAddition = async (exerciseId: string) => {
  // When adding a new set, we need to check if previously completed entities
  // should now be marked as incomplete since the new set won't be completed initially

  // 1. Check if the exercise was previously completed
  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    select: {
      completedAt: true,
      dayId: true,
    },
  })

  if (!exercise || !exercise.completedAt) {
    // Exercise wasn't completed, no cascade needed
    return
  }

  // 2. Mark exercise as incomplete since we added a new uncompleted set
  await prisma.trainingExercise.update({
    where: { id: exerciseId },
    data: { completedAt: null },
  })

  // 3. Check if the day was completed and mark it as incomplete
  const day = await prisma.trainingDay.findUnique({
    where: { id: exercise.dayId },
    select: {
      completedAt: true,
      weekId: true,
    },
  })

  if (!day || !day.completedAt) {
    // Day wasn't completed, no further cascade needed
    return
  }

  // 4. Mark day as incomplete
  await prisma.trainingDay.update({
    where: { id: exercise.dayId },
    data: { completedAt: null },
  })

  // Update workout session event to progress
  await updateWorkoutSessionEvent(
    exercise.dayId,
    GQLWorkoutSessionEvent.Progress,
  )

  // 5. Check if the week was completed and mark it as incomplete
  const week = await prisma.trainingWeek.findUnique({
    where: { id: day.weekId },
    select: {
      completedAt: true,
      planId: true,
    },
  })

  if (!week || !week.completedAt) {
    // Week wasn't completed, no further cascade needed
    return
  }

  // 6. Mark week as incomplete
  await prisma.trainingWeek.update({
    where: { id: day.weekId },
    data: { completedAt: null },
  })

  // 7. Check if the plan was completed and mark it as incomplete
  const plan = await prisma.trainingPlan.findUnique({
    where: { id: week.planId },
    select: {
      completedAt: true,
    },
  })

  if (!plan || !plan.completedAt) {
    // Plan wasn't completed, no further cascade needed
    return
  }

  // 8. Mark plan as incomplete
  await prisma.trainingPlan.update({
    where: { id: week.planId },
    data: { completedAt: null },
  })
}

// Helper function to update workout session events
const updateWorkoutSessionEvent = async (
  dayId: string,
  type: GQLWorkoutSessionEvent,
) => {
  const event = await prisma.workoutSessionEvent.findFirst({
    where: { dayId },
  })

  if (event) {
    await prisma.workoutSessionEvent.update({
      where: { id: event.id },
      data: { type },
    })
  }
}

export const swapExercise = async (
  exerciseId: string,
  substituteId: string,
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    include: {
      sets: {
        orderBy: { order: 'asc' },
      },
      base: {
        include: {
          substitutedBy: true,
          substitutes: {
            include: {
              substitute: true,
            },
          },
        },
      },
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
    console.error(
      `[TrainingExercise] Could not find exercise to swap: ${exerciseId}`,
    )
    throw new GraphQLError('We could not find the exercise to swap')
  }

  //Check if user wants to revert the substitution
  if (exercise.id === substituteId) {
    const revertedExercise = await prisma.trainingExercise.update({
      where: { id: exerciseId },
      data: {
        substitutedById: null,
      },
    })
    if (exercise.substitutedById) {
      await prisma.trainingExercise.delete({
        where: { id: exercise.substitutedById },
      })
    }
    return new TrainingExercise(revertedExercise, context)
  }
  const substitute = exercise.base?.substitutes.find(
    (s) => s.substituteId === substituteId,
  )

  if (!substitute) {
    console.error(
      `[TrainingExercise] Could not find substitute to swap: ${substituteId}`,
    )
    throw new GraphQLError('We could not find the substitute to swap')
  }

  // remove previous substitution
  if (exercise.substitutedById) {
    await prisma.trainingExercise.delete({
      where: { id: exercise.substitutedById },
    })
  }

  const newSubstitution = await prisma.trainingExercise.create({
    data: {
      baseId: substitute.substituteId,
      dayId: exercise.dayId,
      name: substitute.substitute.name,
      order: exercise.order,
      restSeconds: exercise.restSeconds,
      description: substitute.substitute.description,
      instructions: substitute.substitute.instructions,
      tips: substitute.substitute.tips,
      difficulty: substitute.substitute.difficulty,
      additionalInstructions: substitute.substitute.additionalInstructions,
      type: substitute.substitute.type,
      sets: {
        createMany: {
          data: exercise.sets.map((set) => ({
            order: set.order,
            minReps: set.minReps,
            maxReps: set.maxReps,
            weight: set.weight,
            rpe: set.rpe,
            reps: set.reps,
          })),
        },
      },
    },
  })

  await prisma.trainingExercise.update({
    where: { id: exerciseId },
    data: {
      substitutedById: newSubstitution.id,
    },
  })

  return new ExerciseSubstitute(newSubstitution, context)
}

export const addExercisesToQuickWorkout = async (
  exercises: { exerciseId: string; order: number }[],
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const quickWorkoutPlan = await prisma.trainingPlan.findFirst({
    where: {
      assignedToId: user.user.id,
      createdById: user.user.id,
    },
    include: {
      weeks: true,
    },
  })

  if (!quickWorkoutPlan) {
    throw new GraphQLError('Quick workout plan not found')
  }

  // Use UTC-based week start calculation
  const weekStart = getUTCWeekStart()
  const currentWeek = getISOWeek(weekStart)

  const hasCurrentWeek = quickWorkoutPlan.weeks.some((week) => {
    if (!week.scheduledAt) {
      return false
    }
    return isSameWeek(week.scheduledAt, weekStart)
  })

  if (!hasCurrentWeek) {
    // create a new week - wrap in try-catch to handle race condition
    try {
      await prisma.trainingWeek.create({
        data: {
          planId: quickWorkoutPlan.id,
          weekNumber: currentWeek,
          name: `Week ${currentWeek}`,
          scheduledAt: weekStart,
          isExtra: true,
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
      })
    } catch (error) {
      // Ignore unique constraint errors - week was created by another request
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code !== 'P2002'
      ) {
        throw error
      }
    }
  }

  const fullPlan = await getFullPlanById(quickWorkoutPlan.id)

  if (!fullPlan) {
    throw new GraphQLError('Quick workout plan not found')
  }

  // get plans todays day - Find the actual day using scheduledAt
  const today = startOfToday()

  // Find the current week first
  const currentWeekData = fullPlan.weeks.find((week) => {
    if (!week.scheduledAt) {
      return false
    }
    return isSameWeek(week.scheduledAt, weekStart)
  })

  if (!currentWeekData) {
    throw new GraphQLError('Current week not found')
  }

  // Then find the actual day within that week using scheduledAt
  const currentDay = currentWeekData.days.find(
    (d) => d.scheduledAt && isSameDay(d.scheduledAt, today),
  )

  if (!currentDay) {
    throw new GraphQLError('Day not found')
  }

  // Get current exercises to ensure proper ordering
  const existingExercises = await prisma.trainingExercise.findMany({
    where: {
      dayId: currentDay.id,
      isExtra: true,
    },
    select: { order: true },
    orderBy: { order: 'desc' },
    take: 1,
  })

  const maxExistingOrder = existingExercises[0]?.order || 0

  // Extract exercise IDs for database query
  const exerciseIds = exercises.map((ex) => ex.exerciseId)

  const baseExercises = await prisma.baseExercise.findMany({
    where: {
      id: { in: exerciseIds },
    },
    select: {
      id: true,
      name: true,
      description: true, // V1 description
      additionalInstructions: true, // V1 additional instructions
      instructions: true, // V2 instructions array
      tips: true, // V2 tips array
      type: true,
      difficulty: true,
    },
  })

  // Create a map for quick lookup
  const baseExerciseMap = new Map(baseExercises.map((ex) => [ex.id, ex]))

  const trainingExercises = await prisma.trainingExercise.createManyAndReturn({
    data: exercises.map((exerciseInput, index) => {
      const baseExercise = baseExerciseMap.get(exerciseInput.exerciseId)
      if (!baseExercise) {
        throw new GraphQLError(
          `Exercise with ID ${exerciseInput.exerciseId} not found`,
        )
      }

      // Ensure order is always after existing exercises to prevent conflicts
      const safeOrder = Math.max(
        exerciseInput.order,
        maxExistingOrder + index + 1,
      )

      return {
        baseId: baseExercise.id,
        name: baseExercise.name,
        order: safeOrder, // Use safe order to prevent conflicts
        description: baseExercise.description,
        instructions: baseExercise.instructions,
        tips: baseExercise.tips,
        difficulty: baseExercise.difficulty,
        additionalInstructions: baseExercise.additionalInstructions,
        type: baseExercise.type,
        isExtra: true,
        dayId: currentDay.id, // Use the actual day ID
      }
    }),
  })

  await prisma.exerciseSet.createMany({
    data: trainingExercises.map((exercise, index) => ({
      exerciseId: exercise.id,
      order: index + 1,
      isExtra: true,
    })),
  })

  const completedPlan = await getFullPlanById(quickWorkoutPlan.id)

  if (!completedPlan) {
    throw new GraphQLError('Quick workout plan not found')
  }

  return new TrainingPlan(completedPlan, context)
}

/**
 * Unified function to create a quick workout - works for both manual and AI flows
 * Accepts complete exercise data including sets with reps, RPE, etc.
 */
export const createQuickWorkout = async (
  input: GQLCreateQuickWorkoutInput,
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const quickWorkoutPlan = await prisma.trainingPlan.findFirst({
    where: {
      assignedToId: user.user.id,
      createdById: user.user.id,
    },
    include: {
      weeks: true,
    },
  })

  if (!quickWorkoutPlan) {
    throw new GraphQLError('Quick workout plan not found')
  }

  // Use UTC-based week start calculation
  const weekStart = getUTCWeekStart()
  const currentWeek = getISOWeek(weekStart)

  const hasCurrentWeek = quickWorkoutPlan.weeks.some((week) => {
    if (!week.scheduledAt) {
      return false
    }
    return isSameWeek(week.scheduledAt, weekStart)
  })

  if (!hasCurrentWeek) {
    // create a new week - wrap in try-catch to handle race condition
    try {
      await prisma.trainingWeek.create({
        data: {
          planId: quickWorkoutPlan.id,
          weekNumber: currentWeek,
          name: `Week ${currentWeek}`,
          scheduledAt: weekStart,
          isExtra: true,
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
      })
    } catch (error) {
      // Ignore unique constraint errors - week was created by another request
      if (
        error &&
        typeof error === 'object' &&
        'code' in error &&
        error.code !== 'P2002'
      ) {
        throw error
      }
    }
  }

  const fullPlan = await getFullPlanById(quickWorkoutPlan.id)

  if (!fullPlan) {
    throw new GraphQLError('Quick workout plan not found')
  }

  // Get the target day - either by dayId or today's date
  let currentDay

  if (input.dayId) {
    // Use specified day if provided
    currentDay = fullPlan.weeks
      .flatMap((week) => week.days)
      .find((day) => day.id === input.dayId)

    if (!currentDay) {
      throw new GraphQLError('Specified day not found')
    }
  } else {
    // Otherwise use today's day - Find the actual day using scheduledAt
    const today = startOfToday()

    // Find the current week first
    const currentWeekData = fullPlan.weeks.find((week) => {
      if (!week.scheduledAt) {
        return false
      }
      return isSameWeek(week.scheduledAt, weekStart)
    })

    if (!currentWeekData) {
      throw new GraphQLError('Current week not found')
    }

    // Then find the actual day within that week using scheduledAt
    currentDay = currentWeekData.days.find(
      (d) => d.scheduledAt && isSameDay(d.scheduledAt, today),
    )

    if (!currentDay) {
      throw new GraphQLError('Day not found')
    }
  }

  // If replaceExisting is true, remove all current extra exercises
  if (input.replaceExisting) {
    await prisma.trainingExercise.deleteMany({
      where: {
        dayId: currentDay.id,
        isExtra: true,
      },
    })
  }

  // Get current exercises to ensure proper ordering (only if not replacing)
  const existingExercises = input.replaceExisting
    ? []
    : await prisma.trainingExercise.findMany({
        where: {
          dayId: currentDay.id,
          isExtra: true,
        },
        select: { order: true },
        orderBy: { order: 'desc' },
        take: 1,
      })

  const maxExistingOrder = existingExercises[0]?.order || 0

  // Extract exercise IDs for database query
  const exerciseIds = input.exercises.map((ex) => ex.exerciseId)

  const baseExercises = await prisma.baseExercise.findMany({
    where: {
      id: { in: exerciseIds },
    },
    select: {
      id: true,
      name: true,
      description: true, // V1 description
      additionalInstructions: true, // V1 additional instructions
      instructions: true, // V2 instructions array
      tips: true, // V2 tips array
      type: true,
      difficulty: true,
    },
  })

  // Create a map for quick lookup
  const baseExerciseMap = new Map(baseExercises.map((ex) => [ex.id, ex]))

  // Create exercises and sets in a transaction
  await prisma.$transaction(async (tx) => {
    for (const [index, exerciseInput] of input.exercises.entries()) {
      const baseExercise = baseExerciseMap.get(exerciseInput.exerciseId)
      if (!baseExercise) {
        throw new GraphQLError(
          `Exercise with ID ${exerciseInput.exerciseId} not found`,
        )
      }

      // Ensure order is always after existing exercises to prevent conflicts
      const safeOrder = input.replaceExisting
        ? exerciseInput.order
        : Math.max(exerciseInput.order, maxExistingOrder + index + 1)

      // Create the training exercise
      const trainingExercise = await tx.trainingExercise.create({
        data: {
          baseId: baseExercise.id,
          name: baseExercise.name,
          order: safeOrder,
          description: baseExercise.description,
          instructions: baseExercise.instructions,
          tips: baseExercise.tips,
          difficulty: baseExercise.difficulty,
          additionalInstructions: baseExercise.additionalInstructions,
          type: baseExercise.type,
          isExtra: true,
          dayId: currentDay.id,
        },
      })

      // Create sets - use provided sets or create default ones
      const setsToCreate = exerciseInput.sets?.length
        ? exerciseInput.sets.map((set) => ({
            exerciseId: trainingExercise.id,
            order: set.order,
            reps: set.reps,
            minReps: set.minReps,
            maxReps: set.maxReps,
            rpe: set.rpe,
            weight: set.weight,
            isExtra: true,
          }))
        : [
            {
              exerciseId: trainingExercise.id,
              order: 1,
              reps: null,
              minReps: null,
              maxReps: null,
              rpe: null,
              weight: null,
              isExtra: true,
            },
          ]

      await tx.exerciseSet.createMany({
        data: setsToCreate,
      })
    }
  })

  const completedPlan = await getFullPlanById(quickWorkoutPlan.id)

  if (!completedPlan) {
    throw new GraphQLError('Quick workout plan not found')
  }

  return new TrainingPlan(completedPlan, context)
}
