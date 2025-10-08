/**
 * Fine-tuned model version of AI workout generation
 * This replaces the Assistant API approach with a direct fine-tuned model call
 *
 * To use this:
 * 1. Complete fine-tuning in OpenAI dashboard
 * 2. Add OPENAI_FINETUNED_WORKOUT_MODEL_ID to .env
 * 3. Replace the old generateAiWorkout function with this one in factory.ts
 */
import { GraphQLError } from 'graphql'

import { GQLGenerateAiWorkoutInput } from '@/generated/graphql-server'
import { openai } from '@/lib/open-ai/open-ai'
import { checkPremiumAccess } from '@/lib/subscription/subscription-validator'
import { GQLContext } from '@/types/gql-context'

import { prisma } from '../../../lib/db'

const FINETUNED_MODEL_ID = process.env.OPENAI_FINETUNED_WORKOUT_MODEL_ID

export const generateAiWorkoutFineTuned = async (
  input: GQLGenerateAiWorkoutInput,
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
      'Premium subscription required for AI workout generation',
    )
  }

  // Check if fine-tuned model is configured
  if (!FINETUNED_MODEL_ID) {
    throw new GraphQLError(
      'Fine-tuned model not configured. Please set OPENAI_FINETUNED_WORKOUT_MODEL_ID',
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

  /* 1. Build simplified prompt for fine-tuned model */
  const muscleGroupsText =
    selectedMuscleGroups.length > 0
      ? `Target muscle groups: ${selectedMuscleGroups.join(', ')}`
      : 'Full-body workout with balanced muscle coverage'

  const equipmentText =
    selectedEquipment.length > 0
      ? `Available equipment: ${selectedEquipment.join(', ')}`
      : 'Use any available equipment or bodyweight'

  const rpeText = rpeRange.replace('RPE_', '').replace('_', '-')

  const userMessage = `Create a workout with the following requirements:

${muscleGroupsText}
${equipmentText}
Exercise count: ${exerciseCount}
Max sets per exercise: ${maxSetsPerExercise}
RPE range: ${rpeText}
Training focus: ${repFocus}

Provide a professional workout program with exercise selection, sets, reps, and RPE values.`

  /* 2. Call fine-tuned model */
  console.info(
    '[AI_WORKOUT_FINETUNED] Generating workout with fine-tuned model',
  )

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
    const completion = await openai.chat.completions.create({
      model: FINETUNED_MODEL_ID,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
      temperature: 0.7, // Some creativity but consistent
      response_format: { type: 'json_object' },
    })

    const responseContent = completion.choices[0]?.message?.content

    if (!responseContent) {
      throw new Error('No response from AI model')
    }

    aiResponse = JSON.parse(responseContent)

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
      `[AI_WORKOUT_FINETUNED] Successfully generated ${aiResponse.exercises.length} exercises`,
    )
  } catch (error) {
    console.error('[AI_WORKOUT_FINETUNED] Failed to generate workout:', error)
    throw new GraphQLError('AI response format invalid. Please try again.')
  }

  /* 3. Hydrate exercises from database (same as old version) */
  const requestedExerciseIds = aiResponse.exercises.map((e) => e.id)

  const dbExercises = await prisma.baseExercise.findMany({
    where: {
      id: { in: requestedExerciseIds },
      isPublic: true,
    },
    include: {
      muscleGroups: { select: { name: true } },
      secondaryMuscleGroups: { select: { name: true } },
    },
  })

  // Create a map for quick lookup
  const exerciseMap = new Map(dbExercises.map((ex) => [ex.id, ex]))

  // Validate that all requested exercises exist
  const missingExercises = requestedExerciseIds.filter(
    (id) => !exerciseMap.has(id),
  )

  if (missingExercises.length > 0) {
    console.warn(
      `[AI_WORKOUT_FINETUNED] Missing exercises: ${missingExercises.join(', ')}`,
    )
  }

  /* 4. Build final workout response */
  const workoutExercises = aiResponse.exercises
    .map((aiExercise, index) => {
      const dbExercise = exerciseMap.get(aiExercise.id)

      if (!dbExercise) {
        console.warn(
          `[AI_WORKOUT_FINETUNED] Skipping missing exercise: ${aiExercise.id}`,
        )
        return null
      }

      // Build sets array
      const sets = Array.from({ length: aiExercise.sets }, (_, setIndex) => ({
        order: setIndex,
        minReps: aiExercise.minReps,
        maxReps: aiExercise.maxReps,
        rpe: aiExercise.rpe,
      }))

      return {
        id: dbExercise.id,
        name: dbExercise.name,
        order: index,
        sets,
        equipment: dbExercise.equipment,
        muscleGroups: dbExercise.muscleGroups.map((m) => m.name),
        secondaryMuscleGroups: dbExercise.secondaryMuscleGroups.map(
          (m) => m.name,
        ),
        aiMetadata: {
          explanation: aiExercise.explanation || '',
          summary: aiResponse.summary || '',
          reasoning: aiResponse.reasoning || '',
        },
      }
    })
    .filter((exercise) => exercise !== null)

  // Calculate estimated duration
  const intensityMultiplier = {
    STRENGTH: 1.5,
    HYPERTROPHY: 1.2,
    ENDURANCE: 0.8,
  }

  const totalSets = workoutExercises.reduce(
    (sum, exercise) => sum + (exercise?.sets.length ?? 0),
    0,
  )

  const baseTimePerSet = 0.75
  const restTimeBetweenSets = 1.5 * intensityMultiplier[repFocus]

  const estimatedDuration = Math.round(
    totalSets * baseTimePerSet + (totalSets - 1) * restTimeBetweenSets,
  )

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
    `[AI_WORKOUT_FINETUNED] Generated workout with ${workoutExercises.length} exercises, ~${estimatedDuration} minutes`,
  )

  return finalResult
}
