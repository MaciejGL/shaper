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
import { GQLFitspaceGetWorkoutQuery } from '@/generated/graphql-client'

import { getPreviousLogsByExercise } from './utils'

const WorkoutContext = createContext<WorkoutContextType | null>(null)

export type WorkoutContextPlan = NonNullable<
  GQLFitspaceGetWorkoutQuery['getWorkout']
>['plan']
type Navigation = NonNullable<
  GQLFitspaceGetWorkoutQuery['getWorkout']
>['navigation']

type WorkoutContextType = {
  plan?: WorkoutContextPlan
  navigation?: Navigation
  activeWeek?: WorkoutContextPlan['weeks'][number]
  activeDay?: WorkoutContextPlan['weeks'][number]['days'][number]
  setActiveWeekId: (weekId: string) => void
  setActiveDayId: (dayId: string) => void
  getPastLogs: (
    exercise: WorkoutExercise,
  ) => ReturnType<typeof getPreviousLogsByExercise>
}

export function WorkoutProvider({
  children,
  plan,
  navigation,
}: {
  children: ReactNode
  plan?: NonNullable<GQLFitspaceGetWorkoutQuery['getWorkout']>['plan']
  navigation?: NonNullable<
    GQLFitspaceGetWorkoutQuery['getWorkout']
  >['navigation']
}) {
  const [activeWeekId, setActiveWeekId] = useQueryState('week')
  const [activeDayId, setActiveDayId] = useQueryState('day')

  useEffect(() => {
    if (!activeWeekId || !activeDayId) {
      const defaultWeek = plan?.weeks[navigation?.currentWeekIndex ?? 0]
      const defaultDay = defaultWeek?.days[navigation?.currentDayIndex ?? 0]

      setActiveWeekId(defaultWeek?.id ?? '')
      setActiveDayId(defaultDay?.id ?? '')
    }
  }, [
    plan,
    navigation,
    activeWeekId,
    activeDayId,
    setActiveWeekId,
    setActiveDayId,
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

  const value = useMemo(
    () => ({
      plan,
      navigation,
      activeWeek: plan?.weeks.find((week) => week.id === activeWeekId),
      activeDay: plan?.weeks
        .find((week) => week.id === activeWeekId)
        ?.days.find((day) => day.id === activeDayId),
      setActiveWeekId: handleSetActiveWeek,
      setActiveDayId,
      getPastLogs,
    }),
    [
      plan,
      navigation,
      activeWeekId,
      activeDayId,
      handleSetActiveWeek,
      setActiveDayId,
      getPastLogs,
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
