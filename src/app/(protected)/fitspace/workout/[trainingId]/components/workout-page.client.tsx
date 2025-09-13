'use client'

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
import { Navigation } from './navigation'
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

const NavigationWrapper = ({
  navigationDataPromise,
  trainingId,
}: {
  navigationDataPromise: Promise<
    | {
        data: GQLFitspaceGetWorkoutNavigationQuery
        error: null
      }
    | {
        data: null
        error: string
      }
  >
  trainingId: string
}) => {
  const { data: navigationData } = use(navigationDataPromise)

  const { data: navigationDataQuery } = useFitspaceGetWorkoutNavigationQuery(
    {
      trainingId,
    },
    {
      initialData: navigationData ?? undefined,
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: !!trainingId, // Disable if we have fresh initial data
    },
  )

  return (
    <Navigation
      plan={
        navigationDataQuery?.getWorkoutNavigation?.plan ??
        navigationData?.getWorkoutNavigation?.plan
      }
    />
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
  const { data: dayData } = use(dayDataPromise)
  // Check if we have initial data for the current dayId
  const hasInitialDataForCurrentDay = useMemo(() => {
    return dayData?.getWorkoutDay?.day?.id === dayId && dayData?.getWorkoutDay
  }, [dayData, dayId])

  const { data: dayDataQuery, isRefetching } = useFitspaceGetWorkoutDayQuery(
    {
      dayId: dayId ?? '',
    },
    {
      initialData: dayData ?? undefined,
      initialDataUpdatedAt: hasInitialDataForCurrentDay ? Date.now() : 0,
      enabled: !!dayId && !hasInitialDataForCurrentDay, // Disable if we have fresh initial data
    },
  )

  return (
    <WorkoutProvider
      exercises={
        dayDataQuery?.getWorkoutDay?.day?.exercises ??
        dayData?.getWorkoutDay?.day?.exercises ??
        []
      }
    >
      <div className="max-w-sm mx-auto pb-4">
        {isRefetching ? (
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
