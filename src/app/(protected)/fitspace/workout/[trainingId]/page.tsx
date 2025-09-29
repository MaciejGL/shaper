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
  searchParams: Promise<{ day: string; week: string }>
}

export default async function WorkoutPage({
  params,
  searchParams,
}: WorkoutPageProps) {
  const [{ trainingId }, { day: dayId, week: weekId }] = await Promise.all([
    params,
    searchParams,
  ])

  const navigationPromise =
    gqlServerFetch<GQLFitspaceGetWorkoutNavigationQuery>(
      FitspaceGetWorkoutNavigationDocument,
      { trainingId, weekId: weekId || undefined, allWeeks: false },
    )
  const dayPromise = gqlServerFetch<GQLFitspaceGetWorkoutDayQuery>(
    FitspaceGetWorkoutDayDocument,
    { dayId: dayId || undefined },
  )

  return (
    <WorkoutPageClientNew
      trainingId={trainingId}
      navigationPromise={navigationPromise}
      dayPromise={dayPromise}
    />
  )
}
