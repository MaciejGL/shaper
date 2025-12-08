'use client'

import { ArrowRight, Salad } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

import { ComingSoonCard } from '@/components/coming-soon-card'
import { EmptyStateCard } from '@/components/empty-state-card'
import { ExtendHeader } from '@/components/extend-header'
import { MacroCard } from '@/components/macro-card/macro-card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/context/user-context'
import {
  useGetMyMacroTargetsQuery,
  useGetMyNutritionPlanQuery,
  useGetMyNutritionPlansQuery,
} from '@/generated/graphql-client'
import { useTrainerServiceAccess } from '@/hooks/use-trainer-service-access'

import { NutritionPlanSelector } from './components/nutrition-plan-selector'
import { NutritionPlanViewer } from './components/nutrition-plan-viewer'

export default function NutritionPage() {
  const router = useRouter()
  const { user } = useUser()
  const {
    canAccessTrainerFeatures,
    isTrainerServiceEnabled,
    isLoading: isAccessLoading,
  } = useTrainerServiceAccess()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const { data, isLoading } = useGetMyMacroTargetsQuery()
  const { data: nutritionPlansData, isLoading: isNutritionPlansLoading } =
    useGetMyNutritionPlansQuery()
  const macroTargets = data?.getMyMacroTargets

  const { data: nutritionPlanData, isLoading: isNutritionPlanLoading } =
    useGetMyNutritionPlanQuery(
      { id: selectedPlanId! },
      {
        enabled: !!selectedPlanId,
        staleTime: 5 * 60 * 1000, // 5 minutes
      },
    )

  const handlePlanSelect = (planId: string | null) => {
    setSelectedPlanId(planId)
  }

  const handleFindTrainer = () => {
    if (!isTrainerServiceEnabled) {
      toast.info('Trainer services are coming soon to your region.')
      return
    }
    router.push('/fitspace/explore?tab=trainers')
  }

  const hasPlans = (nutritionPlansData?.nutritionPlans.length ?? 0) > 0
  const hasMacroTargets =
    macroTargets?.calories ||
    macroTargets?.protein ||
    macroTargets?.carbs ||
    macroTargets?.fat

  const isLoadingAll =
    isLoading ||
    isNutritionPlansLoading ||
    isNutritionPlanLoading ||
    isAccessLoading

  // Show Coming Soon if no trainer relationship and service disabled
  if (!isLoadingAll && !canAccessTrainerFeatures) {
    return (
      <div className="pt-4 px-4">
        <ComingSoonCard
          title="Nutrition Plans Coming Soon"
          description="Nutrition planning services are not yet available in your region. We're working to bring this feature to you soon."
          icon={Salad}
        />
      </div>
    )
  }

  const showEmptyState = !hasMacroTargets && !hasPlans && !isLoadingAll

  return (
    <ExtendHeader
      classNameHeader="w-full"
      headerChildren={
        <div className="dark space-y-6 pt-4 pb-4 w-full">
          <div className="grid grid-cols-4">
            {(isLoading || macroTargets?.calories) && (
              <MacroCard
                label="Calories"
                value={macroTargets?.calories || '0000'}
                className="text-sidebar-foreground"
                isLoading={isLoading}
              />
            )}

            {(isLoading || macroTargets?.protein) && (
              <MacroCard
                label="Protein"
                value={macroTargets?.protein || '000'}
                unit="g"
                className="text-blue-500"
                isLoading={isLoading}
              />
            )}

            {(isLoading || macroTargets?.carbs) && (
              <MacroCard
                label="Carbs"
                value={macroTargets?.carbs || '000'}
                unit="g"
                className="text-green-500"
                isLoading={isLoading}
              />
            )}

            {(isLoading || macroTargets?.fat) && (
              <MacroCard
                label="Fat"
                value={macroTargets?.fat || '000'}
                unit="g"
                className="text-yellow-500"
                isLoading={isLoading}
              />
            )}
          </div>
          {!isLoadingAll ? (
            <NutritionPlanSelector
              onPlanSelect={handlePlanSelect}
              selectedPlanId={selectedPlanId}
              nutritionPlans={nutritionPlansData?.nutritionPlans || []}
              isLoading={isNutritionPlansLoading}
              nutritionPlan={nutritionPlanData?.nutritionPlan}
            />
          ) : (
            <Skeleton className="h-[40px]" />
          )}
        </div>
      }
      classNameContent="pt-0 px-0"
    >
      <div className="container-hypertro mx-auto space-y-4">
        {showEmptyState && (
          <div className="p-4">
            <EmptyStateCard
              title="Macro targets not set"
              description={`${user?.trainerId ? 'Your trainer is working on your personalized macro targets' : 'You can request a trainer to set your macro targets'}`}
              icon={Salad}
              cta={
                !user?.trainerId && (
                  <Button iconEnd={<ArrowRight />} onClick={handleFindTrainer}>
                    Find a Trainer
                  </Button>
                )
              }
            />
          </div>
        )}

        {(selectedPlanId || isNutritionPlanLoading) && (
          <NutritionPlanViewer
            isLoading={isNutritionPlanLoading}
            nutritionPlan={nutritionPlanData?.nutritionPlan}
          />
        )}
      </div>
    </ExtendHeader>
  )
}
