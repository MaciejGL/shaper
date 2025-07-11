import { FlameIcon } from 'lucide-react'

import { Badge, BadgeProps } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function MacroBadge({
  macro,
  value,
  size,
  className,
}: {
  macro: 'protein' | 'carbs' | 'fat' | 'calories' | 'fiber'
  value: number
  size?: BadgeProps['size']
  className?: string
}) {
  const formattedValue = value.toFixed(0)
  if (macro === 'protein') {
    return (
      <Badge
        className={cn(
          'bg-green-500/20 text-green-600 dark:text-green-500 min-w-12 font-medium rounded-full',
          size === 'xs' && 'min-w-8',
          className,
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
          'bg-blue-500/20 text-blue-600 dark:text-blue-500 min-w-12 font-medium rounded-full',
          size === 'xs' && 'min-w-8',
          className,
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
          'bg-yellow-500/20 text-yellow-600 dark:text-yellow-500 min-w-12 font-medium rounded-full',
          size === 'xs' && 'min-w-8',
          className,
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
          'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary min-w-12 font-medium rounded-full',
          size === 'xs' && 'min-w-8',
          className,
        )}
        size={size}
      >
        {formattedValue} <FlameIcon />
      </Badge>
    )
  }
  return (
    <Badge
      className={cn(
        'bg-primary/10 text-primary dark:text-muted min-w-12 font-medium rounded-full',
        size === 'xs' && 'min-w-8',
        className,
      )}
      size={size}
    >
      {formattedValue}g
    </Badge>
  )
}

export function BigMacroBadge({
  macro,
  value,
  className,
}: {
  macro: 'protein' | 'carbs' | 'fat' | 'calories' | 'fiber'
  value: number
  className?: string
}) {
  const sharedClasses = cn(
    'flex flex-col items-center justify-center p-3 rounded-lg shrink-0 size-[4.625rem]',
  )
  const formattedValue = value.toFixed(0)
  if (macro === 'protein') {
    return (
      <Badge className={cn(sharedClasses, 'bg-green-500/20', className)}>
        <p className="text-primary text-lg font-semibold">{formattedValue}g</p>
        <p className="text-xs text-muted-foreground">protein</p>
      </Badge>
    )
  }
  if (macro === 'carbs') {
    return (
      <Badge className={cn(sharedClasses, 'bg-blue-500/20', className)}>
        <p className="text-primary text-lg font-semibold">{formattedValue}g</p>
        <p className="text-xs text-muted-foreground">carbs</p>
      </Badge>
    )
  }
  if (macro === 'fat') {
    return (
      <Badge className={cn(sharedClasses, 'bg-yellow-500/20', className)}>
        <p className="text-primary text-lg font-semibold">{formattedValue}g</p>
        <p className="text-xs text-muted-foreground">fat</p>
      </Badge>
    )
  }
  if (macro === 'calories') {
    return (
      <Badge
        className={cn(
          sharedClasses,
          'bg-primary/10 dark:bg-primary/20',
          className,
        )}
      >
        <p className="text-primary text-lg font-semibold">{formattedValue}</p>
        <p className="text-xs text-muted-foreground">kcal</p>
      </Badge>
    )
  }
  return (
    <Badge
      className={cn(
        sharedClasses,
        'bg-primary/10 text-primary dark:text-muted',
        className,
      )}
    >
      <p className="text-primary text-lg font-semibold">{formattedValue}g</p>
      <p className="text-xs text-muted-foreground">fiber</p>
    </Badge>
  )
}
