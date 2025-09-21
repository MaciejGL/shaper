'use client'

import { useState } from 'react'

import { DashboardHeader } from '@/app/(protected)/trainer/components/dashboard-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { GQLGetNutritionPlanQuery } from '@/generated/graphql-client'

import { AddDayButton } from './add-day-button'
import { NutritionPlanDayContent } from './nutrition-plan-day-content'

type GQLNutritionPlanDay = NonNullable<
  GQLGetNutritionPlanQuery['nutritionPlan']
>['days'][number]

interface NutritionPlanEditorProps {
  nutritionPlan: NonNullable<GQLGetNutritionPlanQuery['nutritionPlan']>
}

export function NutritionPlanEditor({
  nutritionPlan,
}: NutritionPlanEditorProps) {
  const [activeDay, setActiveDay] = useState(
    nutritionPlan.days?.[0]?.dayNumber?.toString() || '1',
  )

  const handleDayAdded = (newDay: GQLNutritionPlanDay) => {
    // Switch to the newly added day
    setActiveDay(newDay.dayNumber.toString())
  }

  const handleDayDeleted = (deletedDay: GQLNutritionPlanDay) => {
    const currentDayNumber = parseInt(activeDay)
    const deletedDayNumber = deletedDay.dayNumber

    // If we're deleting the currently active day, switch to another day
    if (currentDayNumber === deletedDayNumber) {
      const remainingDays = days.filter((day) => day.id !== deletedDay.id)

      if (remainingDays.length === 0) {
        // No days left, will show empty state
        setActiveDay('1')
      } else {
        // Find the best day to switch to
        const sortedDays = remainingDays.sort(
          (a, b) => a.dayNumber - b.dayNumber,
        )

        // Try to find a day with a lower number (previous day)
        const previousDay = sortedDays.find(
          (day) => day.dayNumber < deletedDayNumber,
        )

        if (previousDay) {
          setActiveDay(previousDay.dayNumber.toString())
        } else {
          // No previous day, switch to the first available day
          setActiveDay(sortedDays[0].dayNumber.toString())
        }
      }
    }
    // If we're not deleting the active day, no need to change tabs
  }

  const days = nutritionPlan.days || []

  return (
    <div className="space-y-6">
      <DashboardHeader
        title={nutritionPlan.name}
        description={nutritionPlan.description || undefined}
      />

      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <div className="flex items-center justify-between">
          <TabsList className="grid w-auto grid-flow-col">
            {days.map((day) => (
              <TabsTrigger key={day.id} value={day.dayNumber.toString()}>
                Day {day.dayNumber}
              </TabsTrigger>
            ))}
          </TabsList>

          <AddDayButton
            nutritionPlanId={nutritionPlan.id}
            nextDayNumber={(nutritionPlan.days?.length || 0) + 1}
            onDayAdded={handleDayAdded}
          />
        </div>

        {days.map((day) => (
          <TabsContent key={day.id} value={day.dayNumber.toString()}>
            <NutritionPlanDayContent
              day={day}
              nutritionPlanId={nutritionPlan.id}
              onDayDeleted={handleDayDeleted}
            />
          </TabsContent>
        ))}

        {/* Show content for new day if no days exist */}
        {days.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">No days added yet</p>
            <p className="text-sm text-muted-foreground">
              Click "Add Day" to start building your nutrition plan
            </p>
          </div>
        )}
      </Tabs>
    </div>
  )
}
