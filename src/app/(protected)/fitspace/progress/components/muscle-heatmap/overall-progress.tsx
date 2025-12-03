'use client'

import { motion } from 'framer-motion'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface OverallProgressProps {
  percentage: number
  isLoading?: boolean
}

export function OverallProgress({ percentage, isLoading }: OverallProgressProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <Skeleton className="size-24 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  // SVG circle parameters
  const size = 96
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(percentage, 100)
  const strokeDashoffset = circumference - (progress / 100) * circumference

  const getProgressLabel = () => {
    if (percentage >= 100) return 'Week Complete!'
    if (percentage >= 75) return 'Almost there!'
    if (percentage >= 50) return 'Good progress'
    if (percentage >= 25) return 'Getting started'
    return 'Start training'
  }

  const getProgressColor = () => {
    if (percentage >= 100) return 'stroke-orange-500'
    if (percentage >= 75) return 'stroke-orange-400'
    if (percentage >= 50) return 'stroke-orange-300'
    if (percentage >= 25) return 'stroke-orange-200'
    return 'stroke-muted'
  }

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="relative">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-muted"
          />
          {/* Progress circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cn(getProgressColor())}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </svg>
        {/* Percentage text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.span
            className="text-xl font-bold tabular-nums"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            {Math.round(percentage)}%
          </motion.span>
        </div>
      </div>
      <span className="text-sm text-muted-foreground">{getProgressLabel()}</span>
    </div>
  )
}

