import { TrainingDay } from '@prisma/client'
import { TrainingExercise as TrainingExerciseType } from '@prisma/client'
import { GraphQLError } from 'graphql'
import { isNil } from 'lodash'

import {
  GQLAddAiExerciseToWorkoutInput,
  GQLAddSetExerciseFormInput,
  GQLUpdateExerciseFormInput,
  GQLWorkoutSessionEvent,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import {
  createAssistantThread,
  getLastAssistantMessage,
  parseAssistantJsonResponse,
} from '@/lib/open-ai/assistant-utils'
import { GQLContext } from '@/types/gql-context'

import BaseExercise from '../base-exercise/model'
import ExerciseSet from '../exercise-set/model'

import TrainingExercise, { ExerciseSubstitute } from './model'
import { ExerciseSuggestion } from './types'

// Focused function to get a single training exercise for form editing
export const getTrainingExercise = async (
  exerciseId: string,
  context: GQLContext,
) => {
  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    include: {
      sets: {
        orderBy: { order: 'asc' },
      },
      base: {
        include: {
          muscleGroups: true,
          substitutes: {
            include: {
              substitute: true,
            },
          },
        },
      },
    },
  })

  if (!exercise) {
    throw new GraphQLError('Exercise not found')
  }

  // Check if user has access to this exercise
  const trainingDay = await prisma.trainingDay.findFirst({
    where: {
      id: exercise.dayId,
      week: {
        plan: {
          OR: [{ createdById: context.user?.user.id }],
        },
      },
    },
  })

  if (!trainingDay) {
    throw new GraphQLError('Exercise not found or access denied')
  }

  return new TrainingExercise(exercise, context)
}

// Focused function to update exercise form data
export const updateExerciseForm = async (
  input: GQLUpdateExerciseFormInput,
  context: GQLContext,
) => {
  const { exerciseId, sets: inputSets, ...exerciseUpdates } = input

  // Verify user has access to this exercise
  const exercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    include: {
      day: {
        include: {
          week: {
            include: {
              plan: true,
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

  if (exercise.day.week.plan.createdById !== context.user?.user.id) {
    throw new GraphQLError('Access denied')
  }

  // Prepare data for Prisma update (filter out null values)
  const updateData: Partial<TrainingExerciseType> = {}
  if (exerciseUpdates.name !== undefined && exerciseUpdates.name !== null) {
    updateData.name = exerciseUpdates.name
  }
  if (!isNil(exerciseUpdates.instructions)) {
    updateData.instructions = exerciseUpdates.instructions
  }
  if (!isNil(exerciseUpdates.additionalInstructions)) {
    updateData.additionalInstructions = exerciseUpdates.additionalInstructions
  }
  if (!isNil(exerciseUpdates.type)) {
    updateData.type = exerciseUpdates.type
  }
  if (!isNil(exerciseUpdates.restSeconds)) {
    updateData.restSeconds = exerciseUpdates.restSeconds
  }
  if (!isNil(exerciseUpdates.warmupSets)) {
    updateData.warmupSets = exerciseUpdates.warmupSets
  }
  if (!isNil(exerciseUpdates.tempo)) {
    updateData.tempo = exerciseUpdates.tempo
  }

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
  if (exerciseIds.length > 3) {
    throw new GraphQLError('You can only add up to 3 exercises at a time')
  }

  const baseExericse = await prisma.baseExercise.findMany({
    where: {
      id: { in: exerciseIds },
    },
  })

  const trainingDay = await prisma.trainingDay.findUnique({
    where: {
      id: workoutId,
    },
    include: {
      exercises: true,
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
          instructions: ex.description,
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

  const baseExericse = await prisma.baseExercise.findUnique({
    where: {
      id: exerciseId,
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
      instructions: baseExericse.description,
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

export const removeExerciseFromWorkout = async (exerciseId: string) => {
  const workout = await prisma.trainingDay.findFirst({
    where: {
      exercises: {
        some: {
          id: exerciseId,
        },
      },
    },
    include: {
      exercises: true,
    },
  })

  if (!workout) {
    throw new Error('Workout not found')
  }

  const removedExercise = workout.exercises.find(
    (exercise) => exercise.id === exerciseId,
  )
  if (!removedExercise) {
    throw new Error('Exercise not found in workout')
  }

  await prisma.trainingExercise.delete({
    where: {
      id: exerciseId,
      isExtra: true,
    },
  })

  await prisma.trainingExercise.updateMany({
    where: {
      dayId: workout.id,
      isExtra: true,
      order: { gt: removedExercise.order },
    },
    data: {
      order: { decrement: 1 },
    },
  })

  const day = await prisma.trainingDay.findUnique({
    where: {
      id: workout.id,
    },
    include: {
      exercises: true,
    },
  })

  const allExercisesCompleted = day?.exercises.every(
    (exercise) => exercise.completedAt,
  )

  if (allExercisesCompleted) {
    await prisma.trainingDay.update({
      where: { id: workout.id },
      data: { completedAt: new Date() },
    })
  }

  if (!day) {
    throw new Error('Day not found')
  }

  return true
}

export const addSet = async (exerciseId: string) => {
  const trainingExercise = await prisma.trainingExercise.findUnique({
    where: {
      id: exerciseId,
    },
    include: {
      sets: {
        select: {
          id: true,
          isExtra: true,
        },
      },
    },
  })

  if (!trainingExercise) {
    throw new Error('Training exercise not found')
  }

  const set = await prisma.exerciseSet.create({
    data: {
      exerciseId: trainingExercise.id,
      order: trainingExercise.sets.length + 1,
      isExtra: true,
    },
  })

  // Check completion cascade after adding set
  await checkCompletionCascadeAfterSetAddition(exerciseId)

  return new ExerciseSet(set)
}

export const removeSet = async (setId: string) => {
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
    include: { muscleGroups: { include: { category: true } } },
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
  if (!context.user) {
    throw new Error('You are not authorized to add sets to this exercise')
  }

  const { exerciseId, set } = input

  const trainingExercise = await prisma.trainingExercise.findUnique({
    where: { id: exerciseId },
    include: {
      sets: {
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!trainingExercise) {
    throw new Error('Training exercise not found')
  }

  const newSet = await prisma.exerciseSet.create({
    data: {
      exerciseId: trainingExercise.id,
      order: trainingExercise.sets.length + 1,
      reps: set.minReps,
      minReps: set.minReps,
      maxReps: set.maxReps,
      weight: set.weight,
      rpe: set.rpe,
    },
  })

  return new ExerciseSet(newSet)
}

export const removeSetExerciseForm = async (setId: string) => {
  // Get the set with its order and exercise information
  const set = await prisma.exerciseSet.findUnique({
    where: { id: setId },
    include: {
      exercise: {
        include: {
          sets: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  })

  if (!set) {
    throw new Error('Set not found')
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
      instructions: substitute.substitute.description,
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
