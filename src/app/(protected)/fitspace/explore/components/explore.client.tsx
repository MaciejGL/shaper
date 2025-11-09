'use client'

import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs'

import { ExtendHeader } from '@/components/extend-header'
import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
import {
  GQLGetFeaturedTrainersQuery,
  GQLGetPublicTrainingPlansQuery,
} from '@/generated/graphql-client'

import { FreeWorkoutsTab } from './free-workouts-tab'
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
  FreeWorkouts = 'free-workouts',
  PremiumPlans = 'premium-plans',
  Trainers = 'trainers',
}

export function ExploreClient({ plans, trainers }: ExploreClientProps) {
  const [params, setParams] = useQueryStates(
    {
      tab: parseAsStringEnum<Tab>(Object.values(Tab)).withDefault(
        Tab.FreeWorkouts,
      ),
      workout: parseAsString,
      plan: parseAsString,
      trainer: parseAsString,
    },
    {
      history: 'push',
    },
  )

  return (
    <ExtendHeader headerChildren={null}>
      <div className="container-hypertro mx-auto">
        <Tabs
          defaultValue={Tab.FreeWorkouts}
          value={params.tab}
          className="w-full"
        >
          <PrimaryTabList
            options={[
              { label: 'Free', value: Tab.FreeWorkouts },
              { label: 'Plans', value: Tab.PremiumPlans },
              { label: 'Trainers', value: Tab.Trainers },
            ]}
            onClick={(value) => setParams({ tab: value as Tab })}
            active={params.tab}
            className="grid w-full grid-cols-3"
            size="xl"
          />

          <TabsContent value="free-workouts">
            <FreeWorkoutsTab
              initialWorkoutId={params.workout}
              onNavigateToPlan={(planId) =>
                setParams({ tab: Tab.PremiumPlans, plan: planId })
              }
            />
          </TabsContent>

          <TabsContent value="premium-plans">
            <TrainingPlansTab
              initialPlans={plans || []}
              initialPlanId={params.plan}
            />
          </TabsContent>

          <TabsContent value="trainers">
            <TrainersTab
              initialTrainers={trainers || []}
              initialTrainerId={params.trainer}
            />
          </TabsContent>
        </Tabs>
      </div>
    </ExtendHeader>
  )
}
