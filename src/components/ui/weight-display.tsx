import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { cn } from '@/lib/utils'

interface WeightDisplayProps {
  weightInKg: number | null | undefined
  decimals?: number
  className?: string
  showUnit?: boolean
}

export function WeightDisplay({
  weightInKg,
  decimals = 1,
  className,
  showUnit = true,
}: WeightDisplayProps) {
  const { formatDisplayWeight, toDisplayWeight } = useWeightConversion()

  if (weightInKg == null) {
    return <span className={cn('text-muted-foreground', className)}>-</span>
  }

  if (showUnit) {
    return (
      <span className={className}>
        {formatDisplayWeight(weightInKg, decimals)}
      </span>
    )
  }

  const displayWeight = toDisplayWeight(weightInKg)
  return (
    <span className={className}>{displayWeight?.toFixed(decimals) || '-'}</span>
  )
}
