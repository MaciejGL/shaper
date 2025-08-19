'use client'

import { useMemo } from 'react'

import {
  GQLGetWorkoutExerciseNotesQuery,
  useGetWorkoutExerciseNotesQuery,
} from '@/generated/graphql-client'

/**
 * Optimized hook for loading notes for all exercises in a workout
 * Replaces 9+ individual GetExerciseNotes calls with 1 batch call
 */
export function useWorkoutNotesBatch(
  exercises: { name: string; id: string }[],
) {
  // Extract unique exercise names
  const exerciseNames = useMemo(() => {
    const unique = new Set(exercises.map((ex) => ex.name))
    return Array.from(unique)
  }, [exercises])

  // Use the batch query to load all exercise notes at once
  const { data, isLoading, error } = useGetWorkoutExerciseNotesQuery(
    { exerciseNames },
    {
      enabled: exerciseNames.length > 0,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
    },
  )

  // Convert batch results into easy-to-use map
  const notesByExercise = useMemo(() => {
    const map = new Map<
      string,
      GQLGetWorkoutExerciseNotesQuery['workoutExerciseNotes'][number]['notes']
    >()

    if (data?.workoutExerciseNotes) {
      data.workoutExerciseNotes.forEach((result) => {
        map.set(result.exerciseName, result.notes || [])
      })
    }

    // Ensure all requested exercises have entries (empty array if no notes)
    exerciseNames.forEach((name) => {
      if (!map.has(name)) {
        map.set(name, [])
      }
    })

    return map
  }, [data, exerciseNames])

  // Helper function to get notes for a specific exercise
  const getNotesForExercise = (exerciseName: string) => {
    return notesByExercise.get(exerciseName) || []
  }

  // Helper function to get note count for a specific exercise
  const getNotesCountForExercise = (exerciseName: string) => {
    return getNotesForExercise(exerciseName).length
  }

  // Helper function to get replies for a specific note
  const getRepliesForNote = (noteId: string) => {
    // Search through all exercises and notes to find the note with this ID
    if (data?.workoutExerciseNotes) {
      for (const exerciseData of data.workoutExerciseNotes) {
        const note = exerciseData.notes?.find((note) => note.id === noteId)
        if (note) {
          return note.replies || []
        }
      }
    }
    return []
  }

  // Helper function to get replies count for a specific note
  const getRepliesCountForNote = (noteId: string) => {
    return getRepliesForNote(noteId).length
  }

  return {
    // Status
    isLoading,
    error,

    // Helpers
    notesByExercise,
    getNotesForExercise,
    getNotesCountForExercise,

    // Reply helpers
    getRepliesForNote,
    getRepliesCountForNote,

    // Stats
    totalExercises: exerciseNames.length,
    exercisesWithNotes: Array.from(notesByExercise.entries()).filter(
      ([, notes]) => notes.length > 0,
    ).length,
  }
}

/**
 * Hook for individual exercise notes (fallback for non-workout contexts)
 * Uses the batch hook under the hood when possible
 */
export function useExerciseNotes(exerciseName: string) {
  const batchResult = useWorkoutNotesBatch([{ name: exerciseName, id: 'temp' }])

  return {
    notes: batchResult.getNotesForExercise(exerciseName),
    isLoading: batchResult.isLoading,
    error: batchResult.error,
    notesCount: batchResult.getNotesCountForExercise(exerciseName),
  }
}
