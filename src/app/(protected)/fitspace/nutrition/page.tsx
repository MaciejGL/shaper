'use client'

import { ArrowRight, Salad } from 'lucide-react'
import { useState } from 'react'

import { EmptyStateCard } from '@/components/empty-state-card'
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
      <div className="space-y-4 py-4">
        <LoadingSkeleton count={4} />
      </div>
    )
  }

  return (
    <div className="container-hypertro mx-auto py-4">
      <div>
        {hasMacroTargets && (
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-medium">Daily Macro Targets</h2>
          </div>
        )}
        {!hasMacroTargets && !hasPlans && (
          <EmptyStateCard
            title="Macro targets not set"
            description={`${user?.trainerId ? 'Your trainer is working on your personalized macro targets' : 'You can request a trainer to set your macro targets'}`}
            icon={Salad}
            cta={
              user?.trainerId && (
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
        <div className="grid grid-cols-4 gap-2">
          {(isLoading || macroTargets?.calories) && (
            <MacroCard
              label="Calories"
              value={macroTargets?.calories || '0000'}
              color="text-primary"
              isLoading={isLoading}
            />
          )}

          {(isLoading || macroTargets?.protein) && (
            <MacroCard
              label="Protein"
              value={macroTargets?.protein || '000'}
              unit="g"
              color="text-blue-500"
              isLoading={isLoading}
            />
          )}

          {(isLoading || macroTargets?.carbs) && (
            <MacroCard
              label="Carbs"
              value={macroTargets?.carbs || '000'}
              unit="g"
              color="text-green-500"
              isLoading={isLoading}
            />
          )}

          {(isLoading || macroTargets?.fat) && (
            <MacroCard
              label="Fat"
              value={macroTargets?.fat || '000'}
              unit="g"
              color="text-yellow-500"
              isLoading={isLoading}
            />
          )}
        </div>
        {macroTargets?.notes && (
          <Card borderless className="p-4 mt-4">
            <CardHeader>
              <CardTitle>Notes from trainer:</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {macroTargets.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
      <div className={cn('space-y-2', hasPlans && hasMacroTargets && 'mt-4')}>
        <NutritionPlanSelector
          onPlanSelect={handlePlanSelect}
          selectedPlanId={selectedPlanId}
          nutritionPlans={nutritionPlansData?.nutritionPlans || []}
          isLoading={isNutritionPlansLoading}
        />

        {selectedPlanId && <NutritionPlanViewer planId={selectedPlanId} />}
      </div>
    </div>
  )
}
