'use client'

import { cn } from '@/lib/utils'

interface MeasurementConnectionLineProps {
  bodyX: number
  bodyY: number
  inputX: number
  inputY: number
  side: 'left' | 'right'
  isFocused?: boolean
  /** When true, uses coordinates directly (for full-width overlay SVG) */
  useAbsoluteCoords?: boolean
}

export function MeasurementConnectionLine({
  bodyX,
  bodyY,
  inputX,
  inputY,
  side,
  isFocused = false,
  useAbsoluteCoords = false,
}: MeasurementConnectionLineProps) {
  // Calculate the elbow point for the L-shaped line
  const elbowX = useAbsoluteCoords
    ? side === 'left'
      ? inputX + (bodyX - inputX) * 0.2
      : inputX - (inputX - bodyX) * 0.2
    : side === 'left'
      ? inputX + (bodyX - inputX) * 0.3
      : inputX - (inputX - bodyX) * 0.3

  const pathData = `M ${inputX} ${inputY} L ${elbowX} ${inputY} L ${bodyX} ${bodyY}`

  return (
    <g className="measurement-connection">
      <path
        d={pathData}
        strokeWidth={useAbsoluteCoords ? 1 : 1.5}
        fill="none"
        className={cn(
          'transition-all duration-200',
          isFocused ? 'stroke-primary' : 'stroke-primary/60',
        )}
      />
      <circle
        cx={bodyX}
        cy={bodyY}
        r={isFocused ? 4 : 3}
        className={cn(
          'transition-all duration-200',
          isFocused ? 'fill-primary' : 'fill-primary/60',
        )}
      />
    </g>
  )
}
