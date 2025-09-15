'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { Suspense, use, useMemo } from 'react'

import { WorkoutProvider } from '@/context/workout-context/workout-context'
import {
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceGetWorkoutNavigationQuery,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceGetWorkoutNavigationQuery,
} from '@/generated/graphql-client'

import { Exercises } from './exercises'
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
        data: GQLFitspaceGetWorkoutDayQuery
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

  return (
    <div>
      <Suspense fallback={<SkeletonNavigation />}>
        <NavigationWrapper
          navigationDataPromise={navigationPromise}
          trainingId={trainingId}
        />
      </Suspense>
      <Suspense fallback={<SkeletonExercises />}>
        <WorkoutDay dayId={dayId} dayDataPromise={dayPromise} />
      </Suspense>
    </div>
  )
}

const WorkoutDay = ({
  dayId,
  dayDataPromise,
}: {
  dayId: string | null
  dayDataPromise: Promise<
    | {
        data: GQLFitspaceGetWorkoutDayQuery
        error: null
      }
    | {
        data: null
        error: string
      }
  >
}) => {
  const { trainingId } = useParams<{ trainingId: string }>()
  const { data: dayData } = use(dayDataPromise)
  // Check if we have initial data for the current dayId
  const hasInitialDataForCurrentDay = useMemo(() => {
    return dayData?.getWorkoutDay?.day?.id === dayId && dayData?.getWorkoutDay
  }, [dayData, dayId])

  const queryClient = useQueryClient()

  const navigationData =
    queryClient.getQueryData<GQLFitspaceGetWorkoutNavigationQuery>(
      useFitspaceGetWorkoutNavigationQuery.getKey({ trainingId }),
    )

  // Check if current day is rest day
  const isRestDay = useMemo(() => {
    if (!dayId || !navigationData?.getWorkoutNavigation?.plan) return false
    for (const week of navigationData.getWorkoutNavigation.plan.weeks) {
      const day = week.days.find((d) => d.id === dayId)
      if (day) return day.isRestDay
    }
    return false
  }, [dayId, navigationData])

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
      initialData: isRestDay ? restDayData : (dayData ?? undefined),
      initialDataUpdatedAt:
        hasInitialDataForCurrentDay || isRestDay ? Date.now() : 0,
      enabled: !!dayId && !hasInitialDataForCurrentDay && !isRestDay, // Disable if rest day
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  )

  const isLoadingNewDay = isFetching && !hasInitialDataForCurrentDay

  return (
    <WorkoutProvider
      exercises={
        dayDataQuery?.getWorkoutDay?.day?.exercises ??
        dayData?.getWorkoutDay?.day?.exercises ??
        []
      }
    >
      <div className="max-w-sm mx-auto pb-4">
        {isLoadingNewDay ? (
          <SkeletonExercises />
        ) : (
          (dayDataQuery?.getWorkoutDay?.day ?? dayData?.getWorkoutDay?.day) && (
            <Exercises
              day={
                dayDataQuery?.getWorkoutDay?.day ?? dayData?.getWorkoutDay?.day
              }
              previousDayLogs={
                dayDataQuery?.getWorkoutDay?.previousDayLogs ??
                dayData?.getWorkoutDay?.previousDayLogs
              }
            />
          )
        )}
      </div>
    </WorkoutProvider>
  )
}
