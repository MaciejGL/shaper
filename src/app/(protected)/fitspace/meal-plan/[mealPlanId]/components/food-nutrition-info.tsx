import { cn } from '@/lib/utils'

import { NutritionSummary } from './nutrition-summary'

interface FoodNutritionInfoProps {
  calories: number
  protein: number
  carbs: number
  fat: number
  isLogged?: boolean
  className?: string
}

export function FoodNutritionInfo({
  calories,
  protein,
  carbs,
  fat,
  isLogged = false,
  className,
}: FoodNutritionInfoProps) {
  return (
    <div className={cn('text-right text-sm shrink-0 space-y-1', className)}>
      <p
        className={cn(
          'font-medium',
          isLogged && 'text-green-800 dark:text-green-200',
        )}
      >
        {Math.round(calories)} cal
      </p>
      <NutritionSummary protein={protein} carbs={carbs} fat={fat} />
    </div>
  )
}
