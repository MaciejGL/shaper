interface Food {
  id: string
  name: string
  quantity: number
  unit: string
}

interface FoodItemProps {
  food: Food
}

export function FoodItem({ food }: FoodItemProps) {
  return (
    <div className="flex items-center justify-between text-xs bg-background/50 rounded px-2 py-1">
      <span className="font-medium">{food.name}</span>
      <span className="text-muted-foreground">
        {food.quantity}
        {food.unit}
      </span>
    </div>
  )
}
