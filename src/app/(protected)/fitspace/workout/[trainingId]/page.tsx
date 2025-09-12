import {
  FitspaceGetWorkoutDayDocument,
  FitspaceGetWorkoutNavigationDocument,
  GQLFitspaceGetWorkoutDayQuery,
  GQLFitspaceGetWorkoutNavigationQuery,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { WorkoutPageClientNew } from './components/workout-page.client'

interface WorkoutPageProps {
  params: Promise<{ trainingId: string }>
  searchParams: Promise<{ day: string }>
}

export default async function WorkoutPage({
  params,
  searchParams,
}: WorkoutPageProps) {
  const { trainingId } = await params
  const { day: dayId } = await searchParams

  const navigationPromise =
    gqlServerFetch<GQLFitspaceGetWorkoutNavigationQuery>(
      FitspaceGetWorkoutNavigationDocument,
      { trainingId },
    )
  const dayPromise = gqlServerFetch<GQLFitspaceGetWorkoutDayQuery>(
    FitspaceGetWorkoutDayDocument,
    { dayId },
  )

  return (
    <WorkoutPageClientNew
      trainingId={trainingId}
      navigationPromise={navigationPromise}
      dayPromise={dayPromise}
    />
  )
}
