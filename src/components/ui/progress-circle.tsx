'use client'

import { Check } from 'lucide-react'
import { useEffect, useState } from 'react'

import { cn } from '@/lib/utils'

interface ProgressCircleProps {
  progress: number
  size?: number
  className?: string
  strokeWidth?: number
  showValue?: boolean
  hideCheckmark?: boolean
}

export function ProgressCircle({
  progress,
  size = 20,
  className,
  strokeWidth = 2,
  showValue = false,
  hideCheckmark = false,
}: ProgressCircleProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    const clampedProgress = Math.min(100, Math.max(0, progress))
    const duration = 800
    const startTime = Date.now()

    const animate = () => {
      const elapsed = Date.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      const easeOut = 1 - Math.pow(1 - t, 3)

      setDisplayProgress(Math.round(easeOut * clampedProgress))

      if (elapsed < duration) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  }, [progress])

  const percentage = Math.min(100, Math.max(0, progress))
  const isComplete = percentage === 100
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset =
    circumference - (displayProgress / 100) * circumference

  const getProgressColor = (value: number): string => {
    if (value >= 90) return 'text-green-600 dark:text-green-500'
    if (value >= 80) return 'text-green-600 dark:text-green-500'
    if (value >= 70) return 'text-green-500'
    if (value >= 60) return 'text-green-500'
    if (value >= 50) return 'text-green-500'
    if (value >= 40) return 'text-green-500'
    if (value >= 10) return 'text-green-500'
    return 'text-primary'
  }

  const fontSize = size < 30 ? size * 0.35 : size * 0.25

  return (
    <div
      className={cn('relative flex items-center justify-center', className)}
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
            'transition-all duration-75',
            getProgressColor(percentage),
          )}
        />
      </svg>

      {/* Center content */}
      {isComplete && !hideCheckmark ? (
        <Check
          className="text-green-500 animate-in scale-in-50 duration-300"
          style={{ width: size * 0.5, height: size * 0.5 }}
        />
      ) : showValue ? (
        <span
          className="font-bold tabular-nums text-foreground transition-all duration-75"
          style={{ fontSize: `${fontSize}px` }}
        >
          {displayProgress}%
        </span>
      ) : null}
    </div>
  )
}
