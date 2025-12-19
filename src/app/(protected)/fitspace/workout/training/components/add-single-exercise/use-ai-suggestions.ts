import { useMutation } from '@tanstack/react-query'
import { useCallback } from 'react'

export type ExerciseSuggestionRole =
  | 'activation'
  | 'primary_compound'
  | 'secondary_compound'
  | 'accessory'
  | 'isolation'

export interface ExerciseSuggestion {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
  role: ExerciseSuggestionRole
}

export interface SuggestionsResponse {
  suggestions: ExerciseSuggestion[]
  context: string
}

interface FetchSuggestionsParams {
  workoutType?: string
}

async function fetchExerciseSuggestions(
  params?: FetchSuggestionsParams,
): Promise<SuggestionsResponse> {
  const response = await fetch('/api/ai/exercise-suggestions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ workoutType: params?.workoutType }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Failed to fetch suggestions')
  }

  return response.json()
}

interface UseAiSuggestionsParams {
  onSuggestionsLoaded?: (exerciseIds: string[]) => void
}

export function useAiSuggestions({
  onSuggestionsLoaded,
}: UseAiSuggestionsParams = {}) {
  const mutation = useMutation({
    mutationFn: fetchExerciseSuggestions,
    onSuccess: (data) => {
      const compoundIds = data.suggestions
        .filter(
          (s) =>
            s.role === 'primary_compound' || s.role === 'secondary_compound',
        )
        .map((s) => s.exerciseId)

      const idsToSelect =
        compoundIds.length >= 2
          ? compoundIds.slice(0, 2)
          : data.suggestions.slice(0, 2).map((s) => s.exerciseId)

      onSuggestionsLoaded?.(idsToSelect)
    },
  })

  const reset = useCallback(() => {
    mutation.reset()
  }, [mutation])

  return {
    suggestions: mutation.data?.suggestions || [],
    context: mutation.data?.context || '',
    isLoading: mutation.isPending,
    error: mutation.error,
    hasSuggestions: !!mutation.data,
    fetchSuggestions: mutation.mutate,
    reset,
  }
}
