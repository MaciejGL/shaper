import { FlameIcon } from 'lucide-react'

import { MealCardProps } from './meal-card'

export function FoodItem({
  food,
  onClick,
}: {
  food: MealCardProps['meal']['foods'][0]
  onClick: () => void
}) {
  return (
    <button
      key={food.id}
      className="bg-card p-2 rounded-lg space-y-1 h-[56px] overflow-hidden"
      onClick={() => {
        onClick?.()
      }}
    >
      <div className="flex justify-between gap-2">
        <p className="text-sm font-medium truncate min-w-0 flex-1 text-left">
          {food.name}
        </p>
        <p className="text-xs shrink-0 whitespace-nowrap">
          {food.log?.loggedQuantity || food.quantity} {food.unit}
        </p>
      </div>
      <div className="flex gap-1">
        <span className="text-xs text-muted-foreground flex items-center">
          {Math.round(food.totalCalories)}
          <FlameIcon className="size-3" />
        </span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">
          {Math.round(food.totalProtein)}P
        </span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">
          {Math.round(food.totalCarbs)}C
        </span>
        <span className="text-xs text-muted-foreground">•</span>
        <span className="text-xs text-muted-foreground">
          {Math.round(food.totalFat)}F
        </span>
      </div>
    </button>
  )
}
