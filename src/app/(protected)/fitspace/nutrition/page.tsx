'use client'

import { ArrowRight, Salad } from 'lucide-react'
import { useState } from 'react'

import { EmptyStateCard } from '@/components/empty-state-card'
import { ExtendHeader } from '@/components/extend-header'
import { MacroCard } from '@/components/macro-card/macro-card'
import { ButtonLink } from '@/components/ui/button-link'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/context/user-context'
import {
  useGetMyMacroTargetsQuery,
  useGetMyNutritionPlanQuery,
  useGetMyNutritionPlansQuery,
} from '@/generated/graphql-client'

import { NutritionPlanSelector } from './components/nutrition-plan-selector'
import { NutritionPlanViewer } from './components/nutrition-plan-viewer'

export default function NutritionPage() {
  const { user } = useUser()
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

  const hasPlans = (nutritionPlansData?.nutritionPlans.length ?? 0) > 0
  const hasMacroTargets =
    macroTargets?.calories ||
    macroTargets?.protein ||
    macroTargets?.carbs ||
    macroTargets?.fat

  const isLoadingAll =
    isLoading || isNutritionPlansLoading || isNutritionPlanLoading

  // if (isLoadingAll) {
  //   return (
  //     <ExtendHeader
  //       headerChildren={
  //         <div className="dark space-y-6 pt-4 pb-4">
  //           <LoadingSkeleton count={1} cardVariant="tertiary" />
  //         </div>
  //       }
  //     >
  //       <div className="container-hypertro mx-auto space-y-4">
  //         <LoadingSkeleton count={4} />
  //       </div>
  //     </ExtendHeader>
  //   )
  // }

  const showEmptyState = !hasMacroTargets && !hasPlans && !isLoadingAll

  return (
    <ExtendHeader
      classNameHeader="w-full max-w-screen"
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
                  <ButtonLink
                    href="/fitspace/explore?tab=trainers"
                    iconEnd={<ArrowRight />}
                  >
                    Find a Trainer
                  </ButtonLink>
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
