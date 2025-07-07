'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  MealPlanProvider,
  useMealPlanContext,
} from '@/context/meal-plan-context/meal-plan-context'

import { dayNames, getDayName } from '../../../trainings/creator/utils'

import MealTimeSlots from './meal-time-slots'

function MealPlanCreatorContent() {
  const [selectedDay, setSelectedDay] = useState(0)
  const { mealPlan, isLoading } = useMealPlanContext()

  // Mock data for demonstration
  const formData = {
    details: {
      title: 'Muscle Building Plan',
      description: 'High protein meal plan for muscle growth',
      targetCalories: 2500,
      targetProtein: 150,
    },
  }

  const selectedWeek = mealPlan?.weeks.at(0)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading meal plan...</div>
          <div className="text-muted-foreground">Please wait</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card/50 rounded-lg sticky -top-4 z-10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                Meal Plan Creator
              </h1>
              {formData.details.title && (
                <p className="text-muted-foreground mt-1">
                  {formData.details.title}
                </p>
              )}
            </div>

            <div className="flex items-center gap-4">
              <Badge variant="outline" className="flex items-center gap-1">
                {formData.details.targetCalories} cal
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                {formData.details.targetProtein}g protein
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-[900px] mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Day Selector */}
          <div className="grid grid-cols-7 gap-2">
            {selectedWeek?.days.map((day, index) => (
              <Button
                key={index}
                variant={selectedDay === index ? 'default' : 'secondary'}
                className={`h-16 flex flex-col items-center justify-center transition-all duration-200 ${
                  selectedDay === index
                    ? 'shadow-md scale-102'
                    : 'hover:scale-102'
                }`}
                onClick={() => setSelectedDay(index)}
              >
                <span className="text-lg font-medium">
                  {getDayName(day.dayOfWeek, { short: true })}
                </span>
              </Button>
            ))}
          </div>

          {/* Selected Day Meal Planning */}
          {selectedWeek?.days[selectedDay] && (
            <div className="space-y-4">
              <MealTimeSlots
                key={dayNames[selectedDay]}
                day={selectedWeek?.days[selectedDay]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MealPlanCreator() {
  const { mealPlanId } = useParams<{ mealPlanId: string }>()

  return (
    <MealPlanProvider mealPlanId={mealPlanId}>
      <MealPlanCreatorContent />
    </MealPlanProvider>
  )
}
