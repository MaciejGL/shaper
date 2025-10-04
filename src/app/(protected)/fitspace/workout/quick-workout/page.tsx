import {
  FitspaceGetQuickWorkoutDayDocument,
  FitspaceGetQuickWorkoutNavigationDocument,
  GQLFitspaceGetQuickWorkoutDayQuery,
  GQLFitspaceGetQuickWorkoutNavigationQuery,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { WorkoutPageClientNew } from '../[trainingId]/components/workout-page.client'

// Force dynamic rendering - quick workout changes frequently
export const dynamic = 'force-dynamic'

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
      { cache: 'no-store' },
    )

  const dayPromise = gqlServerFetch<GQLFitspaceGetQuickWorkoutDayQuery>(
    FitspaceGetQuickWorkoutDayDocument,
    { dayId: dayId || undefined },
    { cache: 'no-store' },
  )

  return (
    <WorkoutPageClientNew
      navigationPromise={navigationPromise}
      dayPromise={dayPromise}
      trainingId="quick-workout"
    />
  )
}
