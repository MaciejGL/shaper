'use client'

import { cn } from '@/lib/utils'

interface MeasurementConnectionLineProps {
  bodyX: number
  bodyY: number
  inputX: number
  inputY: number
  side: 'left' | 'right'
  hasValue?: boolean
  isFocused?: boolean
}

export function MeasurementConnectionLine({
  bodyX,
  bodyY,
  inputX,
  inputY,
  side,
  hasValue = false,
  isFocused = false,
}: MeasurementConnectionLineProps) {
  const stepX =
    side === 'left'
      ? inputX + (bodyX - inputX) * 0.3
      : inputX - (inputX - bodyX) * 0.3

  const pathData = `M ${inputX} ${inputY} L ${stepX} ${inputY} L ${bodyX} ${bodyY}`

  return (
    <g className="measurement-connection">
      <path
        d={pathData}
        strokeWidth={1.5}
        fill="none"
        className={cn(
          'transition-all duration-200',
          isFocused
            ? 'stroke-primary'
            : hasValue
              ? 'stroke-primary/60'
              : 'stroke-muted-foreground/40',
        )}
      />
      <circle
        cx={bodyX}
        cy={bodyY}
        r={isFocused ? 5 : 4}
        className={cn(
          'transition-all duration-200',
          isFocused
            ? 'fill-primary'
            : hasValue
              ? 'fill-primary/60'
              : 'fill-muted-foreground/40',
        )}
      />
    </g>
  )
}
