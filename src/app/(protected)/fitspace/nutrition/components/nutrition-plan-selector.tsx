'use client'

import { Utensils } from 'lucide-react'
import { useEffect, useState } from 'react'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import type {
  GQLGetMyNutritionPlanQuery,
  GQLGetMyNutritionPlansQuery,
} from '@/generated/graphql-client'

interface NutritionPlanSelectorProps {
  onPlanSelect: (planId: string | null) => void
  selectedPlanId?: string | null
  nutritionPlans: GQLGetMyNutritionPlansQuery['nutritionPlans']
  isLoading: boolean
  nutritionPlan?: GQLGetMyNutritionPlanQuery['nutritionPlan'] | null
}

const STORAGE_KEY = 'fitspace_selected_nutrition_plan'

export function NutritionPlanSelector({
  onPlanSelect,
  selectedPlanId,
  nutritionPlans,
  isLoading,
  nutritionPlan,
}: NutritionPlanSelectorProps) {
  const [localSelectedPlan, setLocalSelectedPlan] = useState<string | null>(
    null,
  )

  // Sort plans by creation date (newest first)
  const sortedPlans = [...nutritionPlans].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime()
    const dateB = new Date(b.createdAt).getTime()
    return dateB - dateA
  })

  useEffect(() => {
    if (sortedPlans.length === 0) return

    const storedPlanId = localStorage.getItem(STORAGE_KEY)

    const validStoredPlan = storedPlanId
      ? sortedPlans.find((plan) => plan.id === storedPlanId)
      : null

    const defaultPlanId = validStoredPlan?.id || sortedPlans[0]?.id || null

    setLocalSelectedPlan(defaultPlanId)
    onPlanSelect(defaultPlanId)
  }, [sortedPlans, onPlanSelect])

  const handlePlanChange = (planId: string) => {
    setLocalSelectedPlan(planId)
    localStorage.setItem(STORAGE_KEY, planId)
    onPlanSelect(planId)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-auto bg-card rounded-2xl">
          <p className="opacity-0 p-4 masked-placeholder-text">
            Loading nutrition plans...
          </p>
        </div>
      </div>
    )
  }

  if (sortedPlans.length === 0) {
    return (
      <div className="space-y-2">
        <div className="h-auto bg-muted/30 rounded-2xl flex items-center p-4">
          <span className="text-sm text-muted-foreground">
            Your trainer has not shared any nutrition plans with you yet
          </span>
        </div>
      </div>
    )
  }

  const effectiveSelectedPlan = selectedPlanId || localSelectedPlan
  const selectedPlanMeta = effectiveSelectedPlan
    ? (sortedPlans.find((p) => p.id === effectiveSelectedPlan) ?? null)
    : null

  const coachName = nutritionPlan?.trainer
    ? `${nutritionPlan.trainer.firstName} ${nutritionPlan.trainer.lastName}`
    : null

  return (
    <div className="dark">
      <Select
        value={effectiveSelectedPlan || ''}
        onValueChange={handlePlanChange}
      >
        <SelectTrigger
          variant="default"
          size="xl"
          className="w-full min-w-0 h-auto py-2 grid grid-cols-[auto_1fr_auto] gap-4 border-2"
          classNameIcon="size-6!"
        >
          <Utensils className="size-6! text-amber-500" />
          <div className="flex flex-col items-start text-left w-full min-w-0">
            <span className="text-lg font-semibold leading-snug truncate w-full mt-2">
              {selectedPlanMeta?.name ?? 'Select a nutrition plan'}
            </span>
            {coachName && (
              <span className="text-sm text-muted-foreground">
                Set by {coachName}
              </span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          {sortedPlans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id}>
              <div className="flex flex-col items-start w-full">
                <span className="font-medium text-base">{plan.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
