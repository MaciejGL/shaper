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

  // AI generation state - now handles variants
  const [aiWorkoutResult, setAiWorkoutResult] = useState<
    GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout'] | null
  >(null)
  const [selectedVariantIndex, setSelectedVariantIndex] = useState<number>(0)
  const [aiGenerationError, setAiGenerationError] = useState<string | null>(
    null,
  )

  // AI mutation hook
  const { mutateAsync: generateAiWorkout, isPending: isGeneratingAiWorkout } =
    useFitspaceGenerateAiWorkoutMutation({
      onSuccess: (data) => {
        setAiWorkoutResult(data.generateAiWorkout)
        setSelectedVariantIndex(0) // Default to first variant
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

  // Handle exercise reordering for selected variant
  const handleExercisesReorder = (
    exercises: GQLFitspaceGenerateAiWorkoutMutation['generateAiWorkout']['variants'][number]['exercises'],
  ) => {
    if (aiWorkoutResult && aiWorkoutResult.variants) {
      const updatedVariants = [...aiWorkoutResult.variants]
      updatedVariants[selectedVariantIndex] = {
        ...updatedVariants[selectedVariantIndex],
        exercises: exercises,
      }
      setAiWorkoutResult({
        ...aiWorkoutResult,
        variants: updatedVariants,
      })
    }
  }

  // Get currently selected variant
  const selectedVariant =
    aiWorkoutResult?.variants?.[selectedVariantIndex] || null

  return {
    // State
    aiInputData,
    aiWorkoutResult,
    selectedVariant,
    selectedVariantIndex,
    aiGenerationError,
    isGeneratingAiWorkout,

    // Actions
    setAiInputData,
    setSelectedVariantIndex,
    handleGenerateAiWorkout,
    handleRetryAiGeneration,
    handleExercisesReorder,
  }
}
