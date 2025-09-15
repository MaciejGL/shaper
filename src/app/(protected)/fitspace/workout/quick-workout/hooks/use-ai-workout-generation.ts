import { useState } from 'react'

import {
  GQLEquipment,
  GQLFitspaceGenerateAiWorkoutMutation,
  GQLRepFocus,
  GQLRpeRange,
  useFitspaceGenerateAiWorkoutMutation,
} from '@/generated/graphql-client'

export type RpeRange = '6-7' | '7-8' | '8-10'
export type RepFocus = 'strength' | 'hypertrophy' | 'endurance'

export interface AiWorkoutInputData {
  selectedMuscleGroups: string[]
  selectedEquipment: GQLEquipment[]
  exerciseCount: number
  maxSetsPerExercise: number
  rpeRange: RpeRange
  repFocus: RepFocus
}

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
        hypertrophy: GQLRepFocus.Hyprophy,
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

  // Handle exercise reordering
  const handleExercisesReorder = (
    exercises: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['exercises'],
  ) => {
    if (aiWorkoutResult) {
      setAiWorkoutResult({
        ...aiWorkoutResult,
        exercises: exercises,
      })
    }
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
    handleExercisesReorder,
  }
}
