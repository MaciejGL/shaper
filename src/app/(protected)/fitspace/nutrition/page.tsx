'use client'

import { ArrowRight, Salad } from 'lucide-react'
import { useState } from 'react'

import { EmptyStateCard } from '@/components/empty-state-card'
import { MacroCard } from '@/components/macro-card/macro-card'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

  // Show empty state only when not loading and no data
  if (!macroTargets && !isLoading) {
    return (
      <div className="container-hypertro mx-auto py-8">
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
      </div>
    )
  }

  return (
    <div className="container-hypertro mx-auto py-8">
      <div className="space-y-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-sm font-medium">Daily Macro Targets</h2>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {/* Show cards during loading or when data exists */}
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
                <CardTitle>Notes from your trainer:</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {macroTargets.notes}
                </p>
              </CardContent>
            </Card>
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
