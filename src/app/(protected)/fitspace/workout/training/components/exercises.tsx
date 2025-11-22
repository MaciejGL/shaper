'use client'

import { LayoutGroup, motion } from 'framer-motion'
import { CheckCheck } from 'lucide-react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  GQLFitspaceGetWorkoutDayQuery,
  GQLWorkoutType,
} from '@/generated/graphql-client'
import { useTrackWorkoutSession } from '@/hooks/use-track-workout-session'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

import { AddSingleExercise } from './add-single-exercise'
import { AddToFavouritesButton } from './add-to-favourites-button'
import { ClearWorkoutModal } from './clear-workout-modal'
import { EmptyWorkoutOptions } from './empty-workout-options'
import { Exercise } from './exercise'
import { ExerciseMiniMap } from './exercise-mini-map'
import { RestDay } from './rest-day'

interface ExercisesProps {
  day?: NonNullable<GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']>['day']
  previousDayLogs?: NonNullable<
    GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']
  >['previousDayLogs']
  isQuickWorkout?: boolean
}

export function Exercises({
  day,
  previousDayLogs,
  isQuickWorkout = false,
}: ExercisesProps) {
  const progressBarRef = React.useRef<HTMLDivElement>(null)
  const [isProgressBarAtTop, setIsProgressBarAtTop] = React.useState(false)

  React.useEffect(() => {
    const element = progressBarRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsProgressBarAtTop(
          !entry.isIntersecting && entry.boundingClientRect.top <= 0,
        )
      },
      {
        threshold: [0, 1],
        rootMargin: '0px',
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [])

  // Calculate last activity timestamp from most recent set log
  const lastActivityTimestamp = React.useMemo(() => {
    if (!day?.exercises) return undefined

    let mostRecentTimestamp = 0

    day.exercises.forEach((ex) => {
      ex.sets.forEach((set) => {
        if (set.log?.createdAt) {
          const logTime = new Date(set.log.createdAt).getTime()
          if (logTime > mostRecentTimestamp) {
            mostRecentTimestamp = logTime
          }
        }
      })
    })

    return mostRecentTimestamp > 0 ? mostRecentTimestamp : undefined
  }, [day])

  // Determine if workout is currently active (user logged something in last 5 minutes)
  // Note: Using useState with lazy init to avoid calling Date.now() during render
  const [currentTime] = React.useState(() => Date.now())
  const isActive = React.useMemo(() => {
    if (!lastActivityTimestamp) return false
    const fiveMinutesAgo = currentTime - 5 * 60 * 1000
    return lastActivityTimestamp >= fiveMinutesAgo
  }, [lastActivityTimestamp, currentTime])

  const isCompleted = day?.completedAt ? true : false

  useTrackWorkoutSession(day?.id, isActive, isCompleted, lastActivityTimestamp)

  if (!day) return <div>No day data available</div>

  // Derived state
  const exercises = day.exercises
  const hasExercises = exercises.length > 0
  const isEmptyWorkout = !hasExercises && !day.isRestDay
  const hasNamedWorkoutType =
    day.workoutType && day.workoutType !== GQLWorkoutType.Custom

  const completedExercises = exercises.filter(
    (exercise) => exercise.completedAt,
  ).length

  const completedSets = exercises.reduce((acc, exercise) => {
    return acc + exercise.sets.filter((set) => set.completedAt).length
  }, 0)

  const totalSets = exercises.reduce((acc, exercise) => {
    return acc + exercise.sets.length
  }, 0)

  const progressPercentage =
    totalSets > 0 ? (completedSets / totalSets) * 100 : 0

  // Early returns for special states
  if (day.isRestDay) {
    return <RestDay />
  }

  if (isEmptyWorkout) {
    return (
      <div>
        {isQuickWorkout ? (
          <EmptyWorkoutOptions dayId={day.id} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No exercises scheduled for this day</p>
          </div>
        )}
      </div>
    )
  }

  // Prepare mini-map data
  const miniMapExercises = exercises.map((ex) => ({
    id: ex.id,
    name: ex.name,
    order: ex.order,
    completedAt: ex.completedAt ?? null,
  }))

  // Main workout view
  return (
    <LayoutGroup>
      {hasExercises && <ExerciseMiniMap exercises={miniMapExercises} />}
      <div>
        <div className="flex flex-col pb-4 space-y-2 w-full px-2">
          {hasNamedWorkoutType && (
            <p className="text-lg font-medium text-center pb-2">
              {formatWorkoutType(day.workoutType!)}
            </p>
          )}
          <ExercisesCompleted
            completedExercises={completedExercises}
            totalExercises={exercises.length}
          />
          <div ref={progressBarRef} className="sticky top-0">
            <motion.div layout layoutId="workout-progress">
              <Progress value={progressPercentage} />
            </motion.div>
          </div>
        </div>

        {isProgressBarAtTop && (
          <motion.div
            layout
            layoutId="workout-progress"
            className="fixed top-0 left-0 right-0 z-50"
          >
            <Progress
              value={progressPercentage}
              className="rounded-none bg-background/50"
            />
          </motion.div>
        )}

        <div>
          {exercises.map((exercise) => (
            <Exercise
              key={exercise.id}
              exercise={exercise}
              previousDayLogs={previousDayLogs}
            />
          ))}
          {isQuickWorkout && day.id && (
            <div className="grid grid-cols-[auto_1fr] gap-2 pb-4">
              <div>
                <ClearWorkoutModal dayId={day.id} />
              </div>
              <div>
                <AddSingleExercise dayId={day.id} variant="button" />
              </div>

              <div className="col-span-full empty:hidden">
                <AddToFavouritesButton day={day} />
              </div>
            </div>
          )}
        </div>
      </div>
    </LayoutGroup>
  )
}

function ExercisesCompleted({
  completedExercises,
  totalExercises,
}: {
  completedExercises: number
  totalExercises: number
}) {
  return (
    <Badge
      variant="secondary"
      size="lg"
      className="w-full bg-card border border-border rounded-2xl"
    >
      {completedExercises}/{totalExercises} completed{' '}
      {completedExercises === totalExercises ? (
        <CheckCheck className="text-emerald-600" />
      ) : (
        ''
      )}
    </Badge>
  )
}
