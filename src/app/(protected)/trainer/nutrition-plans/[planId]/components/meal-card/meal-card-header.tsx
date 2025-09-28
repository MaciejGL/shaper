import type { GQLGetNutritionPlanQuery } from '@/generated/graphql-client'

interface MealCardHeaderProps {
  meal: NonNullable<
    GQLGetNutritionPlanQuery['nutritionPlan']
  >['days'][number]['meals'][number]['meal']
  macros: {
    calories?: number
    protein?: number
    carbs?: number
    fat?: number
  }
}

export function MealCardHeader({ meal, macros }: MealCardHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full pr-4">
      {/* Left side: meal name and compact macros */}
      <div className="flex items-center gap-4">
        <h3 className="text-base font-medium">{meal.name}</h3>

        {/* Compact macros */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 rounded-md px-2 py-1">
          <span className="font-medium text-primary">
            {Math.round(macros?.calories || 0)} cal
          </span>
          <span>•</span>
          <span className="text-green-600">
            {Math.round(macros?.protein || 0)}p
          </span>
          <span className="text-blue-600">
            {Math.round(macros?.carbs || 0)}c
          </span>
          <span className="text-yellow-600">
            {Math.round(macros?.fat || 0)}f
          </span>
        </div>
      </div>
    </div>
  )
}
