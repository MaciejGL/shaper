import { useMutation } from '@tanstack/react-query'
import { useCallback, useState } from 'react'

export interface ExerciseSuggestion {
  exerciseId: string
  exerciseName: string
  muscleGroup: string
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

export function useAiSuggestions() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const mutation = useMutation({
    mutationFn: fetchExerciseSuggestions,
    onSuccess: (data) => {
      // Pre-select first 2 suggestions
      const preSelected = new Set(
        data.suggestions.slice(0, 2).map((s) => s.exerciseId),
      )
      setSelectedIds(preSelected)
    },
  })

  const toggleSelection = useCallback((exerciseId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(exerciseId)) {
        next.delete(exerciseId)
      } else {
        next.add(exerciseId)
      }
      return next
    })
  }, [])

  const selectAll = useCallback(() => {
    if (mutation.data?.suggestions) {
      setSelectedIds(
        new Set(mutation.data.suggestions.map((s) => s.exerciseId)),
      )
    }
  }, [mutation.data])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const reset = useCallback(() => {
    mutation.reset()
    setSelectedIds(new Set())
  }, [mutation])

  const selectedExercises =
    mutation.data?.suggestions.filter((s) => selectedIds.has(s.exerciseId)) ||
    []

  return {
    suggestions: mutation.data?.suggestions || [],
    context: mutation.data?.context || '',
    isLoading: mutation.isPending,
    error: mutation.error,
    hasSuggestions: !!mutation.data,

    // Selection state
    selectedIds,
    selectedCount: selectedIds.size,
    selectedExercises,

    // Actions
    fetchSuggestions: mutation.mutate,
    toggleSelection,
    selectAll,
    clearSelection,
    reset,
  }
}
