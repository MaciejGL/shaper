'use client'

import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { GQLFitspaceGetWorkoutQuery } from '@/generated/graphql-client'

const WorkoutContext = createContext<WorkoutContextType | null>(null)

type Plan = NonNullable<GQLFitspaceGetWorkoutQuery['getWorkout']>['plan']
type Navigation = NonNullable<
  GQLFitspaceGetWorkoutQuery['getWorkout']
>['navigation']

type WorkoutContextType = {
  plan: Plan
  navigation: Navigation
  activeWeek: Plan['weeks'][number]
  activeDay: Plan['weeks'][number]['days'][number]
  defaultWeek: Plan['weeks'][number]
  defaultDay: Plan['weeks'][number]['days'][number]
  setActiveWeek: (weekId: string) => void
  setActiveDay: (day: Plan['weeks'][number]['days'][number]) => void
}

export function WorkoutProvider({
  children,
  plan,
  navigation,
}: {
  children: ReactNode
  plan: NonNullable<GQLFitspaceGetWorkoutQuery['getWorkout']>['plan']
  navigation: NonNullable<
    GQLFitspaceGetWorkoutQuery['getWorkout']
  >['navigation']
}) {
  const defaultWeek = useMemo(
    () => plan.weeks[navigation.currentWeekIndex],
    [plan.weeks, navigation.currentWeekIndex],
  )
  const defaultDay = useMemo(
    () => defaultWeek?.days[navigation.currentDayIndex],
    [defaultWeek?.days, navigation.currentDayIndex],
  )
  const [activeWeek, setActiveWeek] =
    useState<Plan['weeks'][number]>(defaultWeek)
  const [activeDay, setActiveDay] =
    useState<Plan['weeks'][number]['days'][number]>(defaultDay)

  const handleSetActiveWeek = useCallback(
    (weekId: string) => {
      const week = plan.weeks.find((week) => week.id === weekId)
      if (week) {
        setActiveWeek(week)

        setActiveDay(week.days[activeDay.dayOfWeek])
      }
    },
    [plan.weeks, activeDay.dayOfWeek],
  )

  const value = useMemo(
    () => ({
      plan,
      navigation,
      activeWeek,
      activeDay,
      // Default
      defaultWeek,
      defaultDay,
      // Actions
      setActiveWeek: handleSetActiveWeek,
      setActiveDay,
    }),
    [
      plan,
      navigation,
      activeWeek,
      activeDay,
      setActiveDay,
      defaultWeek,
      defaultDay,
      handleSetActiveWeek,
    ],
  )

  console.log(
    value.plan.weeks[1].days[0].exercises[0].completedAt,
    activeWeek.days[0].exercises[0].completedAt,
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
