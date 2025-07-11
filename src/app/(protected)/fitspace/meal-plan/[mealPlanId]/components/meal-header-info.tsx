import { format } from 'date-fns'

import { NutritionSummary } from './nutrition-summary'

interface MealHeaderInfoProps {
  name: string
  dateTime: string
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export function MealHeaderInfo({
  name,
  dateTime,
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
}: MealHeaderInfoProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
      <div>
        <h3 className="font-medium">{name}</h3>
        <p className="text-sm text-muted-foreground">
          {format(new Date(dateTime), 'h:mm a')}
        </p>
      </div>
      <div className="text-right text-sm">
        <p className="font-medium">{Math.round(totalCalories)} cal</p>
        <NutritionSummary
          protein={totalProtein}
          carbs={totalCarbs}
          fat={totalFat}
        />
      </div>
    </div>
  )
}
