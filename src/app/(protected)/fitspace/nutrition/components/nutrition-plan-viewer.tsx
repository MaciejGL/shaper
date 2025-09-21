'use client'

import { useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetMyNutritionPlanQuery } from '@/generated/graphql-client'

import { DayMealsAccordion } from './day-meals-accordion'
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
  const days = nutritionPlan?.days || []

  // Set default active day when data loads
  if (days.length > 0 && !activeDay) {
    setActiveDay(days[0].dayNumber.toString())
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
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
      <div>
        {nutritionPlan.description && (
          <p className="text-sm text-muted-foreground mt-1">
            {nutritionPlan.description}
          </p>
        )}
      </div>

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
            <div className="space-y-6">
              {/* Day Macros Summary */}
              {/* <div className="grid grid-cols-4 gap-2">
                <div className="text-center p-1.5 bg-card rounded-lg">
                  <div className="text-base font-semibold text-primary">
                    {Math.round(day.dailyMacros?.calories || 0)}
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Calories
                  </div>
                </div>
                <div className="text-center p-1.5 bg-card rounded-lg">
                  <div className="text-lg font-semibold text-green-600">
                    {Math.round(day.dailyMacros?.protein || 0)}g
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    Protein
                  </div>
                </div>
                <div className="text-center p-1.5 bg-card rounded-lg">
                  <div className="text-base font-semibold text-blue-600">
                    {Math.round(day.dailyMacros?.carbs || 0)}g
                  </div>
                  <div className="text-[10px] text-muted-foreground">Carbs</div>
                </div>
                <div className="text-center p-1.5 bg-card rounded-lg">
                  <div className="text-base font-semibold text-yellow-600">
                    {Math.round(day.dailyMacros?.fat || 0)}g
                  </div>
                  <div className="text-[10px] text-muted-foreground">Fat</div>
                </div>
              </div> */}

              {/* Meals Accordion */}
              <DayMealsAccordion meals={day.meals || []} />
              {/* Shopping List */}
              <ShoppingList day={day} planId={planId} />
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
