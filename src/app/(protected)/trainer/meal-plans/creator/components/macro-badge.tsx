import { Badge, BadgeProps } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function MacroBadge({
  macro,
  value,
  size,
}: {
  macro: 'protein' | 'carbs' | 'fat' | 'calories' | 'fiber'
  value: number
  size?: BadgeProps['size']
}) {
  const formattedValue = value.toFixed(0)
  if (macro === 'protein') {
    return (
      <Badge
        className={cn(
          'bg-green-500/20 text-green-600 dark:text-green-500 min-w-12 font-medium',
        )}
        size={size}
      >
        {formattedValue}P
      </Badge>
    )
  }
  if (macro === 'carbs') {
    return (
      <Badge
        className={cn(
          'bg-blue-500/20 text-blue-600 dark:text-blue-500 min-w-12 font-medium',
        )}
        size={size}
      >
        {formattedValue}C
      </Badge>
    )
  }
  if (macro === 'fat') {
    return (
      <Badge
        className={cn(
          'bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 min-w-12 font-medium',
        )}
        size={size}
      >
        {formattedValue}F
      </Badge>
    )
  }
  if (macro === 'calories') {
    return (
      <Badge
        className={cn(
          'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary min-w-12 font-medium',
        )}
        size={size}
      >
        {formattedValue}kcal
      </Badge>
    )
  }
  return (
    <Badge
      className={cn(
        'bg-primary/10 text-primary dark:text-muted min-w-12 font-medium',
      )}
      size={size}
    >
      {formattedValue}g
    </Badge>
  )
}
