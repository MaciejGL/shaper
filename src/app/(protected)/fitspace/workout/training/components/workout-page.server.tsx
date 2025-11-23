import { Suspense } from 'react'

import { ExtendHeader } from '@/components/extend-header'
import {
  GQLFitspaceGetQuickWorkoutDayQuery,
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceGetWorkoutNavigationQuery,
} from '@/generated/graphql-client'

import { NavigationWrapper } from './navigation-wrapper'
import { WorkoutDay } from './workout-day'
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
  isQuickWorkout?: boolean
}

export function WorkoutPageServer({
  navigationPromise,
  dayPromise,
  trainingId,
  isQuickWorkout = false,
}: WorkoutPageClientNewProps) {
  return (
    <ExtendHeader
      headerChildren={
        <Suspense fallback={<SkeletonNavigation />}>
          <NavigationWrapper
            navigationDataPromise={navigationPromise}
            trainingId={trainingId}
          />
        </Suspense>
      }
      classNameHeader="pt-2 px-2"
      classNameContent="px-0 pt-0"
    >
      <Suspense fallback={<SkeletonExercises />}>
        <WorkoutDay
          dayDataPromise={dayPromise}
          isQuickWorkout={isQuickWorkout}
        />
      </Suspense>
    </ExtendHeader>
  )
}
