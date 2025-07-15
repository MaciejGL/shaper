import { useState } from 'react'

import {
  GQLFitspaceGenerateAiWorkoutMutation,
  GQLRepFocus,
  GQLRpeRange,
  useFitspaceGenerateAiWorkoutMutation,
} from '@/generated/graphql-client'

import type {
  AiWorkoutInputData,
  RepFocus,
  RpeRange,
} from '../components/ai-workout-input'

export function useAiWorkoutGeneration() {
  // AI workout input state
  const [aiInputData, setAiInputData] = useState<AiWorkoutInputData>({
    selectedMuscleGroups: [],
    selectedEquipment: [],
    exerciseCount: 5,
    maxSetsPerExercise: 3,
    rpeRange: '7-8',
    repFocus: 'hypertrophy',
  })

  // AI generation state
  const [aiWorkoutResult, setAiWorkoutResult] = useState<
    GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout'] | null
  >(null)
  const [aiGenerationError, setAiGenerationError] = useState<string | null>(
    null,
  )

  // AI mutation hook
  const { mutateAsync: generateAiWorkout, isPending: isGeneratingAiWorkout } =
    useFitspaceGenerateAiWorkoutMutation({
      onSuccess: (data) => {
        setAiWorkoutResult(data.generateAiWorkout)
        setAiGenerationError(null)
      },
      onError: () => {
        setAiGenerationError('Failed to generate workout')
        setAiWorkoutResult(null)
      },
    })

  // AI generation handler
  const handleGenerateAiWorkout = async () => {
    try {
      // Map frontend types to GraphQL enum values
      const rpeRangeMap: Record<RpeRange, GQLRpeRange> = {
        '6-7': GQLRpeRange.Rpe_6_7,
        '7-8': GQLRpeRange.Rpe_7_8,
        '8-10': GQLRpeRange.Rpe_8_10,
      }

      const repFocusMap: Record<RepFocus, GQLRepFocus> = {
        strength: GQLRepFocus.Strength,
        hypertrophy: GQLRepFocus.Hypertrophy,
        endurance: GQLRepFocus.Endurance,
      }

      await generateAiWorkout({
        input: {
          selectedMuscleGroups: aiInputData.selectedMuscleGroups,
          selectedEquipment: aiInputData.selectedEquipment,
          exerciseCount: aiInputData.exerciseCount,
          maxSetsPerExercise: aiInputData.maxSetsPerExercise,
          rpeRange: rpeRangeMap[aiInputData.rpeRange],
          repFocus: repFocusMap[aiInputData.repFocus],
        },
      })
    } catch (error) {
      console.error('Failed to generate AI workout:', error)
    }
  }

  // Retry AI generation
  const handleRetryAiGeneration = () => {
    setAiGenerationError(null)
    setAiWorkoutResult(null)
    handleGenerateAiWorkout()
  }

  return {
    // State
    aiInputData,
    aiWorkoutResult,
    aiGenerationError,
    isGeneratingAiWorkout,

    // Actions
    setAiInputData,
    handleGenerateAiWorkout,
    handleRetryAiGeneration,
  }
}
