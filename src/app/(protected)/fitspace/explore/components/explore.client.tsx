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
    <ExtendHeader headerChildren={null} classNameContent="px-0 pt-0">
      <Tabs
        defaultValue={Tab.FreeWorkouts}
        value={params.tab}
        className="w-full"
      >
        <div className="mb-2">
          <PrimaryTabList
            options={[
              { label: 'Free', value: Tab.FreeWorkouts },
              { label: 'Plans', value: Tab.PremiumPlans },
              { label: 'Trainers', value: Tab.Trainers },
            ]}
            onClick={(value) => setParams({ tab: value as Tab })}
            active={params.tab}
            className="grid grid-cols-3"
            size="lg"
          />
        </div>

        <TabsContent value="free-workouts" className="px-4">
          <FreeWorkoutsTab
            initialWorkoutId={params.workout}
            onNavigateToPlan={(planId) =>
              setParams({ tab: Tab.PremiumPlans, plan: planId })
            }
          />
        </TabsContent>

        <TabsContent value="premium-plans" className="px-4">
          <TrainingPlansTab
            initialPlans={plans || []}
            initialPlanId={params.plan}
          />
        </TabsContent>

        <TabsContent value="trainers" className="px-4">
          <TrainersTab
            initialTrainers={trainers || []}
            initialTrainerId={params.trainer}
          />
        </TabsContent>
      </Tabs>
    </ExtendHeader>
  )
}
