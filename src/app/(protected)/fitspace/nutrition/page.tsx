'use client'

import { Salad } from 'lucide-react'
import { useState } from 'react'

import { EmptyStateCard } from '@/components/empty-state-card'
import { useUser } from '@/context/user-context'
import { useGetMyMacroTargetsQuery } from '@/generated/graphql-client'

import { NutritionPlanSelector } from './components/nutrition-plan-selector'
import { NutritionPlanViewer } from './components/nutrition-plan-viewer'

export default function NutritionPage() {
  const { user } = useUser()
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const { data, isLoading } = useGetMyMacroTargetsQuery()
  const macroTargets = data?.getMyMacroTargets

  const handlePlanSelect = (planId: string | null) => {
    setSelectedPlanId(planId)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (!macroTargets) {
    return (
      <div className="container mx-auto py-8">
        <EmptyStateCard
          title="Macro targets not set"
          description={`${user?.trainerId ? 'Your trainer is working on your personalized macro targets' : 'You can request a trainer to set your macro targets'}`}
          icon={Salad}
        />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-medium">Daily Macro Targets</h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {macroTargets.calories && (
              <div className="text-center p-4 bg-card rounded-lg">
                <div className="text-base font-medium text-primary">
                  {macroTargets.calories}
                </div>
                <div className="text-xs text-muted-foreground">Calories</div>
              </div>
            )}

            {macroTargets.protein && (
              <div className="text-center p-4 bg-card rounded-lg">
                <div className="text-base font-medium text-blue-600">
                  {macroTargets.protein}g
                </div>
                <div className="text-xs text-muted-foreground">Protein</div>
              </div>
            )}

            {macroTargets.carbs && (
              <div className="text-center p-4 bg-card rounded-lg">
                <div className="text-base font-medium text-green-600">
                  {macroTargets.carbs}g
                </div>
                <div className="text-xs text-muted-foreground">Carbs</div>
              </div>
            )}

            {macroTargets.fat && (
              <div className="text-center p-4 bg-card rounded-lg">
                <div className="text-base font-medium text-yellow-600">
                  {macroTargets.fat}g
                </div>
                <div className="text-xs text-muted-foreground">Fat</div>
              </div>
            )}
          </div>
          {macroTargets.notes && (
            <div className="mt-6 p-4 bg-muted/30 rounded-lg">
              <h4 className="font-medium mb-2">Notes from your trainer:</h4>
              <p className="text-sm text-muted-foreground">
                {macroTargets.notes}
              </p>
            </div>
          )}
        </div>
        {/* Nutrition Plan Selector */}
        <div className="space-y-4">
          <NutritionPlanSelector
            onPlanSelect={handlePlanSelect}
            selectedPlanId={selectedPlanId}
          />

          {/* Nutrition Plan Content */}
          {selectedPlanId && <NutritionPlanViewer planId={selectedPlanId} />}
        </div>
      </div>
    </div>
  )
}
