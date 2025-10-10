import { GraphQLError } from 'graphql'

import { GQLGenerateAiWorkoutInput } from '@/generated/graphql-server'
import {
  BaseExercise as PrismaBaseExercise,
  MuscleGroup as PrismaMuscleGroup,
  MuscleGroupCategory as PrismaMuscleGroupCategory,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { getExerciseVersionWhereClause } from '@/lib/exercise-version-filter'
import {
  QUICK_WORKOUT_ASSISTANT_ID,
  createAssistantThreadWithStreaming,
  parseAssistantJsonResponse,
} from '@/lib/open-ai/assistant-utils'
import { checkPremiumAccess } from '@/lib/subscription/subscription-validator'
import { GQLContext } from '@/types/gql-context'

import BaseExercise from '../base-exercise/model'

/**
 * Workout type mappings for muscle groups and descriptions
 */
const WORKOUT_TYPE_MAPPINGS = {
  'push-pull-legs': {
    push: ['Chest', 'Shoulders', 'Triceps'],
    pull: ['Lats', 'Upper Back', 'Traps', 'Biceps'],
    legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Inner Thighs'],
  },
  'upper-lower': {
    upper: [
      'Chest',
      'Lats',
      'Upper Back',
      'Traps',
      'Shoulders',
      'Biceps',
      'Triceps',
      'Forearms',
      'Abs',
      'Obliques',
      'LowerBack',
    ],
    lower: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Inner Thighs'],
  },
  split: {
    chest: ['Chest', 'Triceps'],
    back: ['Lats', 'Upper Back', 'Traps', 'Biceps'],
    legs: ['Quads', 'Hamstrings', 'Glutes', 'Calves', 'Inner Thighs'],
    shoulders: ['Shoulders', 'Abs', 'Obliques'],
    arms: ['Biceps', 'Triceps', 'Forearms'],
  },
} as const

const WORKOUT_TYPE_DESCRIPTIONS = {
  'push-pull-legs': {
    push: 'PUSH workout focusing on pressing movements for chest, shoulders, and triceps',
    pull: 'PULL workout focusing on pulling movements for lats, upper back, traps, and biceps',
    legs: 'LEG workout focusing on lower body with compound and isolation movements',
  },
  'upper-lower': {
    upper:
      'UPPER BODY workout targeting all upper body muscle groups with balanced distribution',
    lower:
      'LOWER BODY workout targeting all lower body muscle groups with compound and accessory movements',
  },
  split: {
    chest: 'CHEST & TRICEPS day focusing on pressing movements',
    back: 'BACK & BICEPS day focusing on pulling movements for lats, upper back, traps, and biceps',
    legs: 'LEG DAY focusing on quads, hamstrings, glutes, and calves',
    shoulders: 'SHOULDERS & ABS day with emphasis on deltoids and core',
    arms: 'ARM DAY focusing on biceps, triceps, and forearms',
  },
} as const

/**
 * Intensity mappings for different training focuses
 */
const INTENSITY_MAPPINGS = {
  STRENGTH: {
    reps: '4-8',
    sets: '3-5',
    description: 'Heavy loads, longer rest periods',
    progression: 'Linear progression with weight increases',
  },
  HYPERTROPHY: {
    reps: '8-15',
    sets: '3-4',
    description: 'Moderate loads, moderate rest',
    progression: 'Increasing volume over time',
  },
  ENDURANCE: {
    reps: '12-20',
    sets: '2-4',
    description: 'Lighter loads, shorter rest',
    progression: 'Increasing reps or reducing rest time',
  },
} as const

/**
 * TypeScript interfaces for AI workout generation
 */
type WorkoutVariant = {
  exercises: {
    id: string
    createdBy: string
    sets: number
    minReps: number
    maxReps: number
  }[]
}

type FinalWorkoutVariant = {
  name: string
  exercises: MappedExercise[]
  totalDuration: number
  summary: string
  reasoning: string
}

type BaseExerciseWithRelations = PrismaBaseExercise & {
  muscleGroups: (PrismaMuscleGroup & {
    category: PrismaMuscleGroupCategory
  })[]
  secondaryMuscleGroups: (PrismaMuscleGroup & {
    category: PrismaMuscleGroupCategory
  })[]
}

type MappedExercise = {
  exercise: BaseExercise
  sets: {
    reps: number
    minReps: number
    maxReps: number
    order: number
  }[]
  order: number
}

/**
 * Determines target muscle groups and workout context based on workout type
 */
function determineWorkoutContext(
  workoutType: string | null | undefined,
  workoutSubType: string | null | undefined,
  selectedMuscleGroups: string[],
): { targetMuscleGroups: string[]; workoutTypeContext: string } {
  let targetMuscleGroups = selectedMuscleGroups
  let workoutTypeContext = ''

  if (workoutType && workoutSubType) {
    const muscleGroups =
      WORKOUT_TYPE_MAPPINGS[
        workoutType as keyof typeof WORKOUT_TYPE_MAPPINGS
      ]?.[
        workoutSubType as keyof (typeof WORKOUT_TYPE_MAPPINGS)[keyof typeof WORKOUT_TYPE_MAPPINGS]
      ]
    const description =
      WORKOUT_TYPE_DESCRIPTIONS[
        workoutType as keyof typeof WORKOUT_TYPE_DESCRIPTIONS
      ]?.[
        workoutSubType as keyof (typeof WORKOUT_TYPE_DESCRIPTIONS)[keyof typeof WORKOUT_TYPE_DESCRIPTIONS]
      ]

    if (muscleGroups) {
      targetMuscleGroups = muscleGroups
      workoutTypeContext = description || ''
    }
  } else if (workoutType === 'fullbody') {
    workoutTypeContext =
      'FULL BODY workout with balanced distribution across all major muscle groups'
  }

  return { targetMuscleGroups, workoutTypeContext }
}

/**
 * Generates prompt for single workout variant with seed for variety
 */
function generateSingleVariantPrompt(
  workoutTypeContext: string,
  targetMuscleGroups: string[],
  selectedEquipment: string[],
  trainerPreference: string,
  exerciseCount: number,
  maxSetsPerExercise: number,
  repFocus: string,
): string {
  const intensity =
    INTENSITY_MAPPINGS[repFocus as keyof typeof INTENSITY_MAPPINGS]

  return `${workoutTypeContext || 'Full-body workout'}

Target Muscles: ${targetMuscleGroups.length > 0 ? targetMuscleGroups.join(', ') : 'All major muscle groups (chest, back, legs, shoulders, arms, core)'}

Equipment: ${selectedEquipment.length > 0 ? selectedEquipment.join(', ') : 'Any equipment'}

${trainerPreference}

Parameters:
- ${exerciseCount} exercises
- ${maxSetsPerExercise} sets maximum per exercise
- ${intensity.reps} reps (${repFocus} training)


Generate 1 workout variant.`
}

/**
 * Validates single workout variant response
 */
function validateSingleVariantResponse(
  parsedResponse: unknown,
): WorkoutVariant {
  // Handle both old format (workouts array) and new format (single workout)
  let workout: WorkoutVariant

  const response = parsedResponse as Record<string, unknown>

  if (
    typeof parsedResponse === 'object' &&
    parsedResponse !== null &&
    'workouts' in response &&
    Array.isArray(response.workouts)
  ) {
    // Old format - take first workout
    workout = (response.workouts as WorkoutVariant[])[0]
  } else if (
    typeof parsedResponse === 'object' &&
    parsedResponse !== null &&
    'exercises' in response &&
    Array.isArray(response.exercises)
  ) {
    // New format - direct workout object
    workout = parsedResponse as WorkoutVariant
  } else {
    throw new Error('Invalid single variant response structure')
  }

  if (!workout || !Array.isArray(workout.exercises)) {
    throw new Error(
      'Missing or invalid exercises array in single variant response',
    )
  }

  return workout
}

/**
 * Hydrates exercises from database
 */
async function hydrateExercisesFromDatabase(
  allExerciseIds: string[],
  context: GQLContext,
): Promise<BaseExerciseWithRelations[]> {
  const baseExercises = await prisma.baseExercise.findMany({
    where: {
      id: { in: allExerciseIds },
      OR: [
        {
          isPublic: true,
          ...getExerciseVersionWhereClause(),
        },
        {
          createdById: context.user?.user.trainerId,
          ...getExerciseVersionWhereClause(),
        },
      ],
    },
    include: {
      muscleGroups: { include: { category: true } },
      secondaryMuscleGroups: { include: { category: true } },
    },
  })

  return baseExercises
}

/**
 * Maps AI workout variant to final structure
 */
function mapWorkoutVariant(
  workout: WorkoutVariant,
  baseExercises: BaseExerciseWithRelations[],
  maxSetsPerExercise: number,
  context: GQLContext,
): MappedExercise[] {
  const workoutExercises = workout.exercises
    .map((aiExercise, index) => {
      const baseExercise = baseExercises.find((ex) => ex.id === aiExercise.id)
      if (!baseExercise) {
        return null
      }

      // Validate sets count
      const setsCount = Math.min(
        Math.max(1, aiExercise.sets),
        maxSetsPerExercise,
      )

      // Validate and use AI-provided values
      const minReps = Math.max(1, Math.min(50, aiExercise.minReps || 8))
      const maxReps = Math.max(
        minReps,
        Math.min(50, aiExercise.maxReps || minReps + 4),
      )

      return {
        exercise: new BaseExercise(baseExercise, context),
        sets: Array.from({ length: setsCount }, (_, setIndex) => ({
          reps: minReps,
          minReps: minReps,
          maxReps: maxReps,
          order: setIndex + 1,
        })),
        order: index + 1,
      }
    })
    .filter((exercise) => exercise !== null)

  return workoutExercises
}

/**
 * Calculates workout duration based on training focus
 */
function calculateWorkoutDuration(
  exercises: MappedExercise[],
  repFocus: string,
): number {
  const intensityMultiplier = {
    STRENGTH: 1.5, // Longer rest between heavy sets
    HYPERTROPHY: 1.2, // Moderate rest
    ENDURANCE: 0.8, // Shorter rest
  }

  const baseTimePerSet = 0.75 // 45 seconds
  const restTimeBetweenSets =
    1.5 * intensityMultiplier[repFocus as keyof typeof intensityMultiplier] // 90s adjusted for intensity

  const totalSets = exercises.reduce(
    (sum, exercise) => sum + (exercise?.sets.length ?? 0),
    0,
  )

  return Math.round(
    totalSets * baseTimePerSet + (totalSets - 1) * restTimeBetweenSets,
  )
}

/**
 * Generates a single workout variant with a specific seed for variety
 */
async function generateSingleWorkoutVariant(
  input: GQLGenerateAiWorkoutInput,
  context: GQLContext,
  variantSeed: number,
): Promise<FinalWorkoutVariant> {
  const {
    workoutType,
    workoutSubType,
    selectedMuscleGroups,
    selectedEquipment,
    exerciseCount,
    maxSetsPerExercise,
    repFocus,
  } = input

  // 1. Determine workout context
  const { targetMuscleGroups, workoutTypeContext } = determineWorkoutContext(
    workoutType,
    workoutSubType,
    selectedMuscleGroups,
  )

  // 2. Generate prompt for single variant
  const trainerPreference = context.user?.user.trainerId
    ? `Trainer ID: ${context.user.user.trainerId} (prioritize these exercises)`
    : ''

  const prompt = generateSingleVariantPrompt(
    workoutTypeContext,
    targetMuscleGroups,
    selectedEquipment,
    trainerPreference,
    exerciseCount,
    maxSetsPerExercise,
    repFocus,
  )

  // 3. Get AI response
  const assistantReply = await createAssistantThreadWithStreaming(
    [{ role: 'user', content: prompt }],
    QUICK_WORKOUT_ASSISTANT_ID,
  )

  // 4. Validate response
  let aiResponse: WorkoutVariant
  try {
    const parsedResponse = parseAssistantJsonResponse(assistantReply)
    aiResponse = validateSingleVariantResponse(parsedResponse)
  } catch (error) {
    throw new GraphQLError(
      `AI response format invalid for variant. Please try again.`,
    )
  }

  // 5. Hydrate exercises from database
  const allExerciseIds = aiResponse.exercises.map((e) => e.id)

  const baseExercises = await hydrateExercisesFromDatabase(
    allExerciseIds,
    context,
  )

  // 6. Validate exercises exist
  const foundIds = baseExercises.map((ex) => ex.id)
  const missingIds = allExerciseIds.filter((id) => !foundIds.includes(id))

  if (missingIds.length > 0) {
    aiResponse.exercises = aiResponse.exercises.filter((ex) =>
      foundIds.includes(ex.id),
    )
  }

  // Ensure variant has valid exercises
  if (aiResponse.exercises.length === 0) {
    throw new GraphQLError(
      `No valid exercises found for variant. Please try again.`,
    )
  }

  if (baseExercises.length === 0) {
    throw new GraphQLError(
      'No suitable exercises found for the specified criteria',
    )
  }

  // 7. Map workout variant
  const mappedExercises = mapWorkoutVariant(
    aiResponse,
    baseExercises,
    maxSetsPerExercise,
    context,
  )

  // 8. Calculate duration
  const totalDuration = calculateWorkoutDuration(mappedExercises, repFocus)

  // 9. Return final variant
  return {
    name: `Variant ${String.fromCharCode(64 + variantSeed)}`, // A, B
    exercises: mappedExercises,
    totalDuration,
    summary: '',
    reasoning: '',
  }
}

/**
 * Main function to generate AI workout (now using parallel generation)
 */
export async function generateAiWorkout(
  input: GQLGenerateAiWorkoutInput,
  context: GQLContext,
) {
  const user = context.user
  if (!user) {
    throw new GraphQLError('User not found')
  }

  // Check premium access
  const isTrainer = user.user.role === 'TRAINER'
  const hasPremium = isTrainer || (await checkPremiumAccess(user.user.id))
  if (!hasPremium) {
    throw new GraphQLError(
      'Premium subscription required for AI workout generation',
    )
  }

  const { selectedMuscleGroups, selectedEquipment, repFocus } = input

  console.info(
    '[AI_WORKOUT] Starting parallel generation of 2 workout variants',
  )

  // Generate both variants in parallel for maximum speed
  const [variant1, variant2] = await Promise.all([
    generateSingleWorkoutVariant(input, context, 1),
    generateSingleWorkoutVariant(input, context, 2),
  ])

  // Final validation
  if (variant1.exercises.length === 0 && variant2.exercises.length === 0) {
    throw new GraphQLError(
      'Unable to generate workout with selected criteria. Please adjust your preferences.',
    )
  }

  // Return final result
  const finalResult = {
    variants: [variant1, variant2].map((variant) => ({
      name: variant.name,
      exercises: variant.exercises,
      totalDuration: variant.totalDuration,
      summary: variant.summary,
      reasoning: variant.reasoning,
    })),
    aiMetadata: {
      selectedMuscleGroups,
      selectedEquipment,
      repFocus,
    },
  }

  return finalResult
}
