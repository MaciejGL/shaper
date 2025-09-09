'use client'

import { useParams } from 'next/navigation'

import { WorkoutProvider } from '@/context/workout-context/workout-context'
import {
  GQLFitspaceGetWorkoutQuery,
  useFitspaceGetWorkoutQuery,
} from '@/generated/graphql-client'

import { Exercises } from './exercises'
import { Navigation } from './navigation'
import { WorkoutPageSkeleton } from './workout-page-skeleton'

export type WorkoutPlan = NonNullable<
  GQLFitspaceGetWorkoutQuery['getWorkout']
>['plan']
export type WorkoutWeek = NonNullable<WorkoutPlan>['weeks'][number]
export type WorkoutDay = NonNullable<WorkoutWeek>['days'][number]
export type WorkoutExercise = NonNullable<WorkoutDay>['exercises'][number]
export type WorkoutSet = NonNullable<WorkoutExercise>['sets'][number]
export type WorkoutSetLog = NonNullable<WorkoutSet>['log']

type WorkoutPageClientProps = {
  plan: WorkoutPlan
}

export function WorkoutPageClient({ plan }: WorkoutPageClientProps) {
  const { trainingId } = useParams<{ trainingId: string }>()
  const { data, isLoading } = useFitspaceGetWorkoutQuery(
    {
      trainingId,
    },
    {
      initialData: {
        getWorkout: {
          plan,
        },
      },
    },
  )

  if (isLoading) {
    return <WorkoutPageSkeleton isLoading={true} />
  }

  return (
    <WorkoutProvider plan={data?.getWorkout?.plan}>
      <Navigation />
      <div className="max-w-sm mx-auto pb-4">
        <Exercises />
      </div>
    </WorkoutProvider>
  )
}
