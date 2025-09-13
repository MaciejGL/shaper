'use client'

import { ReactNode, createContext, useContext, useMemo } from 'react'

import {
  GQLFitspaceGetWorkoutDayQuery,
  GQLGetWorkoutExerciseNotesQuery,
} from '@/generated/graphql-client'
import { useWorkoutNotesBatch } from '@/hooks/use-workout-notes-batch'

const WorkoutContext = createContext<WorkoutContextType | null>(null)

export type WorkoutContextPlan = NonNullable<
  GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']
>['day']

type WorkoutContextType = {
  // Notes functionality - batched for all exercises in active day
  exercises: NonNullable<
    GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']
  >['day']['exercises']
  notesForExercise: (
    exerciseName: string,
  ) => GQLGetWorkoutExerciseNotesQuery['workoutExerciseNotes'][number]['notes']
  notesCountForExercise: (exerciseName: string) => number
  isNotesLoading: boolean
  notesError: unknown

  // Replies functionality - batched for all notes
  repliesForNote: (
    noteId: string,
  ) => GQLGetWorkoutExerciseNotesQuery['workoutExerciseNotes'][number]['notes'][number]['replies']
  repliesCountForNote: (noteId: string) => number
}

export function WorkoutProvider({
  children,
  exercises,
}: {
  children: ReactNode
  exercises: NonNullable<
    GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']
  >['day']['exercises']
}) {
  // Batch fetch notes for all exercises in the active day
  const notesBatch = useWorkoutNotesBatch(
    exercises.map((ex) => ({
      name: ex.substitutedBy?.name || ex.name,
      id: ex.substitutedBy?.id || ex.id,
    })) || [],
  )

  const value = useMemo(
    () => ({
      exercises,
      // Notes functionality - batched for all exercises
      notesForExercise: notesBatch.getNotesForExercise,
      notesCountForExercise: notesBatch.getNotesCountForExercise,
      isNotesLoading: notesBatch.isLoading,
      notesError: notesBatch.error,

      // Replies functionality - batched for all notes
      repliesForNote: notesBatch.getRepliesForNote,
      repliesCountForNote: notesBatch.getRepliesCountForNote,
    }),
    [
      exercises,
      notesBatch.getNotesForExercise,
      notesBatch.getNotesCountForExercise,
      notesBatch.isLoading,
      notesBatch.error,
      notesBatch.getRepliesForNote,
      notesBatch.getRepliesCountForNote,
    ],
  )

  return (
    <WorkoutContext.Provider value={value}>{children}</WorkoutContext.Provider>
  )
}

// Custom hook to use the training plan context
export function useWorkout() {
  const context = useContext(WorkoutContext)
  if (!context) {
    throw new Error('useWorkout must be used within a WorkoutProvider')
  }
  return context
}
