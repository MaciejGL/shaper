'use client'

import { formatDistanceToNow } from 'date-fns'
import { ChevronRight, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'

import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import { Skeleton } from '@/components/ui/skeleton'
import {
  type GQLFitspaceDashboardGetRecentProgressQuery,
  useFitspaceDashboardGetRecentProgressQuery,
} from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

interface ExerciseProgress {
  exerciseId: string
  exerciseName: string

  // Last session
  lastSession: {
    date: string
    bestSet: {
      weight: number
      reps: number
      volume: number // weight × reps
    }
  }

  // Current/Recent session
  currentSession: {
    date: string
    bestSet: {
      weight: number
      reps: number
      volume: number
    }
  }

  // Calculated progress
  progress: {
    weight: { change: number; percentage: number }
    reps: { change: number; percentage: number }
    volume: { change: number; percentage: number }
    timeGap: string // "3 days ago"
    isOldComparison?: boolean // true if > 2 weeks old
  }

  progressType: 'weight' | 'reps' | 'volume' | 'mixed'
  trend: 'improved' | 'maintained' | 'declined'
}

type WorkoutSession = NonNullable<
  GQLFitspaceDashboardGetRecentProgressQuery['getRecentCompletedWorkouts']
>[0]

// Helper function to calculate progress from recent workout sessions
function calculateProgressFromSessions(
  sessions: WorkoutSession[],
): ExerciseProgress[] {
  if (sessions.length < 2) {
    return []
  }

  const [currentSession, lastSession] = sessions
  const progress: ExerciseProgress[] = []

  // Compare exercises that appear in both sessions
  for (const currentEx of currentSession.exercises || []) {
    const lastEx = (lastSession.exercises || []).find(
      (ex: WorkoutSession['exercises'][0]) => {
        // Match by baseId if both have valid baseIds
        if (currentEx.baseId && ex.baseId && currentEx.baseId === ex.baseId) {
          return true
        }
        // Otherwise match by name
        return currentEx.name === ex.name
      },
    )

    if (lastEx) {
      const currentBest = getBestSetFromExercise(currentEx)
      const lastBest = getBestSetFromExercise(lastEx)

      if (currentBest && lastBest) {
        // Use the latest log date from each session instead of completedAt
        const currentSessionDate = Math.max(
          ...currentEx.sets!.map((s) =>
            s.log?.createdAt ? new Date(s.log.createdAt).getTime() : 0,
          ),
        )
        const lastSessionDate = Math.max(
          ...lastEx.sets!.map((s) =>
            s.log?.createdAt ? new Date(s.log.createdAt).getTime() : 0,
          ),
        )

        const progressItem = calculateExerciseProgress(
          currentEx,
          currentBest,
          lastBest,
          new Date(currentSessionDate).toISOString(),
          new Date(lastSessionDate).toISOString(),
        )

        // Show improved and maintained performance (not just improvements)
        if (
          progressItem.trend === 'improved' ||
          progressItem.trend === 'maintained'
        ) {
          progress.push(progressItem)
        }
      }
    }
  }
  return progress.slice(0, 3) // Show only top 3 improvements
}

// Helper function to get the best set from an exercise
function getBestSetFromExercise(exercise: WorkoutSession['exercises'][0]) {
  if (!exercise.sets?.length) return null

  let bestSet = null
  let maxVolume = 0

  for (const set of exercise.sets) {
    if (set.log?.weight && set.log?.reps) {
      const volume = set.log.weight * set.log.reps
      if (volume > maxVolume) {
        maxVolume = volume
        bestSet = {
          weight: set.log.weight,
          reps: set.log.reps,
          volume,
        }
      }
    }
  }

  return bestSet
}

// Helper function to calculate progress between two exercise sessions
function calculateExerciseProgress(
  exercise: WorkoutSession['exercises'][0],
  currentBest: { weight: number; reps: number; volume: number },
  lastBest: { weight: number; reps: number; volume: number },
  currentDate: string,
  lastDate: string,
): ExerciseProgress {
  const weightChange = currentBest.weight - lastBest.weight
  const repsChange = currentBest.reps - lastBest.reps
  const volumeChange = currentBest.volume - lastBest.volume

  const weightPercentage =
    lastBest.weight > 0 ? (weightChange / lastBest.weight) * 100 : 0
  const repsPercentage =
    lastBest.reps > 0 ? (repsChange / lastBest.reps) * 100 : 0
  const volumePercentage =
    lastBest.volume > 0 ? (volumeChange / lastBest.volume) * 100 : 0

  // Determine primary progress type
  let progressType: ExerciseProgress['progressType'] = 'volume'
  if (Math.abs(weightChange) > 0.1) progressType = 'weight'
  else if (Math.abs(repsChange) > 0) progressType = 'reps'

  // Determine trend
  let trend: ExerciseProgress['trend'] = 'maintained'
  if (volumeChange > 0) trend = 'improved'
  else if (volumeChange < 0) trend = 'declined'

  const timeGap = formatDistanceToNow(new Date(lastDate), { addSuffix: true })

  // Check if comparison is quite old (more than 2 weeks)
  const daysSinceLastWorkout = Math.floor(
    (new Date(currentDate).getTime() - new Date(lastDate).getTime()) /
      (1000 * 60 * 60 * 24),
  )
  const isOldComparison = daysSinceLastWorkout > 14

  return {
    exerciseId: exercise.id,
    exerciseName: exercise.name, // Use exercise name directly since we don't have base relation
    lastSession: {
      date: lastDate,
      bestSet: lastBest,
    },
    currentSession: {
      date: currentDate,
      bestSet: currentBest,
    },
    progress: {
      weight: {
        change: Math.round(weightChange * 10) / 10,
        percentage: Math.round(weightPercentage * 10) / 10,
      },
      reps: {
        change: repsChange,
        percentage: Math.round(repsPercentage * 10) / 10,
      },
      volume: {
        change: Math.round(volumeChange * 10) / 10,
        percentage: Math.round(volumePercentage * 10) / 10,
      },
      timeGap,
      isOldComparison,
    },
    progressType,
    trend,
  }
}

function ProgressItem({ progress }: { progress: ExerciseProgress }) {
  const getProgressText = () => {
    if (progress.trend === 'maintained') {
      return 'Same performance'
    }

    const getChangeText = (change: number, unit: string) => {
      if (change === 0) return `Same ${unit}`
      const sign = change > 0 ? '+' : ''
      return `${sign}${change}${unit}`
    }

    switch (progress.progressType) {
      case 'weight':
        return getChangeText(progress.progress.weight.change, 'kg')
      case 'reps':
        return getChangeText(progress.progress.reps.change, ' reps')
      case 'volume':
        return getChangeText(progress.progress.volume.change, 'kg volume')
      default:
        return progress.trend === 'improved'
          ? 'Mixed improvements'
          : 'No change'
    }
  }

  const getProgressColor = () => {
    switch (progress.trend) {
      case 'improved':
        return 'text-green-600 dark:text-green-400'
      case 'declined':
        return 'text-red-600 dark:text-red-400'
      default:
        return 'text-gray-600 dark:text-gray-400'
    }
  }

  const getIconAndBackground = () => {
    switch (progress.trend) {
      case 'improved':
        return {
          background: 'bg-green-100 dark:bg-green-900/20',
          icon: (
            <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
          ),
        }
      case 'maintained':
        return {
          background: 'bg-blue-100 dark:bg-blue-900/20',
          icon: (
            <div className="h-4 w-4 rounded-full bg-blue-600 dark:bg-blue-400" />
          ),
        }
      default:
        return {
          background: 'bg-gray-100 dark:bg-gray-900/20',
          icon: (
            <TrendingUp className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          ),
        }
    }
  }

  const { background, icon } = getIconAndBackground()

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
      <div
        className={cn(
          'w-8 h-8 rounded-full flex items-center justify-center',
          background,
        )}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">
          {progress.exerciseName}
        </div>
        <div className="text-xs text-muted-foreground">
          <p>
            {progress.currentSession.bestSet.weight}kg ×{' '}
            {progress.currentSession.bestSet.reps}
          </p>
          <p className={cn('ml-1 font-medium', getProgressColor())}>
            {getProgressText()}
          </p>
          <p>
            {progress.progress.timeGap}

            {progress.progress.isOldComparison && (
              <span className="text-amber-600 dark:text-amber-400">
                {' '}
                (older data)
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

function EmptyProgress() {
  return (
    <div className="text-center py-6 px-4">
      <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
        <TrendingUp className="h-6 w-6 text-muted-foreground/70" />
      </div>
      <p className="text-sm text-muted-foreground mb-2">No logged workouts</p>
      <p className="text-xs text-muted-foreground/70 mb-4">
        Complete workouts with logged weights and reps to see progress
      </p>
    </div>
  )
}

export function RecentProgressSkeleton() {
  return (
    <Card variant="secondary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <SectionIcon icon={TrendingUp} variant="green" />
          Recent Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
            >
              <Skeleton className="w-8 h-8 rounded-full shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <div className="text-right">
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ProgressSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
        >
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="text-right">
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function RecentProgressSection() {
  const { data, isLoading, error } = useFitspaceDashboardGetRecentProgressQuery(
    undefined,
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  )

  // Calculate progress from the data
  const progress = useMemo(() => {
    if (!data?.getRecentCompletedWorkouts) return []
    return calculateProgressFromSessions(data.getRecentCompletedWorkouts)
  }, [data])

  const combinedLoading = isLoading
  const progressError = error

  if (combinedLoading) {
    return (
      <Card variant="secondary">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <SectionIcon icon={TrendingUp} variant="green" />
            Recent Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProgressSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="secondary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <SectionIcon icon={TrendingUp} variant="green" />
          Recent Progress
        </CardTitle>
      </CardHeader>

      <CardContent>
        {progressError || progress.length === 0 ? (
          <EmptyProgress />
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {progress.map((item) => (
                <ProgressItem key={item.exerciseId} progress={item} />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <ButtonLink
                href="/fitspace/progress"
                variant="tertiary"
                size="sm"
                className="flex-1"
                iconEnd={<ChevronRight />}
              >
                View Progress
              </ButtonLink>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
