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

export const revalidate = 300

export default async function WorkoutPage({
  params,
  searchParams,
}: WorkoutPageProps) {
  const { trainingId } = await params
  const { day: dayId, week: weekId } = await searchParams

  const navigationPromise =
    gqlServerFetch<GQLFitspaceGetWorkoutNavigationQuery>(
      FitspaceGetWorkoutNavigationDocument,
      { trainingId, weekId: weekId || undefined, allWeeks: false },
      {
        cache: 'force-cache',
        next: { revalidate: 5 * 60 },
      },
      // 5 minutes}}
    )
  const dayPromise = gqlServerFetch<GQLFitspaceGetWorkoutDayQuery>(
    FitspaceGetWorkoutDayDocument,
    { dayId: dayId || undefined },
    {
      cache: 'force-cache',
      next: { revalidate: 5 * 60 },
    },
  )

  return (
    <WorkoutPageClientNew
      trainingId={trainingId}
      navigationPromise={navigationPromise}
      dayPromise={dayPromise}
    />
  )
}
