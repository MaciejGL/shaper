'use client'

import { Salad } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import { Divider } from '@/components/divider'
import { EmptyStateCard } from '@/components/empty-state-card'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { PrimaryTabList, Tabs, TabsContent } from '@/components/ui/tabs'
import type { GQLGetMyNutritionPlanQuery } from '@/generated/graphql-client'

import { DayMealsAccordion, DayMealsHeader } from './day-meals-accordion'
import { ShoppingList } from './shopping-list'

interface NutritionPlanViewerProps {
  nutritionPlan?: GQLGetMyNutritionPlanQuery['nutritionPlan'] | null
  isLoading: boolean
}

export function NutritionPlanViewer({
  isLoading,
  nutritionPlan,
}: NutritionPlanViewerProps) {
  const [activeDay, setActiveDay] = useState<string>('')

  const days = useMemo(() => nutritionPlan?.days || [], [nutritionPlan])

  useEffect(() => {
    if (days.length > 0 && !activeDay) {
      setActiveDay(days[0].dayNumber.toString())
    }
  }, [days, activeDay])

  if (isLoading || (days.length > 0 && !activeDay)) {
    return <NutritionPlanViewerLoading />
  }

  if (!nutritionPlan || days.length === 0) {
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
    <div className="space-y-4">
      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <div className="flex items-center gap-2 max-w-screen overflow-x-auto hide-scrollbar mb-4 shadow-lg dark:shadow-neutral-950">
          <PrimaryTabList
            size="lg"
            options={days.map((day) => ({
              label: day.name,
              value: day.dayNumber.toString(),
            }))}
            onClick={setActiveDay}
            active={activeDay}
            className="text-sm"
            classNameButton="text-sm px-3 grow"
          />
        </div>

        {days.map((day) => (
          <TabsContent
            key={day.id}
            value={day.dayNumber.toString()}
            className="px-4"
          >
            <div className="space-y-6">
              <DayMealsAccordion day={day} />
              <Divider className="mb-6" />

              <ShoppingList day={day} planId={nutritionPlan.id} />
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {nutritionPlan?.description && (
        <p className="text-sm text-muted-foreground mt-4 px-4 whitespace-pre-wrap">
          {nutritionPlan.description}
        </p>
      )}
    </div>
  )
}

function NutritionPlanViewerLoading() {
  return (
    <Tabs value="0">
      <Skeleton className="h-[46px] w-full rounded-[14px] mb-4" />
      <TabsContent value="0" className="px-4">
        <DayMealsHeader loading />
        <div className="space-y-2">
          <LoadingSkeleton variant="sm" count={3} cardVariant="tertiary" />
        </div>
      </TabsContent>
    </Tabs>
  )
}
