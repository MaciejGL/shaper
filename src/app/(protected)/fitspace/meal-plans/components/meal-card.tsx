import { format } from 'date-fns'
import { Clock } from 'lucide-react'

import { FoodItem } from './food-item'

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

interface MealCardProps {
  meal: Meal
}

export function MealCard({ meal }: MealCardProps) {
  return (
    <div className="bg-muted/50 rounded p-2">
      <div className="flex items-center justify-between mb-2">
        <div className="font-medium text-sm">{meal.name}</div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {format(new Date(meal.dateTime), 'HH:mm')}
        </div>
      </div>

      {meal.instructions && (
        <p className="text-xs text-muted-foreground mb-2">
          {meal.instructions}
        </p>
      )}

      {/* Foods */}
      {meal.foods && meal.foods.length > 0 ? (
        <div className="space-y-1">
          {meal.foods.map((food) => (
            <FoodItem key={food.id} food={food} />
          ))}
        </div>
      ) : (
        <div className="text-xs text-muted-foreground">No foods added yet</div>
      )}
    </div>
  )
}
