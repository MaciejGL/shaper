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
        className={cn('bg-green-500/20 text-green-500 min-w-12')}
        size={size}
      >
        {formattedValue}P
      </Badge>
    )
  }
  if (macro === 'carbs') {
    return (
      <Badge
        className={cn('bg-blue-500/20 text-blue-500 min-w-12')}
        size={size}
      >
        {formattedValue}C
      </Badge>
    )
  }
  if (macro === 'fat') {
    return (
      <Badge
        className={cn('bg-yellow-500/20 text-yellow-500 min-w-12')}
        size={size}
      >
        {formattedValue}F
      </Badge>
    )
  }
  if (macro === 'calories') {
    return (
      <Badge className={cn('bg-primary/20 text-primary min-w-12')} size={size}>
        {formattedValue}kcal
      </Badge>
    )
  }
  return (
    <Badge
      className={cn('bg-muted/20 text-muted-foreground min-w-12')}
      size={size}
    >
      {formattedValue}g
    </Badge>
  )
}
