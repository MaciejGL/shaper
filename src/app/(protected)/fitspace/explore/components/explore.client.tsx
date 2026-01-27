'use client'

import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs'

import { ExtendHeader } from '@/components/extend-header'
import { HeaderTab } from '@/components/header-tab'
import { Badge } from '@/components/ui/badge'
import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
import {
  GQLGetFeaturedTrainersQuery,
  GQLGetFreeWorkoutDaysQuery,
  GQLGetPublicTrainingPlansQuery,
} from '@/generated/graphql-client'

import { FreeWorkoutsTab } from './free-workouts-tab'
import { TrainersTab } from './trainers-tab'
import { TrainingPlansTab } from './training-plans-tab'

export type PublicTrainingPlan =
  GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans'][number]

export type FeaturedTrainer =
  GQLGetFeaturedTrainersQuery['getFeaturedTrainers'][number]

export type FreeWorkoutDay =
  GQLGetFreeWorkoutDaysQuery['getFreeWorkoutDays'][number]

interface ExploreClientProps {
  plans: GQLGetPublicTrainingPlansQuery['getPublicTrainingPlans']
  trainers: GQLGetFeaturedTrainersQuery['getFeaturedTrainers']
  workouts: GQLGetFreeWorkoutDaysQuery['getFreeWorkoutDays']
}

enum Tab {
  FreeWorkouts = 'free-workouts',
  PremiumPlans = 'premium-plans',
  Trainers = 'trainers',
}

export function ExploreClient({
  plans,
  trainers,
  workouts,
}: ExploreClientProps) {
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
    <ExtendHeader
      headerChildren={<div />}
      classNameHeaderContent="pb-8"
      classNameContent="px-0 pt-0"
    >
      <Tabs
        defaultValue={Tab.FreeWorkouts}
        value={params.tab}
        className="w-full"
      >
        <div className="mb-2 -mt-6 relative px-3">
          <PrimaryTabList
            options={[
              { label: 'Workouts', value: Tab.FreeWorkouts },
              { label: 'Plans', value: Tab.PremiumPlans },
              { label: 'Trainers', value: Tab.Trainers },
            ]}
            onClick={(value) => setParams({ tab: value as Tab })}
            active={params.tab}
            className="grid grid-cols-3"
            classNameButton="px-2"
            size="lg"
          />
        </div>

        <TabsContent value={Tab.FreeWorkouts} className="px-4">
          <HeaderTab
            title={
              <span className="flex items-center gap-2">
                Workouts{' '}
                <Badge variant="secondary" size="md">
                  Free
                </Badge>
              </span>
            }
            description="Free workouts selection from our plans. Select a workout to start training."
          />
          <FreeWorkoutsTab
            initialWorkouts={workouts}
            initialWorkoutId={params.workout}
            availablePlans={plans || []}
          />
        </TabsContent>

        <TabsContent value={Tab.PremiumPlans} className="px-4">
          <HeaderTab
            title="Plans"
            description="Coach-made training plans. Choose the one that fits your goals and lifestyle or try our plan finder."
          />
          <TrainingPlansTab
            initialPlans={plans || []}
            initialPlanId={params.plan}
            workouts={workouts || []}
          />
        </TabsContent>

        <TabsContent value={Tab.Trainers} className="px-4">
          <HeaderTab
            title="Trainers"
            description="Connect with certified trainers to get personalized guidance and support - First assessment is free and non-binding."
          />
          <TrainersTab
            initialTrainers={trainers || []}
            initialTrainerId={params.trainer}
          />
        </TabsContent>
      </Tabs>
    </ExtendHeader>
  )
}
