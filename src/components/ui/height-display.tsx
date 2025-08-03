import { useHeightConversion } from '@/hooks/use-height-conversion'
import { cn } from '@/lib/utils'

interface HeightDisplayProps {
  heightInCm: number | null | undefined
  className?: string
  showUnit?: boolean
}

export function HeightDisplay({
  heightInCm,
  className,
  showUnit = true,
}: HeightDisplayProps) {
  const { formatDisplayHeight } = useHeightConversion()

  if (heightInCm == null) {
    return <span className={cn('text-muted-foreground', className)}>-</span>
  }

  if (showUnit) {
    return <span className={className}>{formatDisplayHeight(heightInCm)}</span>
  }

  // For showUnit=false, we need to extract just the number part
  const formatted = formatDisplayHeight(heightInCm)
  const numberPart = formatted.replace(/\s*(cm|'|")/g, '')

  return <span className={className}>{numberPart}</span>
}
