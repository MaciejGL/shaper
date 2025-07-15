import { TrainingDay } from '@prisma/client'
import { TrainingExercise as TrainingExerciseType } from '@prisma/client'
import {
  addDays,
  getISOWeek,
  isSameDay,
  isSameWeek,
  startOfToday,
  startOfWeek,
} from 'date-fns'
import { GraphQLError } from 'graphql'

import {
  GQLAddAiExerciseToWorkoutInput,
  GQLAddSetExerciseFormInput,
  GQLCreateQuickWorkoutInput,
  GQLGenerateAiWorkoutInput,
  GQLUpdateExerciseFormInput,
  GQLWorkoutSessionEvent,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import {
  QUICK_WORKOUT_ASSISTANT_ID,
  createAssistantThread,
  getLastAssistantMessage,
  parseAssistantJsonResponse,
} from '@/lib/open-ai/assistant-utils'
import {
  CollaborationAction,
  checkTrainingPlanPermission,
} from '@/lib/permissions/collaboration-permissions'
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

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    exercise.day.week.plan.id,
    CollaborationAction.VIEW,
    'view training exercise',
  )

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

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    exercise.day.week.plan.id,
    CollaborationAction.EDIT,
    'update training exercise',
  )

  if (isEditPlanNotAllowed(user, exercise.completedAt)) {
    throw new GraphQLError('Cannot edit completed exercise')
  }

  // Prepare data for Prisma update (filter out null values)
  const updateData: Partial<TrainingExerciseType> = {
    name: exerciseUpdates.name ?? undefined,
    instructions: exerciseUpdates.instructions ?? null,
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

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    trainingDay.week.plan.id,
    CollaborationAction.EDIT,
    'add exercises to workout',
  )

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

  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

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

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    trainingDay.week.plan.id,
    CollaborationAction.EDIT,
    'add AI exercise to workout',
  )

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

export const removeExerciseFromWorkout = async (
  exerciseId: string,
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

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
      week: {
        include: {
          plan: { select: { id: true } },
        },
      },
    },
  })

  if (!workout) {
    throw new Error('Workout not found')
  }

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    workout.week.plan.id,
    CollaborationAction.EDIT,
    'remove exercise from workout',
  )

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

export const clearTodaysWorkout = async (context: GQLContext) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Find the user's quick workout plan
  const quickWorkoutPlan = await prisma.trainingPlan.findFirst({
    where: {
      assignedToId: user.user.id,
      createdById: user.user.id,
    },
    include: {
      weeks: {
        include: {
          days: {
            include: {
              exercises: {
                where: {
                  isExtra: true,
                },
                orderBy: {
                  order: 'asc',
                },
              },
            },
          },
        },
      },
    },
  })

  if (!quickWorkoutPlan) {
    throw new GraphQLError('Quick workout plan not found')
  }

  // Find today's day using the same logic as getTodaysWorkoutExercises
  const today = startOfToday()
  const todaysDay = quickWorkoutPlan.weeks
    .flatMap((week) => week.days)
    .find((day) => day.scheduledAt && isSameDay(day.scheduledAt, today))

  if (!todaysDay) {
    throw new GraphQLError("Today's workout day not found")
  }

  if (todaysDay.exercises.length === 0) {
    return true // Nothing to clear
  }

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    quickWorkoutPlan.id,
    CollaborationAction.EDIT,
    "clear today's workout",
  )

  // Remove all exercises from today's workout in a transaction
  await prisma.$transaction(async (tx) => {
    await tx.trainingExercise.deleteMany({
      where: {
        dayId: todaysDay.id,
        isExtra: true,
      },
    })

    // Check if all exercises are removed and mark day as completed if needed
    const remainingExercises = await tx.trainingExercise.findMany({
      where: {
        dayId: todaysDay.id,
      },
    })

    if (remainingExercises.length === 0) {
      await tx.trainingDay.update({
        where: { id: todaysDay.id },
        data: { completedAt: null },
      })
    }

    const allExercisesCompleted = remainingExercises.every(
      (exercise) => exercise.completedAt,
    )

    if (allExercisesCompleted) {
      await tx.trainingDay.update({
        where: { id: todaysDay.id },
        data: { completedAt: new Date() },
      })
    }
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

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    trainingExercise.day.week.plan.id,
    CollaborationAction.EDIT,
    'add set to exercise',
  )

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

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    exercise.day.week.plan.id,
    CollaborationAction.EDIT,
    'remove set from exercise',
  )

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

export const generateAiWorkout = async (
  input: GQLGenerateAiWorkoutInput,
  context: GQLContext,
) => {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  const {
    selectedMuscleGroups,
    selectedEquipment,
    exerciseCount,
    maxSetsPerExercise,
    rpeRange,
    repFocus,
  } = input

  /* 1. Build AI prompt based on user preferences */
  const muscleGroupsText =
    selectedMuscleGroups.length > 0
      ? `Target muscle groups: ${selectedMuscleGroups.join(', ')}`
      : 'Target all muscle groups for a full-body workout'

  const equipmentText =
    selectedEquipment.length > 0
      ? `Available equipment: ${selectedEquipment.join(', ')}`
      : 'Use bodyweight exercises and suggest equipment alternatives'

  /* Parse RPE and rep focus for the prompt */
  const rpeText = rpeRange.replace('RPE_', '').replace('_', '-')
  const repFocusText = repFocus.toLowerCase()
  const repRangeText =
    repFocus === 'STRENGTH'
      ? '3-8 reps'
      : repFocus === 'HYPERTROPHY'
        ? '8-12 reps'
        : '12-20 reps'

  /* 2. Create assistant thread with workout generation prompt using dedicated assistant */
  const thread = await createAssistantThread(
    [
      {
        role: 'user',
        content: `Generate a complete workout plan with the following requirements:
      
${muscleGroupsText}
${equipmentText}
- Number of exercises: ${exerciseCount}
- Maximum sets per exercise: ${maxSetsPerExercise}
- Target RPE range: ${rpeText} (Rate of Perceived Exertion)
- Training focus: ${repFocusText} with ${repRangeText}
- User trainer ID: ${context.user?.user.trainerId || 'none'}

CRITICAL RESTRICTION: ${selectedMuscleGroups.length > 0 ? `You MUST ONLY select exercises that target these specific muscle groups: ${selectedMuscleGroups.join(', ')}. ABSOLUTELY NO EXERCISES for other muscle groups like legs, shoulders, back, core, etc. unless they are specifically in the selected list. For example, if user selected "chest, biceps" then NO leg exercises, NO back exercises, NO shoulder exercises - ONLY chest and biceps exercises. Every single exercise must primarily target one of: ${selectedMuscleGroups.join(', ')}.` : 'Create a full-body workout targeting all major muscle groups.'}

Generate the workout based on these preferences.`,
      },
    ],
    QUICK_WORKOUT_ASSISTANT_ID,
  )

  /* 3. Get and parse assistant response */
  const assistantReply = await getLastAssistantMessage(thread.id)

  let aiResponse: {
    exercises: {
      id: string
      createdBy: string
      sets: number
      reps: number
      rpe: number
      explanation: string
    }[]
    summary: string
    reasoning: string
  }

  try {
    aiResponse = parseAssistantJsonResponse(assistantReply)

    // Ensure required fields exist, even if empty
    if (!aiResponse.exercises) {
      aiResponse.exercises = []
    }
    if (typeof aiResponse.summary !== 'string') {
      aiResponse.summary = ''
    }
    if (typeof aiResponse.reasoning !== 'string') {
      aiResponse.reasoning = ''
    }
  } catch (error) {
    console.error('[AI_WORKOUT] Failed to parse AI response:', error)
    console.error(
      '[AI_WORKOUT] Raw response that failed to parse:',
      assistantReply,
    )
    throw new GraphQLError('Failed to parse AI response. Please try again.')
  }
  console.info('aiResponse', aiResponse)
  /* 4. Validate and hydrate exercises from database */
  const requestedExerciseIds = aiResponse.exercises.map((e) => e.id)

  const baseExercises = await prisma.baseExercise.findMany({
    where: {
      id: { in: requestedExerciseIds },
      OR: [
        { isPublic: true }, // Public exercises
        { createdById: context.user?.user.trainerId }, // Trainer's exercises (if user has a trainer)
      ],
    },
    include: { muscleGroups: { include: { category: true } } },
  })

  console.info('requestedExerciseIds', requestedExerciseIds)
  console.info('baseExercises', baseExercises)

  if (baseExercises.length === 0) {
    throw new GraphQLError(
      'No suitable exercises found for the specified criteria',
    )
  }

  /* 5. Map AI response to final workout structure */
  const workoutExercises = baseExercises
    .map((exercise, index) => {
      const aiExercise = aiResponse.exercises.find((e) => e.id === exercise.id)!

      return {
        exercise: new BaseExercise(exercise, context),
        sets: Array.from({ length: aiExercise.sets }).map(() => ({
          reps: aiExercise.reps,
          rpe: aiExercise.rpe,
        })),
        order: index + 1, // Generate order since it's not in the AI response
        aiMeta: {
          explanation:
            aiExercise.explanation ||
            `Selected for targeting ${exercise.muscleGroups.map((mg) => mg.name).join(', ')}`,
        },
      }
    })
    .sort((a, b) => a.order - b.order) // Ensure proper ordering

  // Calculate duration based on sets: 45s per set + 90s break between sets
  // Sum all sets across all exercises, then apply the formula
  const totalSets = workoutExercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0,
  )
  const estimatedDuration = Math.round(totalSets * 0.75 + (totalSets - 1) * 1.5) // 45s per set + 90s break (in minutes)

  const finalResult = {
    exercises: workoutExercises,
    totalDuration: estimatedDuration,
    aiMeta: {
      summary:
        aiResponse.summary?.trim() ||
        `Generated ${workoutExercises.length} exercise workout targeting ${selectedMuscleGroups.length > 0 ? selectedMuscleGroups.join(', ') : 'all muscle groups'} with ${repFocusText} focus.`,
      reasoning:
        aiResponse.reasoning?.trim() ||
        `Selected exercises based on your preferences: ${muscleGroupsText}, ${equipmentText}, targeting ${rpeText} RPE with ${repFocusText} focus.`,
    },
  }

  return finalResult
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

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    trainingExercise.day.week.plan.id,
    CollaborationAction.EDIT,
    'add set to exercise form',
  )

  if (isEditPlanNotAllowed(user, trainingExercise.completedAt)) {
    throw new GraphQLError('Cannot add sets to completed exercise')
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

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    set.exercise.day.week.plan.id,
    CollaborationAction.EDIT,
    'remove set from exercise form',
  )

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

  // Check collaboration permissions
  await checkTrainingPlanPermission(
    context,
    user.user.id,
    exercise.day.week.plan.id,
    CollaborationAction.EDIT,
    'swap exercise',
  )
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

/**
 * Get the start of the current week in UTC
 * This ensures consistent week starts regardless of server timezone
 */
function getUTCWeekStart(date: Date = new Date()): Date {
  // Get the current week start in UTC
  const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000)
  const weekStart = startOfWeek(utcDate, { weekStartsOn: 1 })
  return new Date(weekStart.getTime() - date.getTimezoneOffset() * 60000)
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
    // create a new week
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
        instructions: baseExercise.description,
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
    // create a new week
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
          instructions: baseExercise.description,
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
