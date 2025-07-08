'use client'

import { GQLGetMealPlanByIdQuery } from '@/generated/graphql-client'

import { MealSlot } from './meal-slot'

export type Day =
  GQLGetMealPlanByIdQuery['getMealPlanById']['weeks'][0]['days'][0]

interface MealTimeSlotsProps {
  day: Day
}

export function MealTimeSlots({ day }: MealTimeSlotsProps) {
  const hours = Array.from({ length: 17 }, (_, i) => i + 7) // 7 AM to 11 PM

  return (
    <div className="space-y-4">
      {hours.map((hour) => {
        return <MealSlot key={hour} hour={hour} day={day} />
      })}
    </div>
  )
}
