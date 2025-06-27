export function ConnectionLine({
  muscleX,
  muscleY,
  labelX,
  labelY,
}: {
  muscleX: number
  muscleY: number
  labelX: number
  labelY: number
}) {
  // Calculate the midpoint for the step (50% of the distance)
  const stepX = labelX + (muscleX - labelX) * 0.15

  // Create step path: horizontal line first, then straight to muscle
  const pathData = `M ${labelX} ${labelY} L ${stepX} ${labelY} L ${muscleX} ${muscleY}`

  return (
    <>
      <g className="muscle-label-group">
        {/* Connection line with curve */}
        <path
          d={pathData}
          strokeWidth="1.5"
          fill="none"
          strokeDasharray="4,0"
          opacity="0.6"
          className="transition-all duration-300 stroke-amber-500/60"
        />

        {/* Connection point on muscle */}
        <circle
          cx={muscleX}
          cy={muscleY}
          r="4"
          className="transition-all duration-300 fill-amber-600"
        />
      </g>
    </>
  )
}
