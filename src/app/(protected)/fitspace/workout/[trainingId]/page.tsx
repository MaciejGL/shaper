import { redirect } from 'next/navigation'
import { Suspense } from 'react'

import {
  FitspaceGetWorkoutDocument,
  GQLFitspaceGetWorkoutQuery,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { WorkoutPageSkeleton } from './components/workout-page-skeleton'
import { WorkoutPageClient } from './components/workout-page.client'

interface WorkoutPageProps {
  params: Promise<{ trainingId: string }>
}

export default async function WorkoutPage({ params }: WorkoutPageProps) {
  const { trainingId } = await params

  const { data, error } = await gqlServerFetch<GQLFitspaceGetWorkoutQuery>(
    FitspaceGetWorkoutDocument,
    {
      trainingId,
    },
  )

  if (error || !data?.getWorkout) {
    console.error(error)
    return redirect('/fitspace/my-plans')
  }

  return (
    <Suspense fallback={<WorkoutPageSkeleton isLoading={true} />}>
      <WorkoutPageClient plan={data.getWorkout.plan} />
    </Suspense>
  )
}
