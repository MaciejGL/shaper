'use client'

import { useQueryState } from 'nuqs'
import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
} from 'react'

import { WorkoutExercise } from '@/app/(protected)/fitspace/workout/[trainingId]/components/workout-page.client'
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  GQLFitspaceGetWorkoutQuery,
  GQLGetWorkoutExerciseNotesQuery,
} from '@/generated/graphql-client'
import { useWorkoutNotesBatch } from '@/hooks/use-workout-notes-batch'
import { getCurrentWeekAndDay } from '@/lib/get-current-week-and-day'

import { getPreviousLogsByExercise } from './utils'

const WorkoutContext = createContext<WorkoutContextType | null>(null)

export type WorkoutContextPlan = NonNullable<
  GQLFitspaceGetWorkoutQuery['getWorkout']
>['plan']

type WorkoutContextType = {
  plan?: WorkoutContextPlan

  activeWeek?: WorkoutContextPlan['weeks'][number]
  activeDay?: WorkoutContextPlan['weeks'][number]['days'][number]
  setActiveWeekId: (weekId: string) => void
  setActiveDayId: (dayId: string) => void
  getPastLogs: (
    exercise: WorkoutExercise,
  ) => ReturnType<typeof getPreviousLogsByExercise>

  // Notes functionality - batched for all exercises in active day
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
  plan,
}: {
  children: ReactNode
  plan?: NonNullable<GQLFitspaceGetWorkoutQuery['getWorkout']>['plan']
}) {
  const { preferences } = useUserPreferences()
  const [activeWeekId, setActiveWeekId] = useQueryState('week')
  const [activeDayId, setActiveDayId] = useQueryState('day')

  useEffect(() => {
    if (!activeWeekId || !activeDayId) {
      const { currentWeek, currentDay } = getCurrentWeekAndDay(
        plan?.weeks,
        preferences.weekStartsOn,
      )

      setActiveWeekId(currentWeek?.id ?? '')
      setActiveDayId(currentDay?.id ?? '')
    }
  }, [
    plan,
    activeWeekId,
    activeDayId,
    setActiveWeekId,
    setActiveDayId,
    preferences.weekStartsOn,
  ])

  const handleSetActiveWeek = useCallback(
    (weekId: string) => {
      const activeWeekIndex = plan?.weeks.findIndex(
        (week) => week.id === activeWeekId,
      )
      const activeDayIndex = plan?.weeks[activeWeekIndex ?? 0].days.findIndex(
        (day) => day.id === activeDayId,
      )

      const newWeekIndex = plan?.weeks.findIndex((week) => week.id === weekId)

      const newWeekId = plan?.weeks[newWeekIndex ?? 0].id
      const newDayId =
        plan?.weeks[newWeekIndex ?? 0].days[activeDayIndex ?? 0].id
      if (newWeekId && newDayId) {
        setActiveWeekId(newWeekId)
        setActiveDayId(newDayId)
      }
    },
    [plan?.weeks, activeDayId, activeWeekId, setActiveWeekId, setActiveDayId],
  )
  const getPastLogs = useCallback(
    (exercise: WorkoutExercise) =>
      getPreviousLogsByExercise(exercise, plan, activeWeekId),
    [plan, activeWeekId],
  )

  // Get active day for notes batching
  const activeDay = plan?.weeks
    .find((week) => week.id === activeWeekId)
    ?.days.find((day) => day.id === activeDayId)

  // Batch fetch notes for all exercises in the active day
  const notesBatch = useWorkoutNotesBatch(
    activeDay?.exercises.map((ex) => ({
      name: ex.substitutedBy?.name || ex.name,
      id: ex.substitutedBy?.id || ex.id,
    })) || [],
  )

  const value = useMemo(
    () => ({
      plan,

      activeWeek: plan?.weeks.find((week) => week.id === activeWeekId),
      activeDay,
      setActiveWeekId: handleSetActiveWeek,
      setActiveDayId,
      getPastLogs,

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
      plan,
      activeWeekId,
      activeDay,
      handleSetActiveWeek,
      setActiveDayId,
      getPastLogs,
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
