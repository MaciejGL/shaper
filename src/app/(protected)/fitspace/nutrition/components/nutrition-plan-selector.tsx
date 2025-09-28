'use client'

import { useEffect, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useGetMyNutritionPlansQuery } from '@/generated/graphql-client'

interface NutritionPlanSelectorProps {
  onPlanSelect: (planId: string | null) => void
  selectedPlanId?: string | null
}

const STORAGE_KEY = 'fitspace_selected_nutrition_plan'

export function NutritionPlanSelector({
  onPlanSelect,
  selectedPlanId,
}: NutritionPlanSelectorProps) {
  const { data, isLoading } = useGetMyNutritionPlansQuery()
  const [localSelectedPlan, setLocalSelectedPlan] = useState<string | null>(
    null,
  )

  const nutritionPlans = data?.clientNutritionPlans || []

  // Sort plans by creation date (newest first)
  const sortedPlans = [...nutritionPlans].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  // Initialize selected plan from localStorage or default to latest
  useEffect(() => {
    if (sortedPlans.length === 0) return

    // Get stored plan ID from localStorage
    const storedPlanId = localStorage.getItem(STORAGE_KEY)

    // Check if stored plan exists in current plans
    const validStoredPlan = storedPlanId
      ? sortedPlans.find((plan) => plan.id === storedPlanId)
      : null

    // Use stored plan if valid, otherwise use latest plan
    const defaultPlanId = validStoredPlan?.id || sortedPlans[0]?.id || null

    setLocalSelectedPlan(defaultPlanId)
    onPlanSelect(defaultPlanId)
  }, [sortedPlans, onPlanSelect])

  // Update localStorage when selection changes
  const handlePlanChange = (planId: string) => {
    setLocalSelectedPlan(planId)
    localStorage.setItem(STORAGE_KEY, planId)
    onPlanSelect(planId)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-sm font-medium">Nutrition Plan</h2>
        </div>
        <div className="h-12 bg-card animate-pulse rounded-md" />
      </div>
    )
  }

  if (sortedPlans.length === 0) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-sm font-medium">Nutrition Plan</h2>
        </div>
        <div className="h-10 bg-muted/30 rounded-md flex items-center px-3">
          <span className="text-sm text-muted-foreground">
            Your trainer has not shared any nutrition plans with you yet
          </span>
        </div>
      </div>
    )
  }

  const effectiveSelectedPlan = selectedPlanId || localSelectedPlan

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-sm font-medium">Nutrition Plan</h2>
      </div>
      <Select
        value={effectiveSelectedPlan || ''}
        onValueChange={handlePlanChange}
      >
        <SelectTrigger className="w-full h-12" variant="ghost">
          <SelectValue placeholder="Select a nutrition plan" />
        </SelectTrigger>
        <SelectContent>
          {sortedPlans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              <div className="flex flex-col items-start w-full">
                <span className="font-medium">{plan.name}</span>
                <span className="text-xs text-muted-foreground">
                  {plan.sharedAt
                    ? `Shared ${new Date(plan.sharedAt).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}`
                    : `Created ${new Date(plan.createdAt).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        },
                      )}`}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
