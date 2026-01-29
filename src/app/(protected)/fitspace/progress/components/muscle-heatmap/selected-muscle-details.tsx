'use client'

import { formatDistanceToNow, parseISO } from 'date-fns'
import { motion } from 'framer-motion'

import { Separator } from '@/components/ui/separator'
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

  const colorLevel = HEATMAP_COLORS.getColorForProgress(
    progress.percentage / 100,
  )
  const hasSubMuscles = progress.subMuscles && progress.subMuscles.length > 1
  const primaryExercises = progress.exerciseContributions.filter(
    (contribution) => contribution.contributionType === 'PRIMARY',
  )
  const secondaryExercises = progress.exerciseContributions.filter(
    (contribution) => contribution.contributionType === 'SECONDARY',
  )
  const hasExercises =
    primaryExercises.length > 0 || secondaryExercises.length > 0

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
          <p className="text-sm text-muted-foreground">{formatLastTrained()}</p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold tabular-nums">
            {progress.completedSets}
          </span>
          <p className="text-xs text-muted-foreground">sets this week</p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="relative h-3 overflow-hidden rounded-full bg-muted">
          <motion.div
            className={cn(
              'absolute inset-y-0 left-0 rounded-full',
              colorLevel.progressColor,
            )}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress.percentage, 100)}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Sub-muscle breakdown */}
      {hasSubMuscles && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-4 space-y-2 border-t pt-4"
        >
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Breakdown
          </p>
          <div className="space-y-1.5">
            {progress.subMuscles.map((sub) => (
              <div
                key={sub.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="text-muted-foreground">{sub.alias}</span>
                <span className="font-medium tabular-nums">
                  {sub.completedSets} sets
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="mt-4 space-y-3 border-t pt-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Exercises
        </p>
        {!hasExercises && (
          <p className="text-sm text-muted-foreground">
            No exercise contributions this week.
          </p>
        )}
        {primaryExercises.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Primary</p>
            <div className="space-y-1.5">
              {primaryExercises.map((exercise) => (
                <div
                  key={exercise.exerciseId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground">
                    {exercise.exerciseName}
                  </span>
                  <div className="text-right whitespace-nowrap">
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {exercise.rawSets} sets
                    </span>
                    <span className="ml-2 font-medium tabular-nums">
                      {exercise.weightedSets.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {primaryExercises.length > 0 && secondaryExercises.length > 0 && (
          <Separator />
        )}
        {secondaryExercises.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Secondary
            </p>
            <div className="space-y-1.5">
              {secondaryExercises.map((exercise) => (
                <div
                  key={exercise.exerciseId}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-muted-foreground font-medium">
                    {exercise.exerciseName}
                  </span>
                  <div className="text-right whitespace-nowrap">
                    <span className="tabular-nums text-xs text-muted-foreground">
                      {exercise.rawSets} sets
                    </span>
                    <span className="ml-2 font-medium tabular-nums">
                      {exercise.weightedSets.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}
