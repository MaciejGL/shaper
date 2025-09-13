import { useQueryClient } from '@tanstack/react-query'

import { useWorkout } from '@/context/workout-context/workout-context'
import type {
  GQLGetNoteRepliesQuery,
  GQLGetWorkoutExerciseNotesQuery,
  GQLUserRole,
} from '@/generated/graphql-client'

// Types
export type NotesArray =
  GQLGetWorkoutExerciseNotesQuery['workoutExerciseNotes'][number]['notes']

export type OptimisticNote = {
  __typename: 'Note'
  id: string
  text: string
  createdAt: string
  updatedAt: string
  shareWithTrainer?: boolean | null
  shareWithClient?: boolean | null
  createdBy: {
    __typename: 'UserPublic'
    id: string
    firstName?: string | null
    lastName?: string | null
    image?: string | null
    role: GQLUserRole
  }
  replies: OptimisticReply[]
}

export type OptimisticReply = {
  __typename?: 'Note'
  id: string
  text: string
  createdAt: string
  updatedAt: string
  shareWithTrainer?: boolean | null
  createdBy: {
    __typename?: 'UserPublic'
    id: string
    firstName?: string | null
    lastName?: string | null
    image?: string | null
    role: GQLUserRole
  }
}

// Query keys
export const NOTES_QUERY_KEYS = {
  WORKOUT_EXERCISE_NOTES: ['GetWorkoutExerciseNotes'] as const,
  NOTE_REPLIES: (noteId: string) => ['GetNoteReplies', { noteId }] as const,
  EXERCISE_NOTES: (exerciseName: string) =>
    ['GetExerciseNotes', { exerciseName }] as const,
} as const

// Factory functions
export const createOptimisticNote = (
  text: string,
  shareWithTrainer: boolean,
  shareWithClient?: boolean,
): OptimisticNote => ({
  __typename: 'Note',
  id: `temp-${Date.now()}`,
  text,
  shareWithTrainer,
  shareWithClient,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  createdBy: {
    __typename: 'UserPublic',
    id: 'temp-user',
    firstName: 'You',
    lastName: '',
    image: null,
    role: 'CLIENT' as GQLUserRole,
  },
  replies: [],
})

export const createOptimisticReply = (text: string): OptimisticReply => ({
  __typename: 'Note',
  id: `temp-reply-${Date.now()}`,
  text,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  shareWithTrainer: null,
  createdBy: {
    __typename: 'UserPublic',
    id: 'temp-user',
    firstName: 'You',
    lastName: '',
    image: null,
    role: 'CLIENT' as GQLUserRole,
  },
})

// Hook for optimistic note mutations
export function useOptimisticNotes(exerciseName: string) {
  const queryClient = useQueryClient()
  const { exercises } = useWorkout()

  // Generate the cache key with ALL exercises in the workout (batched)
  const allExerciseNames =
    exercises.map((ex) => ex.substitutedBy?.name || ex.name) || []

  const updateNotesCache = (updater: (notes: NotesArray) => NotesArray) => {
    // The actual query key includes ALL exercise names for the workout batch
    const queryKeyWithVariables = [
      'GetWorkoutExerciseNotes',
      { exerciseNames: allExerciseNames },
    ]

    const previousData =
      queryClient.getQueryData<GQLGetWorkoutExerciseNotesQuery>(
        queryKeyWithVariables,
      )

    queryClient.setQueryData<GQLGetWorkoutExerciseNotesQuery>(
      queryKeyWithVariables,
      (oldData) => {
        if (!oldData) {
          // Create initial data structure if cache is empty
          return {
            __typename: 'Query' as const,
            workoutExerciseNotes: [
              {
                __typename: 'WorkoutExerciseNotes' as const,
                exerciseName,
                notes: updater([]), // Start with empty array and apply updater
              },
            ],
          }
        }

        // Check if this exercise already exists in the cache
        const exerciseExists = oldData.workoutExerciseNotes.some(
          (ex) => ex.exerciseName === exerciseName,
        )

        if (exerciseExists) {
          // Update existing exercise
          return {
            ...oldData,
            workoutExerciseNotes: oldData.workoutExerciseNotes.map(
              (exerciseData) => {
                if (exerciseData.exerciseName === exerciseName) {
                  const updatedNotes = updater(exerciseData.notes)
                  return { ...exerciseData, notes: updatedNotes }
                }
                return exerciseData
              },
            ),
          }
        } else {
          // Add new exercise to cache
          return {
            ...oldData,
            workoutExerciseNotes: [
              ...oldData.workoutExerciseNotes,
              {
                __typename: 'WorkoutExerciseNotes' as const,
                exerciseName,
                notes: updater([]), // Start with empty array and apply updater
              },
            ],
          }
        }
      },
    )

    return previousData
  }

  const updateRepliesCache = (
    noteId: string,
    updater: (
      replies: GQLGetNoteRepliesQuery['noteReplies'],
    ) => GQLGetNoteRepliesQuery['noteReplies'],
  ) => {
    const queryKey = NOTES_QUERY_KEYS.NOTE_REPLIES(noteId)
    const previousData =
      queryClient.getQueryData<GQLGetNoteRepliesQuery>(queryKey)

    queryClient.setQueryData<GQLGetNoteRepliesQuery>(queryKey, (oldData) => {
      if (!oldData) return oldData
      return { ...oldData, noteReplies: updater(oldData.noteReplies || []) }
    })

    return previousData
  }

  const rollbackNotesCache = (
    previousData: GQLGetWorkoutExerciseNotesQuery | undefined,
  ) => {
    if (previousData) {
      const queryKeyWithVariables = [
        'GetWorkoutExerciseNotes',
        { exerciseNames: allExerciseNames },
      ]
      queryClient.setQueryData(queryKeyWithVariables, previousData)
    }
  }

  const rollbackRepliesCache = (
    noteId: string,
    previousData: GQLGetNoteRepliesQuery | undefined,
  ) => {
    if (previousData) {
      queryClient.setQueryData(
        NOTES_QUERY_KEYS.NOTE_REPLIES(noteId),
        previousData,
      )
    }
  }

  const invalidateQueries = async () => {
    const queryKeyWithVariables = [
      'GetWorkoutExerciseNotes',
      { exerciseNames: allExerciseNames },
    ]

    await Promise.all([
      queryClient.invalidateQueries({
        queryKey: queryKeyWithVariables,
      }),
      queryClient.invalidateQueries({
        queryKey: NOTES_QUERY_KEYS.EXERCISE_NOTES(exerciseName),
      }),
      // Also invalidate the generic key in case other queries use it
      queryClient.invalidateQueries({
        queryKey: NOTES_QUERY_KEYS.WORKOUT_EXERCISE_NOTES,
      }),
    ])
  }

  // Generic optimistic mutation wrapper
  const performOptimisticMutation = async (
    optimisticUpdate: () => GQLGetWorkoutExerciseNotesQuery | undefined,
    mutation: () => Promise<unknown>,
    onError?: (
      previousData: GQLGetWorkoutExerciseNotesQuery | undefined,
    ) => void,
  ) => {
    // Perform optimistic update IMMEDIATELY - user sees change right away
    const previousData = optimisticUpdate()

    // Run mutation in background - don't await it immediately
    try {
      await mutation()
      // Mutation succeeded - no need to do anything, optimistic update was correct
    } catch (error) {
      // Mutation failed - revert to previous state
      rollbackNotesCache(previousData)
      onError?.(previousData)
      console.error('Mutation failed, reverting optimistic update:', error)
      // Don't re-throw to avoid breaking the UI flow
    }
  }

  // Note-specific operations
  const addNoteOptimistically = (optimisticNote: OptimisticNote) =>
    updateNotesCache((notes) => [optimisticNote, ...notes])

  const updateNoteOptimistically = (
    noteId: string,
    updates: {
      text: string
      shareWithTrainer?: boolean
      shareWithClient?: boolean
    },
  ) =>
    updateNotesCache((notes) =>
      notes.map((note) =>
        note.id === noteId
          ? {
              ...note,
              text: updates.text,
              ...(updates.shareWithTrainer !== undefined && {
                shareWithTrainer: updates.shareWithTrainer,
              }),
              ...(updates.shareWithClient !== undefined && {
                shareWithClient: updates.shareWithClient,
              }),
              updatedAt: new Date().toISOString(),
            }
          : note,
      ),
    )

  const deleteNoteOptimistically = (noteId: string) =>
    updateNotesCache((notes) => notes.filter((note) => note.id !== noteId))

  const addReplyOptimistically = (
    noteId: string,
    optimisticReply: OptimisticReply,
  ) => updateRepliesCache(noteId, (replies) => [...replies, optimisticReply])

  return {
    // Cache operations
    updateNotesCache,
    updateRepliesCache,
    rollbackNotesCache,
    rollbackRepliesCache,

    // Optimistic operations
    addNoteOptimistically,
    updateNoteOptimistically,
    deleteNoteOptimistically,
    addReplyOptimistically,

    // Mutation wrapper
    performOptimisticMutation,

    // Query management
    invalidateQueries,
    queryClient,
  }
}

// Hook for optimistic reply mutations using batched cache
export function useOptimisticReplies(noteId: string) {
  const queryClient = useQueryClient()
  const { exercises } = useWorkout()

  // Generate the cache key with ALL exercises in the workout (batched)
  const allExerciseNames =
    exercises.map((ex) => ex.substitutedBy?.name || ex.name) || []

  const performOptimisticReplyMutation = async (
    optimisticReply: OptimisticReply,
    mutation: () => Promise<unknown>,
    onError?: () => void,
  ) => {
    const queryKeyWithVariables = [
      'GetWorkoutExerciseNotes',
      { exerciseNames: allExerciseNames },
    ]

    const previousData =
      queryClient.getQueryData<GQLGetWorkoutExerciseNotesQuery>(
        queryKeyWithVariables,
      )

    // Perform optimistic update IMMEDIATELY - user sees reply right away
    queryClient.setQueryData<GQLGetWorkoutExerciseNotesQuery>(
      queryKeyWithVariables,
      (oldData) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          workoutExerciseNotes: oldData.workoutExerciseNotes.map(
            (exerciseData) => ({
              ...exerciseData,
              notes: exerciseData.notes.map((note) => {
                if (note.id === noteId) {
                  return {
                    ...note,
                    replies: [...(note.replies || []), optimisticReply],
                  }
                }
                return note
              }),
            }),
          ),
        }
      },
    )

    // Run mutation in background
    try {
      await mutation()
      // Mutation succeeded - optimistic update was correct
    } catch (error) {
      // Mutation failed - revert to previous state
      queryClient.setQueryData(queryKeyWithVariables, previousData)
      onError?.()
      console.error(
        'Reply mutation failed, reverting optimistic update:',
        error,
      )
      // Don't re-throw to avoid breaking the UI flow
    }
  }

  const invalidateRepliesQuery = async () => {
    const queryKeyWithVariables = [
      'GetWorkoutExerciseNotes',
      { exerciseNames: allExerciseNames },
    ]

    await queryClient.invalidateQueries({
      queryKey: queryKeyWithVariables,
    })
  }

  return { performOptimisticReplyMutation, invalidateRepliesQuery }
}
