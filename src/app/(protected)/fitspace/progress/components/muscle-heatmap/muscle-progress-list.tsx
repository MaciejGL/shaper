'use client'

import { motion } from 'framer-motion'

import { cn } from '@/lib/utils'

import { HEATMAP_COLORS } from '../../constants/heatmap-colors'

import type { MuscleProgressListProps } from './types'

export function MuscleProgressList({
  muscleProgress,
  onMuscleClick,
  selectedMuscle,
}: MuscleProgressListProps) {
  // Muscles are already ordered by popularity from the backend
  const muscles = Object.entries(muscleProgress)

  if (muscles.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-muted-foreground">
        Muscle Progress
      </h3>
      <div className="grid gap-2">
        {muscles.map(([muscleGroup, progress], index) => {
          const colorLevel = HEATMAP_COLORS.getColorForProgress(
            progress.percentage / 100,
          )
          const isSelected = selectedMuscle === muscleGroup
          const isComplete = progress.percentage >= 100

          return (
            <motion.button
              key={muscleGroup}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02, duration: 0.2 }}
              onClick={() => onMuscleClick(muscleGroup)}
              className={cn(
                'group flex items-center gap-3 rounded-lg p-2 text-left transition-colors',
                'hover:bg-muted/50',
                isSelected && 'bg-muted',
              )}
            >
              {/* Progress bar */}
              <div className="relative h-2 w-16 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className={cn(
                    'absolute inset-y-0 left-0 rounded-full',
                    colorLevel.progressColor,
                    isComplete && 'animate-pulse',
                  )}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress.percentage, 100)}%` }}
                  transition={{ duration: 0.5, delay: index * 0.02 }}
                />
              </div>

              {/* Muscle name */}
              <span className="flex-1 text-sm font-medium">{muscleGroup}</span>

              {/* Sets count */}
              <span className="text-sm tabular-nums text-muted-foreground">
                {progress.completedSets}/{progress.targetSets}
              </span>

              {/* Percentage */}
              <span
                className={cn(
                  'min-w-[3rem] text-right text-sm font-medium tabular-nums',
                  isComplete ? 'text-orange-500' : 'text-muted-foreground',
                )}
              >
                {Math.round(progress.percentage)}%
              </span>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
