import { cn } from '@/lib/utils'

interface NutritionSummaryProps {
  protein: number
  carbs: number
  fat: number
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function NutritionSummary({
  protein,
  carbs,
  fat,
  size = 'md',
  className,
}: NutritionSummaryProps) {
  return (
    <span
      className={cn(
        'text-muted-foreground flex items-center gap-1',
        size === 'sm' && 'text-xs',
        size === 'md' && 'text-sm',
        size === 'lg' && 'text-base',
        className,
      )}
    >
      <span className="text-green-500">{Math.round(protein)}P</span>
      <span className="text-muted-foreground">•</span>
      <span className="text-blue-500">{Math.round(carbs)}C</span>
      <span className="text-muted-foreground">•</span>
      <span className="text-amber-500">{Math.round(fat)}F</span>
    </span>
  )
}
