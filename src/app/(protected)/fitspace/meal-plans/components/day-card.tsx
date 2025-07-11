import { MacroBadge } from '@/app/(protected)/trainer/meal-plans/creator/components/macro-badge'
import { getDayName } from '@/app/(protected)/trainer/trainings/creator/utils'

import { MealCard } from './meal-card'

interface Day {
  id: string
  dayOfWeek: number
  targetCalories?: number | null
  targetProtein?: number | null
  targetCarbs?: number | null
  targetFat?: number | null
  meals?: Meal[] | null
}

interface Meal {
  id: string
  name: string
  dateTime: string
  instructions?: string | null
  foods?: Food[] | null
}

interface Food {
  id: string
  name: string
  quantity: number
  unit: string
}

interface DayCardProps {
  day: Day
}

export function DayCard({ day }: DayCardProps) {
  return (
    <div className="rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium">{getDayName(day.dayOfWeek)}</div>
        {/* Day Targets */}
        {(day.targetCalories ||
          day.targetProtein ||
          day.targetCarbs ||
          day.targetFat) && (
          <div className="flex items-center gap-2 mb-2">
            <MacroBadge macro="calories" value={day.targetCalories ?? 0} />
            <MacroBadge macro="protein" value={day.targetProtein ?? 0} />
            <MacroBadge macro="carbs" value={day.targetCarbs ?? 0} />
            <MacroBadge macro="fat" value={day.targetFat ?? 0} />
          </div>
        )}
      </div>

      {/* Meals */}
      {day.meals && day.meals.length > 0 ? (
        <div className="space-y-2">
          {day.meals.map((meal) => (
            <MealCard key={meal.id} meal={meal} />
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">No meals planned</div>
      )}
    </div>
  )
}
