import { Calendar, SearchIcon, Users } from 'lucide-react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GQLGetFeaturedTrainersQuery,
  GQLGetPublicTrainingPlansQuery,
  GetFeaturedTrainersDocument,
  GetPublicTrainingPlansDocument,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { DashboardHeader } from '../../trainer/components/dashboard-header'

import { TrainersTab } from './components/trainers-tab'
import { TrainingPlansTab } from './components/training-plans-tab'

// ISR - revalidate every 5 minutes
export const revalidate = 300

interface ExplorePageProps {
  searchParams: {
    tab?: string
  }
}

export default async function ExplorePage({ searchParams }: ExplorePageProps) {
  const tabParam = searchParams.tab
  const defaultValue = tabParam === 'trainers' ? 'trainers' : 'plans'

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
    <div className="container-hypertro mx-auto max-w-md">
      <DashboardHeader
        title="Discover"
        icon={SearchIcon}
        variant="indigo"
        className="mb-6"
      />

      <Tabs defaultValue={defaultValue} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="plans">
            <Calendar className="h-4 w-4 mr-2" />
            Plans
          </TabsTrigger>
          <TabsTrigger value="trainers">
            <Users className="h-4 w-4 mr-2" />
            Trainers
          </TabsTrigger>
        </TabsList>

        <TabsContent value="plans" className="mt-6">
          <TrainingPlansTab
            initialPlans={plansData?.getPublicTrainingPlans || []}
          />
        </TabsContent>

        <TabsContent value="trainers" className="mt-6">
          <TrainersTab
            initialTrainers={trainersData?.getFeaturedTrainers || []}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
