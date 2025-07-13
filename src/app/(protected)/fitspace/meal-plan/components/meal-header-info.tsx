import { NutritionSummary } from './nutrition-summary'

interface MealHeaderInfoProps {
  totalCalories: number
  totalProtein: number
  totalCarbs: number
  totalFat: number
}

export function MealHeaderInfo({
  totalCalories,
  totalProtein,
  totalCarbs,
  totalFat,
}: MealHeaderInfoProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-right text-sm">
        <p className="font-medium">{Math.round(totalCalories)} cal</p>
        <NutritionSummary
          protein={totalProtein}
          carbs={totalCarbs}
          fat={totalFat}
          size="lg"
        />
      </div>
    </div>
  )
}
