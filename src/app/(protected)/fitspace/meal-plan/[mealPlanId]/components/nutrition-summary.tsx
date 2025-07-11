import { cn } from '@/lib/utils'

interface NutritionSummaryProps {
  protein: number
  carbs: number
  fat: number
  className?: string
}

export function NutritionSummary({
  protein,
  carbs,
  fat,
  className,
}: NutritionSummaryProps) {
  return (
    <span className={cn('text-muted-foreground text-xs', className)}>
      {Math.round(protein)}P • {Math.round(carbs)}C • {Math.round(fat)}F
    </span>
  )
}
