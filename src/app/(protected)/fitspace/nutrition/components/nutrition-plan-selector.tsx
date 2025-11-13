'use client'

import { Download } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type {
  GQLGetMyNutritionPlanQuery,
  GQLGetMyNutritionPlansQuery,
} from '@/generated/graphql-client'
import { downloadPDF, generateFilename } from '@/lib/pdf/pdf-generator'

import { NutritionPlanPDF } from './pdf/nutrition-plan-pdf'

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleExportPDF = async () => {
    if (!nutritionPlan) return

    setIsGeneratingPDF(true)
    try {
      const filename = generateFilename({
        prefix: `Nutrition Plan - ${nutritionPlan.name}`,
        skipTimestamp: true,
      })

      await downloadPDF(
        <NutritionPlanPDF nutritionPlan={nutritionPlan} />,
        filename,
      )
    } catch (error) {
      console.error('Failed to generate PDF:', error)
    } finally {
      setIsGeneratingPDF(false)
    }
  }

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

  return (
    <div className="w-full flex items-center gap-2 dark">
      <Select
        value={effectiveSelectedPlan || ''}
        onValueChange={handlePlanChange}
      >
        <SelectTrigger className="w-full" variant="default">
          <SelectValue placeholder="Select a nutrition plan" />
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
      <Button
        variant="outline"
        size="icon-lg"
        iconOnly={<Download className="dark:text-white" />}
        onClick={handleExportPDF}
        loading={isGeneratingPDF}
        disabled={isGeneratingPDF}
        className="dark"
      >
        Export to PDF
      </Button>
    </div>
  )
}
