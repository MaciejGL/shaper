import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

interface ProgressCircleProps {
  progress: number
  size?: number
  className?: string
  strokeWidth?: number
  showValue?: boolean
}

export function ProgressCircle({
  progress,
  size = 20,
  className,
  strokeWidth = 2,
  showValue = false,
}: ProgressCircleProps) {
  const percentage = Math.min(100, Math.max(0, progress))
  const isComplete = percentage === 100
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  const getProgressColor = (value: number): string => {
    if (value >= 90) return 'text-green-600 dark:text-green-500'
    if (value >= 80) return 'text-green-600 dark:text-green-500'
    if (value >= 70) return 'text-green-500'
    if (value >= 60) return 'text-green-400'
    if (value >= 50) return 'text-amber-500'
    if (value >= 40) return 'text-amber-400'
    if (value >= 10) return 'text-amber-300'
    return 'text-primary'
  }

  const fontSize = size < 30 ? size * 0.35 : size * 0.25

  return (
    <div
      className={cn(
        'relative flex items-center justify-center',
        className,
      )}
      style={{ width: size, height: size }}
    >
      {/* Background circle */}
      <svg
        className="absolute inset-0 -rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/20"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={cn('transition-all duration-300', getProgressColor(percentage))}
        />
      </svg>

      {/* Center content */}
      {isComplete ? (
        <Check
          className="text-green-500"
          style={{ width: size * 0.6, height: size * 0.6 }}
        />
      ) : showValue ? (
        <span
          className="font-bold tabular-nums text-foreground"
          style={{ fontSize: `${fontSize}px` }}
        >
          {Math.round(percentage)}%
        </span>
      ) : null}
    </div>
  )
}

