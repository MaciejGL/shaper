import {
  GQLGetFeaturedTrainersQuery,
  GQLGetFreeWorkoutDaysQuery,
  GQLGetPublicTrainingPlansQuery,
  GetFeaturedTrainersDocument,
  GetFreeWorkoutDaysDocument,
  GetPublicTrainingPlansDocument,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { ExploreClient } from './components/explore.client'

// ISR - revalidate every 5 minutes
export const revalidate = 300

export default async function ExplorePage() {
  // Pre-fetch data with ISR caching
  const [trainersResult, plansResult, workoutsResult] = await Promise.all([
    gqlServerFetch<GQLGetFeaturedTrainersQuery>(GetFeaturedTrainersDocument, {
      limit: 30,
    }),
    gqlServerFetch<GQLGetPublicTrainingPlansQuery>(
      GetPublicTrainingPlansDocument,
      {
        limit: 30,
      },
    ),
    gqlServerFetch<GQLGetFreeWorkoutDaysQuery>(GetFreeWorkoutDaysDocument, {}),
  ])

  const trainersData = trainersResult.data
  const plansData = plansResult.data
  const workoutsData = workoutsResult.data

  return (
    <ExploreClient
      plans={plansData?.getPublicTrainingPlans || []}
      trainers={trainersData?.getFeaturedTrainers || []}
      workouts={workoutsData?.getFreeWorkoutDays || []}
    />
  )
}
