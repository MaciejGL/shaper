import { Calendar, SearchIcon, Users } from 'lucide-react'

import {
  PrimaryTabList,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  GQLGetFeaturedTrainersQuery,
  GQLGetPublicTrainingPlansQuery,
  GetFeaturedTrainersDocument,
  GetPublicTrainingPlansDocument,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { ExploreClient } from './components/explore.client'
import { TrainersTab } from './components/trainers-tab'
import { TrainingPlansTab } from './components/training-plans-tab'

// ISR - revalidate every 5 minutes
export const revalidate = 300

export default async function ExplorePage() {
  // Pre-fetch data with ISR caching
  const [trainersResult, plansResult] = await Promise.all([
    gqlServerFetch<GQLGetFeaturedTrainersQuery>(GetFeaturedTrainersDocument, {
      limit: 30,
    }),
    gqlServerFetch<GQLGetPublicTrainingPlansQuery>(
      GetPublicTrainingPlansDocument,
      {
        limit: 30,
      },
    ),
  ])

  const trainersData = trainersResult.data
  const plansData = plansResult.data

  return (
    <ExploreClient
      plans={plansData?.getPublicTrainingPlans || []}
      trainers={trainersData?.getFeaturedTrainers || []}
    />
  )
}
