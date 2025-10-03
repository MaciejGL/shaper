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
  GQLGenerateAiWorkoutInput,
  GQLUpdateExerciseFormInput,
  GQLWorkoutSessionEvent,
} from '@/generated/graphql-server'
import { TrainingDay } from '@/generated/prisma/client'
import { TrainingExercise as TrainingExerciseType } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { getExerciseVersionWhereClause } from '@/lib/exercise-version-filter'
import {
  QUICK_WORKOUT_ASSISTANT_ID,
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

  // Verify this is the user's quick workout (created by them and assigned to them)
  const plan = day.week.plan
  if (plan.assignedToId !== user.user.id || plan.createdById !== user.user.id) {
    throw new GraphQLError('Can only add exercises to your own quick workout')
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

  // Create training exercise with one set
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
        create: {
          order: 1,
          isExtra: true,
          reps: 10, // Default 10 reps
        },
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

  if (!day) {
    throw new Error('Day not found')
  }

  // Update day completion status based on remaining exercises
  const allExercisesCompleted =
    day.exercises.length > 0 &&
    day.exercises.every((exercise) => exercise.completedAt)

  await prisma.trainingDay.update({
    where: { id: workout.id },
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
  const hasPremium = await checkPremiumAccess(user.user.id)
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

  // Check if user has premium access for AI features
  const hasPremium = await checkPremiumAccess(user.user.id)
  if (!hasPremium) {
    throw new GraphQLError(
      'Premium subscription required for AI workout generation',
    )
  }

  const {
    selectedMuscleGroups,
    selectedEquipment,
    exerciseCount,
    maxSetsPerExercise,
    rpeRange,
    repFocus,
  } = input

  /* 1. Enhanced AI prompt based on user preferences */
  const muscleGroupsCondition =
    selectedMuscleGroups.length > 0
      ? `🎯 SPECIFIC MUSCLE FOCUS: Target ONLY these muscle groups: ${selectedMuscleGroups.join(', ')}
⚠️ CRITICAL: Do NOT include any exercises that primarily target other muscle groups. Every exercise must directly work at least one of the selected muscles.`
      : `🎯 FULL-BODY WORKOUT: Include exercises for all major muscle groups with balanced distribution:
   - Upper Body: Chest, Back, Shoulders, Arms (Biceps/Triceps)
   - Lower Body: Quads, Hamstrings, Glutes, Calves
   - Core: Abs, Obliques, Lower Back`

  const equipmentCondition =
    selectedEquipment.length > 0
      ? `🏋️ EQUIPMENT REQUIRED: Use ONLY equipment from this list: ${selectedEquipment.join(', ')}
   ⚠️ Always match exercises to available equipment. Prefer bodyweight alternatives when equipment is limited.`
      : `🏋️ EQUIPMENT FLEXIBILITY: Prioritize bodyweight exercises, suggest equipment alternatives when beneficial.`

  // Enhanced rep ranges and intensity
  const intensityMapping = {
    STRENGTH: {
      reps: '3-8',
      sets: `${Math.min(maxSetsPerExercise, 5)}-5`,
      description: 'Heavy loads, longer rest periods',
      progression: 'Linear progression with weight increases',
    },
    HYPERTROPHY: {
      reps: '8-15',
      sets: `${Math.min(maxSetsPerExercise, 4)}-4`,
      description: 'Moderate loads, moderate rest',
      progression: 'Increasing volume over time',
    },
    ENDURANCE: {
      reps: '12-20',
      sets: `2-${maxSetsPerExercise}`,
      description: 'Lighter loads, shorter rest',
      progression: 'Increasing reps or reducing rest time',
    },
  }

  const intensity = intensityMapping[repFocus]

  // RPE explanation
  const rpeText = rpeRange.replace('RPE_', '').replace('_', '-')
  const rpeValue = rpeText === '6-7' ? 7 : rpeText === '7-8' ? 8 : 9
  const rpeExplanation = {
    '6-7': 'Light to moderate intensity. You can maintain conversation easily.',
    '7-8': 'Moderate to hard intensity. Somewhat hard to talk.',
    '8-10': 'Hard to maximum intensity. Very difficult to talk.',
  }

  const trainerPreference = context.user?.user.trainerId
    ? `👨‍💼 TRAINER PRIORITY: Prioritize exercises created by trainer ID: ${context.user.user.trainerId}. These exercises are professionally curated and optimized.`
    : '👨‍💼 GENERAL EXERCISES: Use publicly available exercises from various trainers.'

  /* 2. Professional workout generation prompt */
  const thread = await createAssistantThread(
    [
      {
        role: 'user',
        content: `🏋️ PROFESSIONAL WORKOUT GENERATION REQUEST

${muscleGroupsCondition}

${equipmentCondition}

📊 WORKOUT PARAMETERS:
• Exercise Count: ${exerciseCount} exercises
• Sets per Exercise: ${maxSetsPerExercise} maximum
• Rep Range: ${intensity.reps} reps per set
• Target Sets: ${intensity.sets} sets
• Intensity (RPE): ${rpeText} - ${rpeExplanation[rpeText as keyof typeof rpeExplanation]}
• Training Type: ${repFocus.toLowerCase()} training (${intensity.description})

${trainerPreference}

🎯 QUALITY REQUIREMENTS:
1. **Exercise Selection**: Choose exercises that maximize training stimulus for the target muscles
2. **Progressive Overload**: Design sets/reps that allow progression over multiple sessions
3. **Movement Quality**: Prioritize exercises with full range of motion and proper muscle activation
4. **Balance**: Distribute training load appropriately across selected muscle groups
5. **Equipment Utilization**: Make optimal use of available equipment
6. **User Experience**: Ensure exercises are performable and safe for general fitness levels

📝 RESPONSE FORMAT:
Provide exactly ${exerciseCount} exercises in this JSON format:
{
  "exercises": [
    {
      "id": "exercise_uuid_from_database",
      "createdBy": "creator_user_id_from_database",
      "sets": ${Math.min(maxSetsPerExercise, 4)},
      "minReps": 8,
      "maxReps": 10,
      "rpe": ${rpeValue},
      "explanation": "Brief rationale for exercise selection (1-2 sentences)"
    }
  ],
  "summary": "Workout overview: main focus areas and training approach",
  "reasoning": "Professional explanation of exercise selection logic and programming rationale"
}

⚠️ CRITICAL REP RANGE RULES:
- Rep ranges must be NARROW (2-4 reps difference maximum)
- ${repFocus === 'STRENGTH' ? 'Strength examples: 3-5, 4-6, 5-8 reps' : repFocus === 'HYPERTROPHY' ? 'Hypertrophy examples: 8-10, 10-12, 12-15 reps' : 'Endurance examples: 12-15, 15-18, 18-20 reps'}
- Compound exercises: Use lower rep ranges within the target
- Isolation exercises: Use higher rep ranges within the target
- NEVER use wide ranges like 8-15 or 3-12

🔥 CRITICAL: Only select exercises from the available exercise database. Each exercise ID must correspond to an actual exercise in the system.`,
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
      minReps: number
      maxReps: number
      rpe: number
      explanation: string
    }[]
    summary: string
    reasoning: string
  }

  try {
    aiResponse = parseAssistantJsonResponse(assistantReply)

    // Validate response structure
    if (!aiResponse || typeof aiResponse !== 'object') {
      throw new Error('Invalid response structure')
    }

    if (!Array.isArray(aiResponse.exercises)) {
      throw new Error('Missing or invalid exercises array')
    }

    // Ensure required fields exist and are valid
    if (!aiResponse.summary || typeof aiResponse.summary !== 'string') {
      aiResponse.summary = 'AI-generated workout'
    }
    if (!aiResponse.reasoning || typeof aiResponse.reasoning !== 'string') {
      aiResponse.reasoning = 'Professional exercise selection'
    }

    console.info(
      `[AI_WORKOUT] Successfully parsed response with ${aiResponse.exercises.length} exercises`,
    )
  } catch (error) {
    console.error('[AI_WORKOUT] Failed to parse AI response:', error)
    console.error(
      '[AI_WORKOUT] Raw response:',
      assistantReply?.substring(0, 500) + '...',
    )
    throw new GraphQLError('AI response format invalid. Please try again.')
  }

  /* 4. Enhanced validation and hydration of exercises from database */
  const requestedExerciseIds = aiResponse.exercises.map((e) => e.id)
  console.info(
    `[AI_WORKOUT] Looking up exercise IDs: ${requestedExerciseIds.join(', ')}`,
  )

  const baseExercises = await prisma.baseExercise.findMany({
    where: {
      id: { in: requestedExerciseIds },
      OR: [
        {
          isPublic: true,
          ...getExerciseVersionWhereClause(),
        },
        {
          createdById: context.user?.user.trainerId,
          ...getExerciseVersionWhereClause(),
        }, // Trainer's exercises (if user has a trainer)
      ],
    },
    include: {
      muscleGroups: { include: { category: true } },
      secondaryMuscleGroups: { include: { category: true } },
    },
  })

  console.info(
    `[AI_WORKOUT] Found ${baseExercises.length} valid exercises from database`,
  )

  // Validate that all requested exercises were found
  const foundIds = baseExercises.map((ex) => ex.id)
  const missingIds = requestedExerciseIds.filter((id) => !foundIds.includes(id))

  if (missingIds.length > 0) {
    console.warn(`[AI_WORKOUT] Missing exercise IDs: ${missingIds.join(', ')}`)
    // Filter out exercises that don't exist in database
    aiResponse.exercises = aiResponse.exercises.filter((ex) =>
      foundIds.includes(ex.id),
    )
  }

  if (aiResponse.exercises.length === 0) {
    throw new GraphQLError('No valid exercises found. Please try again.')
  }

  console.info('requestedExerciseIds', requestedExerciseIds)
  console.info('baseExercises', baseExercises)

  if (baseExercises.length === 0) {
    throw new GraphQLError(
      'No suitable exercises found for the specified criteria',
    )
  }

  /* 5. Enhanced mapping of AI response to final workout structure */
  const workoutExercises = aiResponse.exercises
    .map((aiExercise, index) => {
      const baseExercise = baseExercises.find((ex) => ex.id === aiExercise.id)
      if (!baseExercise) {
        console.warn(
          `[AI_WORKOUT] Exercise ${aiExercise.id} not found in database`,
        )
        return null
      }

      // Validate sets count
      const setsCount = Math.min(
        Math.max(1, aiExercise.sets),
        maxSetsPerExercise,
      )

      // Use AI-provided minReps and maxReps directly
      console.info(`[AI_WORKOUT] Processing exercise ${aiExercise.id}:`, {
        minReps: aiExercise.minReps,
        maxReps: aiExercise.maxReps,
        sets: aiExercise.sets,
        rpe: aiExercise.rpe,
      })

      // Validate and use AI-provided values
      const minReps = Math.max(1, Math.min(50, aiExercise.minReps || 8))
      const maxReps = Math.max(
        minReps,
        Math.min(50, aiExercise.maxReps || minReps + 4),
      )
      const rpe = Math.max(1, Math.min(10, aiExercise.rpe || 8))

      console.info(
        `[AI_WORKOUT] Using reps range for ${aiExercise.id}: ${minReps}-${maxReps}, RPE: ${rpe}`,
      )

      return {
        exercise: new BaseExercise(baseExercise, context),
        sets: Array.from({ length: setsCount }, (_, setIndex) => ({
          reps: minReps, // Use minReps as the primary display value
          minReps: minReps,
          maxReps: maxReps,
          rpe: rpe,
          order: setIndex + 1,
        })),
        order: index + 1,
        aiMeta: {
          explanation:
            aiExercise.explanation || `Selected for muscle group targeting`,
          summary: aiResponse.summary || '',
          reasoning: aiResponse.reasoning || '',
        },
      }
    })
    .filter((exercise) => exercise !== null)

  // Enhanced duration calculation based on training type
  const intensityMultiplier = {
    STRENGTH: 1.5, // Longer rest between heavy sets
    HYPERTROPHY: 1.2, // Moderate rest
    ENDURANCE: 0.8, // Shorter rest
  }

  const totalSets = workoutExercises.reduce(
    (sum, exercise) => sum + (exercise?.sets.length ?? 0),
    0,
  )

  const baseTimePerSet = 0.75 // 45 seconds
  const restTimeBetweenSets = 1.5 * intensityMultiplier[repFocus] // 90s adjusted for intensity

  const estimatedDuration = Math.round(
    totalSets * baseTimePerSet + (totalSets - 1) * restTimeBetweenSets,
  )

  // If no valid exercises found, provide fallback
  if (workoutExercises.length === 0) {
    throw new GraphQLError(
      'Unable to generate workout with selected criteria. Please adjust your preferences.',
    )
  }

  const finalResult = {
    exercises: workoutExercises,
    totalDuration: estimatedDuration,
    aiMetadata: {
      summary: aiResponse.summary,
      reasoning: aiResponse.reasoning,
      selectedMuscleGroups,
      selectedEquipment,
      repFocus,
      rpeRange,
    },
  }

  console.info(
    `[AI_WORKOUT] Generated workout with ${workoutExercises.length} exercises, ~${estimatedDuration} minutes`,
  )

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
