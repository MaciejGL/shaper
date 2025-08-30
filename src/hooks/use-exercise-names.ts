'use client'

import { useCallback, useEffect, useState } from 'react'

import { Exercise } from '@/components/exercises/types'

interface ExerciseName {
  id: string
  name: string
  isPublic: boolean
  isOwnExercise: boolean
}

interface UseExerciseNamesOptions {
  includePrivate?: boolean
}

/**
 * Hook to fetch all exercise names for duplicate detection
 * Returns minimal data needed for similarity checking
 */
export function useExerciseNames(options: UseExerciseNamesOptions = {}) {
  const [exerciseNames, setExerciseNames] = useState<ExerciseName[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExerciseNames = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (options.includePrivate) {
        params.append('includePrivate', 'true')
      }

      const response = await fetch(`/api/exercises/names?${params}`)
      if (!response.ok) {
        throw new Error('Failed to fetch exercise names')
      }

      const data = await response.json()
      setExerciseNames(data.exercises)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch exercise names',
      )
      setExerciseNames([])
    } finally {
      setLoading(false)
    }
  }, [options.includePrivate])

  useEffect(() => {
    fetchExerciseNames()
  }, [fetchExerciseNames])

  /**
   * Check if a non-public exercise has a similar public exercise
   */
  const hasSimilarPublicExercise = useCallback(
    (currentExercise: Exercise): boolean => {
      // Only check for non-public exercises
      if (currentExercise.isPublic || exerciseNames.length === 0) {
        return false
      }

      // Normalize the current exercise name for comparison
      const normalizedCurrentName = currentExercise.name.toLowerCase().trim()

      // Find a public exercise with the same name (case-insensitive)
      const similarPublicExercise = exerciseNames.find(
        (exercise) =>
          exercise.isPublic && // Must be public
          exercise.id !== currentExercise.id && // Different exercise
          exercise.name.toLowerCase().trim() === normalizedCurrentName, // Same name
      )

      return !!similarPublicExercise
    },
    [exerciseNames],
  )

  /**
   * Find a similar public exercise if one exists
   */
  const findSimilarPublicExercise = useCallback(
    (currentExercise: Exercise): ExerciseName | null => {
      // Only check for non-public exercises
      if (currentExercise.isPublic || exerciseNames.length === 0) {
        return null
      }

      // Normalize the current exercise name for comparison
      const normalizedCurrentName = currentExercise.name.toLowerCase().trim()

      // Find a public exercise with the same name (case-insensitive)
      const similarPublicExercise = exerciseNames.find(
        (exercise) =>
          exercise.isPublic && // Must be public
          exercise.id !== currentExercise.id && // Different exercise
          exercise.name.toLowerCase().trim() === normalizedCurrentName, // Same name
      )

      return similarPublicExercise || null
    },
    [exerciseNames],
  )

  return {
    exerciseNames,
    loading,
    error,
    refetch: fetchExerciseNames,
    hasSimilarPublicExercise,
    findSimilarPublicExercise,
  }
}
