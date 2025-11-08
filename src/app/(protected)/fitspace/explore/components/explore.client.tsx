'use client'

import { useState } from 'react'

import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
import {
  GQLGetFeaturedTrainersQuery,
  GQLGetPublicTrainingPlansQuery,
} from '@/generated/graphql-client'

import { ExtendHeader } from '../../workout/[trainingId]/components/workout-page.client'

import { TrainersTab } from './trainers-tab'
import { TrainingPlansTab } from './training-plans-tab'

export type PublicTrainingPlan =
  GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]

export type FeaturedTrainer =
  GQLGetFeaturedTrainersQuery['getFeaturedTrainers'][number]

interface ExploreClientProps {
  plans: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans']
  trainers: GQLGetFeaturedTrainersQuery['getFeaturedTrainers']
}

enum Tab {
  Plans = 'plans',
  Trainers = 'trainers',
}
export function ExploreClient({ plans, trainers }: ExploreClientProps) {
  const [tab, setTab] = useState<Tab>(Tab.Plans)
  return (
    <ExtendHeader headerChildren={null}>
      <div className="container-hypertro mx-auto">
        <Tabs
          defaultValue={Tab.Plans}
          value={tab}
          // onValueChange={(value) => setTab(value as Tab)}
          className="w-full"
        >
          <PrimaryTabList
            options={[
              { label: 'Plans', value: Tab.Plans },
              { label: 'Trainers', value: Tab.Trainers },
            ]}
            onClick={(value) => setTab(value)}
            active={tab}
            className="grid w-full grid-cols-2"
            size="xl"
          />

          <TabsContent value="plans">
            <TrainingPlansTab initialPlans={plans || []} />
          </TabsContent>

          <TabsContent value="trainers">
            <TrainersTab initialTrainers={trainers || []} />
          </TabsContent>
        </Tabs>
      </div>
    </ExtendHeader>
  )
}
