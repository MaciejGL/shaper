'use client'

import { createContext, useContext } from 'react'

import { useUser } from '@/context/user-context'
import type { GQLFitspaceGetExercisesQuery } from '@/generated/graphql-client'

import { useAiSuggestions } from './use-ai-suggestions'

export type AiExerciseSuggestionsExercise = NonNullable<
  NonNullable<GQLFitspaceGetExercisesQuery['getExercises']>['publicExercises']
>[number]

interface AiExerciseSuggestionsContextValue {
  workoutType?: string
  allExercises: AiExerciseSuggestionsExercise[]
  selectedExerciseIds: string[]
  onToggleExercise: (exerciseId: string) => void
  hasPremium: boolean
  suggestions: ReturnType<typeof useAiSuggestions>['suggestions']
  context: string
  isLoading: boolean
  error: ReturnType<typeof useAiSuggestions>['error']
  hasSuggestions: boolean
  fetchSuggestions: ReturnType<typeof useAiSuggestions>['fetchSuggestions']
  reset: () => void
}

const AiExerciseSuggestionsContext =
  createContext<AiExerciseSuggestionsContextValue | null>(null)

export function AiExerciseSuggestionsProvider({
  workoutType,
  allExercises,
  selectedExerciseIds,
  onToggleExercise,
  children,
}: {
  workoutType?: string
  allExercises: AiExerciseSuggestionsExercise[]
  selectedExerciseIds: string[]
  onToggleExercise: (exerciseId: string) => void
  children: React.ReactNode
}) {
  const { hasPremium } = useUser()
  const {
    suggestions,
    context,
    isLoading,
    error,
    hasSuggestions,
    fetchSuggestions,
    reset,
  } = useAiSuggestions()

  return (
    <AiExerciseSuggestionsContext.Provider
      value={{
        workoutType,
        allExercises,
        selectedExerciseIds,
        onToggleExercise,
        hasPremium,
        suggestions,
        context,
        isLoading,
        error,
        hasSuggestions,
        fetchSuggestions,
        reset,
      }}
    >
      {children}
    </AiExerciseSuggestionsContext.Provider>
  )
}

export function useAiExerciseSuggestionsContext() {
  const ctx = useContext(AiExerciseSuggestionsContext)
  if (!ctx) {
    throw new Error(
      'useAiExerciseSuggestionsContext must be used within AiExerciseSuggestionsProvider',
    )
  }
  return ctx
}

