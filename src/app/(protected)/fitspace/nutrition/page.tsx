'use client'

import { ArrowRight, Salad } from 'lucide-react'
import { useState } from 'react'

import { EmptyStateCard } from '@/components/empty-state-card'
import { ExtendHeader } from '@/components/extend-header'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { MacroCard } from '@/components/macro-card/macro-card'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useUser } from '@/context/user-context'
import {
  useGetMyMacroTargetsQuery,
  useGetMyNutritionPlansQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { NutritionPlanSelector } from './components/nutrition-plan-selector'
import { NutritionPlanViewer } from './components/nutrition-plan-viewer'

export default function NutritionPage() {
  const { user } = useUser()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const { data, isLoading } = useGetMyMacroTargetsQuery()
  const { data: nutritionPlansData, isLoading: isNutritionPlansLoading } =
    useGetMyNutritionPlansQuery()
  const macroTargets = data?.getMyMacroTargets

  const handlePlanSelect = (planId: string | null) => {
    setSelectedPlanId(planId)
  }

  const hasPlans = (nutritionPlansData?.nutritionPlans.length ?? 0) > 0
  const hasMacroTargets =
    macroTargets?.calories ||
    macroTargets?.protein ||
    macroTargets?.carbs ||
    macroTargets?.fat

  const isLoadingAll = isLoading || isNutritionPlansLoading

  if (isLoadingAll) {
    return (
      <div className="space-y-4 p-4 container-hypertro mx-auto">
        <LoadingSkeleton count={4} />
      </div>
    )
  }

  const showEmptyState = !hasMacroTargets && !hasPlans

  return (
    <ExtendHeader
      headerChildren={
        <div className="dark space-y-6 pt-4 pb-4">
          {hasMacroTargets && (
            <div className="grid grid-cols-4 gap-2">
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
          )}
          <NutritionPlanSelector
            onPlanSelect={handlePlanSelect}
            selectedPlanId={selectedPlanId}
            nutritionPlans={nutritionPlansData?.nutritionPlans || []}
            isLoading={isNutritionPlansLoading}
          />
        </div>
      }
      classNameContent="pt-0 px-0"
    >
      <div className="container-hypertro mx-auto space-y-4">
        {showEmptyState && (
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
        )}

        {selectedPlanId && <NutritionPlanViewer planId={selectedPlanId} />}
      </div>
    </ExtendHeader>
  )
}
