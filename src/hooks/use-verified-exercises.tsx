'use client'

import { useCallback, useEffect, useState } from 'react'

const VERIFIED_EXERCISES_KEY = 'shaper-verified-exercises'

/**
 * Hook to manage verified exercise IDs in localStorage
 * Used for personal marking/tracking by users
 */
export function useVerifiedExercises() {
  const [verifiedExerciseIds, setVerifiedExerciseIds] = useState<Set<string>>(
    new Set(),
  )

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(VERIFIED_EXERCISES_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setVerifiedExerciseIds(new Set(parsed))
        }
      }
    } catch (error) {
      console.warn(
        'Failed to load verified exercises from localStorage:',
        error,
      )
    }
  }, [])

  // Save to localStorage whenever the set changes
  const saveToStorage = useCallback((ids: Set<string>) => {
    try {
      localStorage.setItem(VERIFIED_EXERCISES_KEY, JSON.stringify([...ids]))
    } catch (error) {
      console.warn('Failed to save verified exercises to localStorage:', error)
    }
  }, [])

  // Toggle verified status for an exercise
  const toggleVerified = useCallback(
    (exerciseId: string) => {
      setVerifiedExerciseIds((prev) => {
        const newSet = new Set(prev)
        if (newSet.has(exerciseId)) {
          newSet.delete(exerciseId)
        } else {
          newSet.add(exerciseId)
        }
        saveToStorage(newSet)
        return newSet
      })
    },
    [saveToStorage],
  )

  // Check if an exercise is verified
  const isVerified = useCallback(
    (exerciseId: string) => {
      return verifiedExerciseIds.has(exerciseId)
    },
    [verifiedExerciseIds],
  )

  // Mark exercise as verified
  const markAsVerified = useCallback(
    (exerciseId: string) => {
      setVerifiedExerciseIds((prev) => {
        const newSet = new Set(prev)
        newSet.add(exerciseId)
        saveToStorage(newSet)
        return newSet
      })
    },
    [saveToStorage],
  )

  // Mark exercise as unverified
  const markAsUnverified = useCallback(
    (exerciseId: string) => {
      setVerifiedExerciseIds((prev) => {
        const newSet = new Set(prev)
        newSet.delete(exerciseId)
        saveToStorage(newSet)
        return newSet
      })
    },
    [saveToStorage],
  )

  // Clear all verified exercises
  const clearAllVerified = useCallback(() => {
    setVerifiedExerciseIds(new Set())
    saveToStorage(new Set())
  }, [saveToStorage])

  return {
    verifiedExerciseIds: [...verifiedExerciseIds],
    isVerified,
    toggleVerified,
    markAsVerified,
    markAsUnverified,
    clearAllVerified,
    totalVerified: verifiedExerciseIds.size,
  }
}
