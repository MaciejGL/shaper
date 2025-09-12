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
import { SkeletonExercises } from './workout-page-skeleton'

// Navigation pagination types
export type NavigationPlan = NonNullable<
  NonNullable<GQLFitspaceGetWorkoutNavigationQuery['getWorkoutNavigation']>
>['plan']
export type NavigationWeek = NonNullable<NavigationPlan>['weeks'][number]
export type NavigationDay = NonNullable<NavigationWeek>['days'][number]

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
  const { data: navigationData } = use(navigationPromise)
  const { data: dayData } = use(dayPromise)

  if (!navigationData?.getWorkoutNavigation) {
    return <div>No navigation data available</div>
  }

  return (
    <div>
      <Suspense fallback={<div>Loading Navigation...</div>}>
        <NavigationWrapper
          navigationData={navigationData}
          trainingId={trainingId}
        />
      </Suspense>
      <Suspense fallback={<div>Loading Day...</div>}>
        <WorkoutDay dayId={dayId} dayData={dayData} />
      </Suspense>
    </div>
  )
}

const NavigationWrapper = ({
  navigationData,
  trainingId,
}: {
  navigationData: GQLFitspaceGetWorkoutNavigationQuery
  trainingId: string
}) => {
  const hasInitialDataForCurrentDay =
    navigationData?.getWorkoutNavigation?.plan?.id === trainingId
  const { data: navigationDataQuery } = useFitspaceGetWorkoutNavigationQuery(
    {
      trainingId,
    },
    {
      initialData: navigationData ?? undefined,
      enabled: !!trainingId && !hasInitialDataForCurrentDay, // Only check if trainingId exists
    },
  )

  return (
    <Navigation
      plan={
        navigationDataQuery?.getWorkoutNavigation?.plan ??
        navigationData.getWorkoutNavigation?.plan
      }
    />
  )
}

const WorkoutDay = ({
  dayId,
  dayData,
}: {
  dayId: string | null
  dayData: GQLFitspaceGetWorkoutDayQuery | null
}) => {
  // Check if we have initial data for the current dayId
  const hasInitialDataForCurrentDay = useMemo(() => {
    return dayData?.getWorkoutDay?.day?.id === dayId && dayData?.getWorkoutDay
  }, [dayData, dayId])

  const { data: dayDataQuery, isFetching } = useFitspaceGetWorkoutDayQuery(
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
        {isFetching ? (
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
