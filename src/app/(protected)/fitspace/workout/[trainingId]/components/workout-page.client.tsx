'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { Suspense, use, useEffect, useMemo } from 'react'

import { WorkoutProvider } from '@/context/workout-context/workout-context'
import {
  GQLFitspaceGetQuickWorkoutDayQuery,
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceGetWorkoutNavigationQuery,
  useFitspaceGetWorkoutDayQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { Exercises } from './exercises'
import { COUNTER_MAIN_PADDING } from './navigation'
import { NavigationWrapper } from './navigation-wrapper'
import { SkeletonExercises, SkeletonNavigation } from './workout-page-skeleton'

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

type WorkoutPageClientNewProps = {
  navigationPromise: Promise<
    | {
        data: GQLFitspaceGetWorkoutNavigationQuery
        error: null
      }
    | {
        data: null
        error: string
      }
  >
  dayPromise: Promise<
    | {
        data: DayData
        error: null
      }
    | {
        data: null
        error: string
      }
  >
  trainingId: string
}

export function WorkoutPageClientNew({
  navigationPromise,
  dayPromise,
  trainingId,
}: WorkoutPageClientNewProps) {
  const [dayId] = useQueryState('day')
  const isQuickWorkout = trainingId === 'quick-workout'

  return (
    <div>
      <Suspense fallback={<SkeletonNavigation />}>
        <NavigationWrapper
          navigationDataPromise={navigationPromise}
          trainingId={trainingId}
        />
      </Suspense>
      <Suspense fallback={<SkeletonExercises />}>
        <WorkoutDay
          dayId={dayId}
          dayDataPromise={dayPromise}
          isQuickWorkout={isQuickWorkout}
        />
      </Suspense>
    </div>
  )
}

const WorkoutDay = ({
  dayId,
  dayDataPromise,
  isQuickWorkout = false,
}: {
  dayId: string | null
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
      staleTime: hasDataForCurrentDay || isRestDay ? Infinity : 0,
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
      <div
        className={cn(
          'bg-sidebar',
          COUNTER_MAIN_PADDING,
          'px-0 md:px-0 lg:px-0 pb-0 md:pb-0 lg:pb-0 pt-4',
        )}
      >
        <div
          className={cn(
            'pb-4 bg-background rounded-t-3xl mt-0 px-2 md:px-4 lg:px-8',
          )}
        >
          <div className="max-w-sm mx-auto">
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
        </div>
      </div>
    </WorkoutProvider>
  )
}
