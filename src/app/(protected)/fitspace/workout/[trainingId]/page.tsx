import { notFound } from 'next/navigation'

import {
  FitspaceGetWorkoutDocument,
  GQLFitspaceGetWorkoutQuery,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { WorkoutPageClient } from './components/workout-page.client'

export default async function WorkoutPage({
  params,
}: {
  params: Promise<{ trainingId: string }>
}) {
  const { trainingId } = await params

  if (!trainingId) {
    return notFound()
  }

  const { data } = await gqlServerFetch<GQLFitspaceGetWorkoutQuery>(
    FitspaceGetWorkoutDocument,
    {
      trainingId,
    },
  )

  if (!data?.getWorkout) {
    return notFound()
  }

  return (
    <WorkoutPageClient
      plan={data.getWorkout.plan}
      navigation={data.getWorkout.navigation}
    />
  )
}
