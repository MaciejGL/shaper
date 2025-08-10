import { VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const circularProgressVariants = cva('', {
  variants: {
    size: {
      sm: 'w-12 h-12',
      md: 'w-16 h-16',
      lg: 'w-20 h-20',
      xl: 'w-24 h-24',
    },
    variant: {
      default: 'text-primary',
      protein: 'text-green-600 dark:text-green-400',
      carbs: 'text-blue-600 dark:text-blue-400',
      fat: 'text-yellow-600 dark:text-yellow-400',
      calories: 'text-amber-600 dark:text-amber-400',
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'default',
  },
})

interface CircularProgressProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof circularProgressVariants> {
  value: number // 0-100
  strokeWidth?: number
  label?: string
  sublabel?: string
  showPercentage?: boolean
}

export function CircularProgress({
  value,
  size,
  variant,
  strokeWidth = 3,
  label,
  sublabel,
  showPercentage = false,
  className,
  ...props
}: CircularProgressProps) {
  const percentage = Math.min(100, Math.max(0, value))

  // Calculate circle dimensions based on size
  const sizeMap = {
    sm: { radius: 18, width: 48, height: 48 },
    md: { radius: 26, width: 64, height: 64 },
    lg: { radius: 34, width: 80, height: 80 },
    xl: { radius: 42, width: 96, height: 96 },
  }

  const dimensions = sizeMap[size || 'md']
  const { radius, width, height } = dimensions
  const circumference = 2 * Math.PI * radius
  const strokeDasharray = circumference
  const strokeDashoffset = circumference * (1 - percentage / 100)

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center',
        circularProgressVariants({ size }),
        className,
      )}
      {...props}
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          className="opacity-20"
        />

        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn(
            'transition-all duration-500 ease-out',
            circularProgressVariants({ variant }),
          )}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {showPercentage && (
          <span className="text-xs font-bold tabular-nums">
            {Math.round(percentage)}%
          </span>
        )}
        {label && !showPercentage && (
          <span className="text-xs font-bold leading-none">{label}</span>
        )}
        {sublabel && (
          <span className="text-[10px] text-muted-foreground leading-none mt-0.5">
            {sublabel}
          </span>
        )}
      </div>
    </div>
  )
}
