'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { use, useEffect, useMemo } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { WorkoutProvider } from '@/context/workout-context/workout-context'
import {
  GQLFitspaceGetQuickWorkoutDayQuery,
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceGetWorkoutNavigationQuery,
  useFitspaceGetWorkoutDayQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { Exercises } from './exercises'

// Navigation pagination types
export type NavigationPlan = NonNullable<
  NonNullable<GQLFitspaceGetWorkoutNavigationQuery['getWorkoutNavigation']>
>['plan']
export type NavigationWeek = NonNullable<NavigationPlan>['weeks'][number]
export type NavigationDay = NonNullable<NavigationWeek>['days'][number]
export type WorkoutExercise = NonNullable<
  NonNullable<GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']>['day']
>['exercises'][number]

// Day data types
export type WorkoutDayData = NonNullable<
  GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']
>['day']

type DayData =
  | GQLFitspaceGetWorkoutDayQuery
  | GQLFitspaceGetQuickWorkoutDayQuery

export const WorkoutDay = ({
  dayDataPromise,
  isQuickWorkout = false,
}: {
  dayDataPromise: Promise<
    | {
        data: DayData
        error: null
      }
    | {
        data: null
        error: string | null
      }
  >
  isQuickWorkout?: boolean
}) => {
  const [dayId] = useQueryState('day')
  const { data: dayData } = use(dayDataPromise)
  const queryClient = useQueryClient()
  const router = useRouter()

  // Normalize data to consistent format
  const serverData = useMemo((): GQLFitspaceGetWorkoutDayQuery | undefined => {
    if (!dayData) return undefined
    if ('getWorkoutDay' in dayData) {
      return dayData as GQLFitspaceGetWorkoutDayQuery
    }
    const quickData = dayData as GQLFitspaceGetQuickWorkoutDayQuery
    if (!quickData?.getQuickWorkoutDay) return undefined
    return { getWorkoutDay: quickData.getQuickWorkoutDay }
  }, [dayData])

  const serverDayId = serverData?.getWorkoutDay?.day?.id

  // The effective dayId: use URL param, or fall back to server data
  const effectiveDayId = dayId ?? serverDayId
  const initialQueryData =
    effectiveDayId && serverDayId && effectiveDayId === serverDayId
      ? serverData
      : undefined

  // Check for rest day
  const navigationData =
    queryClient.getQueryData<GQLFitspaceGetWorkoutNavigationQuery>([
      'navigation',
    ])
  const isRestDay = useMemo(() => {
    if (!effectiveDayId || !navigationData?.getWorkoutNavigation?.plan)
      return false
    for (const week of navigationData.getWorkoutNavigation.plan.weeks) {
      const day = week.days.find((d) => d.id === effectiveDayId)
      if (day) return day.isRestDay
    }
    return false
  }, [effectiveDayId, navigationData])

  // Rest day placeholder data
  const restDayData = useMemo((): GQLFitspaceGetWorkoutDayQuery | undefined => {
    if (!isRestDay || !effectiveDayId) return undefined
    let dayOfWeek = 0
    if (navigationData?.getWorkoutNavigation?.plan) {
      for (const week of navigationData.getWorkoutNavigation.plan.weeks) {
        const day = week.days.find((d) => d.id === effectiveDayId)
        if (day) {
          dayOfWeek = day.dayOfWeek
          break
        }
      }
    }
    return {
      getWorkoutDay: {
        day: {
          id: effectiveDayId,
          dayOfWeek,
          isRestDay: true,
          exercises: [],
          workoutType: null,
          scheduledAt: null,
          completedAt: null,
          startedAt: null,
        },
        previousDayLogs: [],
      },
    } as GQLFitspaceGetWorkoutDayQuery
  }, [isRestDay, effectiveDayId, navigationData])

  // Simple query - cache is already seeded
  const { data: queryData, isFetching } = useFitspaceGetWorkoutDayQuery(
    { dayId: effectiveDayId ?? '' },
    {
      enabled: !!effectiveDayId && !isRestDay,
      initialData: initialQueryData,
      staleTime: 5 * 60 * 1000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      retry: false,
    },
  )

  // Use query data, rest day data, or server data (in that order)
  const currentData = isRestDay ? restDayData : (queryData ?? serverData)
  const currentDay = currentData?.getWorkoutDay?.day
  const previousDayLogs = currentData?.getWorkoutDay?.previousDayLogs

  // Loading state: fetching AND no data available
  const isLoading = isFetching && !currentDay && !isRestDay

  // Redirect if no data after fetch
  useEffect(() => {
    if (!isFetching && !currentDay && !isRestDay && effectiveDayId) {
      router.replace('/fitspace/workout')
    }
  }, [isFetching, currentDay, isRestDay, effectiveDayId, router])

  return (
    <WorkoutProvider exercises={currentDay?.exercises ?? []}>
      <div className={cn('pb-12')}>
        {isLoading ? (
          <div className="px-4 pt-4 space-y-6">
            <LoadingSkeleton variant="light" count={3} />
          </div>
        ) : (
          currentDay && (
            <Exercises
              day={currentDay}
              previousDayLogs={previousDayLogs}
              isQuickWorkout={isQuickWorkout}
            />
          )
        )}
      </div>
    </WorkoutProvider>
  )
}
