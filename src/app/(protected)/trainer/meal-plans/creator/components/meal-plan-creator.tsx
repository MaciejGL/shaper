'use client'

import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

import { dayNames, getDayName } from '../../../trainings/creator/utils'

import { MealTimeSlots } from './meal-time-slots'

export default function MealPlanCreator() {
  const [selectedDay, setSelectedDay] = useState(0)

  // Mock data for demonstration
  const formData = {
    details: {
      title: 'Muscle Building Plan',
      description: 'High protein meal plan for muscle growth',
      targetCalories: 2500,
      targetProtein: 150,
    },
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

      <div className="container mx-auto px-4 py-6">
        <div className="space-y-6">
          {/* Day Selector */}

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, index) => (
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
                  {getDayName(index, { short: true })}
                </span>
              </Button>
            ))}
          </div>

          {/* Selected Day Meal Planning */}
          <div className="space-y-4">
            <MealTimeSlots
              key={dayNames[selectedDay]}
              dayName={dayNames[selectedDay]}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
