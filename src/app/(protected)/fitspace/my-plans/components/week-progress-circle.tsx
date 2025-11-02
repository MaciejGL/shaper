import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'

interface WeekProgressCircleProps {
  progress: number // 0-100
  size?: number
  className?: string
  strokeWidth?: number
}

export function WeekProgressCircle({
  progress,
  size = 20,
  className,
  strokeWidth = 2,
}: WeekProgressCircleProps) {
  const isComplete = progress === 100
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div
      className={cn(
        'relative flex items-center justify-center mx-auto mb-1',
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
          className={cn(
            'transition-all duration-300',
            isComplete ? 'text-green-500' : 'text-amber-500',
          )}
        />
      </svg>

      {/* Check mark when complete */}
      {isComplete && (
        <Check
          className="text-green-500"
          style={{ width: size * 0.6, height: size * 0.6 }}
        />
      )}
    </div>
  )
}
