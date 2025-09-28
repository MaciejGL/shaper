'use client'

import { useEffect, useMemo, useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetMyNutritionPlanQuery } from '@/generated/graphql-client'

import { DayMealsAccordion, DayMealsHeader } from './day-meals-accordion'
import { ShoppingList } from './shopping-list'

interface NutritionPlanViewerProps {
  planId: string
}

export function NutritionPlanViewer({ planId }: NutritionPlanViewerProps) {
  const { data, isLoading } = useGetMyNutritionPlanQuery(
    { id: planId },
    {
      enabled: !!planId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  )

  const [activeDay, setActiveDay] = useState<string>('')

  const nutritionPlan = data?.nutritionPlan
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
      <div className="text-center py-8">
        <p className="text-muted-foreground">
          This nutrition plan doesn't have any days configured yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {nutritionPlan?.description && (
        <p className="text-sm text-muted-foreground mt-1">
          {nutritionPlan.description}
        </p>
      )}

      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <div className="flex items-center gap-2 max-w-screen -mx-2 px-2 overflow-x-auto hide-scrollbar">
          <TabsList>
            {days.map((day) => (
              <TabsTrigger
                key={day.id}
                value={day.dayNumber.toString()}
                className="flex-shrink-0"
              >
                {day.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {days.map((day) => (
          <TabsContent key={day.id} value={day.dayNumber.toString()}>
            {
              <div className="space-y-6">
                {/* Meals Accordion */}
                <DayMealsAccordion day={day} />
                {/* Shopping List */}
                <ShoppingList day={day} planId={planId} />
              </div>
            }
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

export function NutritionPlanViewerLoading() {
  return (
    <div className="space-y-4">
      <Tabs value="loading">
        <div className="flex items-center gap-2 max-w-screen -mx-2 px-2 overflow-x-auto hide-scrollbar">
          <TabsList>
            {Array.from({ length: 7 }).map((_, index) => (
              <TabsTrigger
                key={index}
                value={index.toString()}
                className="flex-shrink-0"
              >
                Day {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="loading">
          <div className="space-y-4">
            <DayMealsHeader loading />
            <div className="space-y-2">
              <LoadingSkeleton variant="sm" count={3} />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
