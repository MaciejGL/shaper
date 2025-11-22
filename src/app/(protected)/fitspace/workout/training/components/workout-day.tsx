'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { use, useEffect, useMemo } from 'react'

import { WorkoutProvider } from '@/context/workout-context/workout-context'
import {
  GQLFitspaceGetQuickWorkoutDayQuery,
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceGetWorkoutNavigationQuery,
  useFitspaceGetWorkoutDayQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { Exercises } from './exercises'
import { SkeletonExercises } from './workout-page-skeleton'

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
        error: string
      }
  >
  isQuickWorkout?: boolean
}) => {
  const [dayId] = useQueryState('day')
  const { data: dayData } = use(dayDataPromise)
  const queryClient = useQueryClient()
  const router = useRouter()
  // Handle both getWorkoutDay (trainer plans) and getQuickWorkoutDay (quick workouts)
  const initialDay =
    'getWorkoutDay' in (dayData ?? {})
      ? (dayData as GQLFitspaceGetWorkoutDayQuery)?.getWorkoutDay
      : (dayData as GQLFitspaceGetQuickWorkoutDayQuery)?.getQuickWorkoutDay

  // Normalize Quick Workout data to match getWorkoutDay structure for consistent cache handling
  const normalizedInitialData = useMemo(():
    | GQLFitspaceGetWorkoutDayQuery
    | undefined => {
    if (!dayData) return undefined

    if ('getWorkoutDay' in dayData) {
      return dayData as GQLFitspaceGetWorkoutDayQuery
    }

    // Transform Quick Workout data to getWorkoutDay format
    const quickWorkoutData = dayData as GQLFitspaceGetQuickWorkoutDayQuery
    if (!quickWorkoutData?.getQuickWorkoutDay) return undefined

    return {
      getWorkoutDay: quickWorkoutData.getQuickWorkoutDay,
    }
  }, [dayData])

  const navigationData =
    queryClient.getQueryData<GQLFitspaceGetWorkoutNavigationQuery>([
      'navigation',
    ])

  // Check if current day is rest day
  const isRestDay = useMemo(() => {
    if (!dayId || !navigationData?.getWorkoutNavigation?.plan) return false
    for (const week of navigationData.getWorkoutNavigation.plan.weeks) {
      const day = week.days.find((d) => d.id === dayId)
      if (day) return day.isRestDay
    }
    return false
  }, [dayId, navigationData])

  // Check if we have any data (initial or cached) for the current dayId
  const hasDataForCurrentDay = useMemo(() => {
    if (isRestDay) return true // Rest days are always available (hardcoded)
    const hasInitialData = initialDay?.day?.id === dayId && initialDay
    const hasCachedData =
      dayId &&
      queryClient.getQueryData(useFitspaceGetWorkoutDayQuery.getKey({ dayId }))
    return hasInitialData || !!hasCachedData
  }, [initialDay, dayId, queryClient, isRestDay])

  // Rest day data
  const restDayData = useMemo(() => {
    if (!isRestDay || !dayId) return undefined
    let dayOfWeek = 0
    if (navigationData?.getWorkoutNavigation?.plan) {
      for (const week of navigationData.getWorkoutNavigation.plan.weeks) {
        const day = week.days.find((d) => d.id === dayId)
        if (day) {
          dayOfWeek = day.dayOfWeek
          break
        }
      }
    }
    return {
      getWorkoutDay: {
        day: {
          id: dayId,
          dayOfWeek,
          isRestDay: true,
          exercises: [],
          workoutType: null,
          scheduledAt: null,
          completedAt: null,
          startedAt: null,
          duration: null,
        },
        previousDayLogs: [],
      },
    } as GQLFitspaceGetWorkoutDayQuery
  }, [isRestDay, dayId, navigationData])

  const { data: dayDataQuery, isFetching } = useFitspaceGetWorkoutDayQuery(
    {
      dayId: dayId ?? '',
    },
    {
      initialData: isRestDay ? restDayData : normalizedInitialData,
      initialDataUpdatedAt: hasDataForCurrentDay || isRestDay ? Date.now() : 0,
      // Keep query enabled to subscribe to cache updates from optimistic mutations
      enabled: !!dayId,
      // But prevent unnecessary network requests when we have data
      refetchOnMount: !hasDataForCurrentDay && !isRestDay,
      refetchOnWindowFocus: false,
      staleTime: isRestDay ? Infinity : 0,
      retry: false,
    },
  )

  const isLoadingNewDay = isFetching && !hasDataForCurrentDay && !isRestDay

  // Redirect to workout home if no valid data (client-side only)
  useEffect(() => {
    if (!isFetching && !hasDataForCurrentDay && !isRestDay && !dayDataQuery) {
      router.replace('/fitspace/workout')
    }
  }, [isFetching, hasDataForCurrentDay, isRestDay, dayDataQuery, router])

  return (
    <WorkoutProvider
      exercises={
        dayDataQuery?.getWorkoutDay?.day?.exercises ??
        initialDay?.day?.exercises ??
        []
      }
    >
      <div className={cn('pb-4')}>
        {isLoadingNewDay ? (
          <SkeletonExercises />
        ) : (
          (dayDataQuery?.getWorkoutDay?.day ?? initialDay?.day) && (
            <Exercises
              day={dayDataQuery?.getWorkoutDay?.day ?? initialDay?.day}
              previousDayLogs={
                dayDataQuery?.getWorkoutDay?.previousDayLogs ??
                initialDay?.previousDayLogs
              }
              isQuickWorkout={isQuickWorkout}
            />
          )
        )}
      </div>
    </WorkoutProvider>
  )
}
