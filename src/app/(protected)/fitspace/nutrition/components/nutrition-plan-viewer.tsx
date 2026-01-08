'use client'

import { Download, Salad } from 'lucide-react'
import { useState } from 'react'

import { Divider } from '@/components/divider'
import { EmptyStateCard } from '@/components/empty-state-card'
import { Icon } from '@/components/icons/icon'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { GQLGetMyNutritionPlanQuery } from '@/generated/graphql-client'
import {
  downloadPDF,
  generateFilename,
  isNativeApp,
  openPdfInBrowser,
} from '@/lib/pdf/pdf-generator'

import { MealList } from './meal-list'
import { NutritionPlanPDF } from './pdf/nutrition-plan-pdf'
import { ShoppingListDrawer } from './shopping-list-drawer'

type PlanDay = NonNullable<
  GQLGetMyNutritionPlanQuery['nutritionPlan']
>['days'][number]

interface NutritionPlanViewerProps {
  nutritionPlan?: GQLGetMyNutritionPlanQuery['nutritionPlan'] | null
  activeDay: PlanDay | null
  isLoading: boolean
}

export function NutritionPlanViewer({
  isLoading,
  nutritionPlan,
  activeDay,
}: NutritionPlanViewerProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

  const handleDownloadPlan = async () => {
    if (!nutritionPlan) return

    if (isNativeApp()) {
      openPdfInBrowser(`/api/pdf/nutrition-plan/${nutritionPlan.id}`)
      return
    }

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

  if (isLoading) {
    return <NutritionPlanViewerLoading />
  }

  if (!nutritionPlan || !activeDay) {
    return (
      <div className="p-4">
        <EmptyStateCard
          icon={Salad}
          description="This nutrition plan doesn't have any days configured yet."
        />
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4">
      <MealList meals={activeDay.meals} />

      <Divider className="mt-6" />

      <ShoppingListDrawer
        days={nutritionPlan.days}
        activeDay={activeDay}
        planId={nutritionPlan.id}
      />

      <Button
        variant="secondary"
        className="w-full justify-start py-3 h-auto gap-4"
        iconStart={<Icon name="pdf" />}
        iconEnd={<Download className="size-4" />}
        onClick={handleDownloadPlan}
        loading={isGeneratingPDF}
        disabled={isGeneratingPDF}
      >
        <span className="flex-1 text-left">{nutritionPlan.name}.pdf</span>
      </Button>

      {nutritionPlan?.description && (
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
          {nutritionPlan.description}
        </p>
      )}
    </div>
  )
}

function NutritionPlanViewerLoading() {
  return (
    <div className="px-4 space-y-4">
      <div className="space-y-2">
        <LoadingSkeleton variant="sm" count={3} cardVariant="tertiary" />
      </div>
      <Skeleton className="h-px w-full" />
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-10 w-full rounded-xl" />
    </div>
  )
}
