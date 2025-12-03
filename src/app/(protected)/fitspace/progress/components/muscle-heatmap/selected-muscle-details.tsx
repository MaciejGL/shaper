'use client'

import { formatDistanceToNow, parseISO } from 'date-fns'
import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

import { HEATMAP_COLORS } from '../../constants/heatmap-colors'

import type { SelectedMuscleDetailsProps } from './types'

export function SelectedMuscleDetails({
  selectedMuscle,
  muscleProgress,
}: SelectedMuscleDetailsProps) {
  const progress = muscleProgress[selectedMuscle]
  
  if (!progress) {
    return null
  }

  const colorLevel = HEATMAP_COLORS.getColorForProgress(progress.percentage / 100)
  const isComplete = progress.percentage >= 100
  const setsRemaining = Math.max(0, progress.targetSets - progress.completedSets)

  const getStatusMessage = () => {
    if (isComplete) return 'Target reached!'
    if (setsRemaining === 1) return '1 more set to go'
    return `${setsRemaining} more sets to complete`
  }

  const formatLastTrained = () => {
    if (!progress.lastTrained) return 'Not trained this week'
    try {
      return `Trained ${formatDistanceToNow(parseISO(progress.lastTrained), { addSuffix: true })}`
    } catch {
      return 'Recently trained'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="rounded-lg border bg-card p-4"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{selectedMuscle}</h3>
          <p className="text-sm text-muted-foreground">
            {formatLastTrained()}
          </p>
        </div>
        <div className="text-right">
          <span className={cn(
            'text-2xl font-bold tabular-nums',
            isComplete && 'text-orange-500',
          )}>
            {progress.completedSets}
          </span>
          <span className="text-muted-foreground">/{progress.targetSets}</span>
          <p className="text-xs text-muted-foreground">sets</p>
        </div>
      </div>

      {/* Large progress bar */}
      <div className="mt-4">
        <div className="relative h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full',
              colorLevel.progressColor,
              isComplete && 'animate-pulse',
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress.percentage, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className={cn(
            'font-medium',
            isComplete ? 'text-orange-500' : 'text-muted-foreground',
          )}>
            {getStatusMessage()}
          </span>
          <span className="font-semibold tabular-nums">
            {Math.round(progress.percentage)}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}
