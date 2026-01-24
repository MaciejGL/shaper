'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { parseAsString, parseAsStringEnum, useQueryStates } from 'nuqs'
import { toast } from 'sonner'

import { ExtendHeader } from '@/components/extend-header'
import { HeaderTab } from '@/components/header-tab'
import { Badge } from '@/components/ui/badge'
import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
import {
  GQLGetFeaturedTrainersQuery,
  GQLGetFreeWorkoutDaysQuery,
  GQLGetPublicTrainingPlansQuery,
  useAssignTemplateToSelfMutation,
} from '@/generated/graphql-client'
import { useOpenUrl } from '@/hooks/use-open-url'
import { usePaymentRules } from '@/hooks/use-payment-rules'

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
  const queryClient = useQueryClient()
  const router = useRouter()
  const rules = usePaymentRules()
  const { openUrl } = useOpenUrl({
    errorMessage: 'Failed to open subscription plans',
    openInApp: rules.canLinkToPayment,
  })

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

  const { mutateAsync: assignTemplate, isPending: isAssigning } =
    useAssignTemplateToSelfMutation({})

  const handleAssignTemplate = async (planId: string) => {
    try {
      await assignTemplate({ planId })

      toast.success('Plan added to My Plans')

      await queryClient.refetchQueries({
        queryKey: ['FitspaceMyPlans'],
      })

      router.push('/fitspace/my-plans')
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      if (
        errorMessage.includes('limit reached') ||
        errorMessage.includes('Premium') ||
        errorMessage.includes('subscription')
      ) {
        toast.error('Premium required')
        openUrl(
          `/account-management/offers?redirectUrl=/fitspace/explore/plan/${planId}`,
        )
      } else {
        toast.error('Failed to add training plan')
      }
    }
  }

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
            onAssignTemplate={handleAssignTemplate}
            isAssigning={isAssigning}
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
