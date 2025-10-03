import {
  FitspaceGetQuickWorkoutDayDocument,
  FitspaceGetQuickWorkoutNavigationDocument,
  GQLFitspaceGetQuickWorkoutDayQuery,
  GQLFitspaceGetQuickWorkoutNavigationQuery,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { WorkoutPageClientNew } from '../[trainingId]/components/workout-page.client'

interface QuickWorkoutPageProps {
  searchParams: Promise<{ day?: string }>
}

export default async function QuickWorkoutPage({
  searchParams,
}: QuickWorkoutPageProps) {
  const { day: dayId } = await searchParams

  const navigationPromise =
    gqlServerFetch<GQLFitspaceGetQuickWorkoutNavigationQuery>(
      FitspaceGetQuickWorkoutNavigationDocument,
      {},
    )

  const dayPromise = gqlServerFetch<GQLFitspaceGetQuickWorkoutDayQuery>(
    FitspaceGetQuickWorkoutDayDocument,
    { dayId: dayId || undefined },
  )

  return (
    <WorkoutPageClientNew
      navigationPromise={navigationPromise}
      dayPromise={dayPromise}
      trainingId="quick-workout"
    />
  )
}
