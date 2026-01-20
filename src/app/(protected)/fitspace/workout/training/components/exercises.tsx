'use client'

import { LayoutGroup } from 'framer-motion'
import React, { useState } from 'react'

import { MarkDayAsCompletedButton } from '@/app/(protected)/fitspace/workout/training/components/mark-day-as-completed-button'
import { buttonVariants } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  GQLFitspaceGetWorkoutDayQuery,
  GQLTrainingView,
} from '@/generated/graphql-client'
import { useTrackWorkoutSession } from '@/hooks/use-track-workout-session'
import { cn } from '@/lib/utils'

import { AddSingleExercise } from './add-single-exercise'
import { AddToFavouritesButton } from './add-to-favourites-button'
import { ClearWorkoutModal } from './clear-workout-modal'
import { EmptyWorkoutOptions } from './empty-workout-options'
import { Exercise } from './exercise'
import { WorkoutOverviewPill, WorkoutSmartPill } from './exercise-mini-map'
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

  const [isOverviewVisible, setIsOverviewVisible] = useState(true)

  useTrackWorkoutSession(day?.id, isActive, isCompleted, lastActivityTimestamp)

  if (!day) return <div>No day data available</div>

  // Derived state
  const exercises = day.exercises
  const hasExercises = exercises.length > 0
  const isEmptyWorkout = !hasExercises && !day.isRestDay
  // const hasNamedWorkoutType =
  //   day.workoutType && day.workoutType !== GQLWorkoutType.Custom

  // Early returns for special states
  if (day.isRestDay) {
    return <RestDay />
  }

  if (isEmptyWorkout) {
    return (
      <div className="px-4">
        {isQuickWorkout ? (
          <EmptyWorkoutOptions day={day} />
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No exercises scheduled for this day</p>
          </div>
        )}
      </div>
    )
  }

  // Prepare mini-map data
  const miniMapExercises = exercises.map((ex) => {
    const name = ex.substitutedBy?.name ?? ex.name
    const completedAt = ex.substitutedBy?.completedAt ?? ex.completedAt ?? null
    const videoUrl = ex.substitutedBy?.videoUrl ?? ex.videoUrl ?? null

    const imagesSource: ({
      medium?: string | null
      url?: string | null
    } | null)[] = ex.images ?? []

    return {
      id: ex.id,
      name,
      order: ex.order,
      completedAt,
      images: imagesSource.map((img) => ({
        medium: img?.medium ?? img?.url ?? null,
      })),
      videoUrl,
    }
  })

  // Main workout view
  return (
    <LayoutGroup>
      {hasExercises && (
        <WorkoutSmartPill
          exercises={miniMapExercises}
          startedAt={day.startedAt}
          isOverviewVisible={isOverviewVisible}
        />
      )}
      <div>
        {/* {!hasNamedWorkoutType && (
          <div className="flex flex-col  space-y-2 w-full p-2">
            <p className="text-lg font-medium text-center pb-2">
              {formatWorkoutType('Push')}
            </p>
          </div>
        )} */}
        <div className="px-2 pt-4 pb-3 -mt-4 bg-sidebar mb-4 w-full shadow-xl rounded-b-[18px] dark border-t border-border">
          <div className="h-px bg-border mb-3" />
          <WorkoutSettings day={day} isQuickWorkout={isQuickWorkout} />
        </div>
        {/* Overview Pill (static at top) */}

        {hasExercises && (
          <div className="px-2">
            <WorkoutOverviewPill
              exercises={miniMapExercises}
              startedAt={day.startedAt}
              onInViewChange={setIsOverviewVisible}
            />
          </div>
        )}
        <div>
          {exercises.map((exercise) => (
            <Exercise
              key={exercise.id}
              exercise={exercise}
              exercises={exercises}
              previousDayLogs={previousDayLogs}
            />
          ))}
          {isQuickWorkout && day.id && (
            <div className="pb-4 px-4 mb-16">
              <AddSingleExercise dayId={day.id} variant="button" />
            </div>
          )}
        </div>
      </div>
    </LayoutGroup>
  )
}

function WorkoutSettings({
  day,
  isQuickWorkout,
}: {
  day: NonNullable<GQLFitspaceGetWorkoutDayQuery['getWorkoutDay']>['day']
  isQuickWorkout: boolean
}) {
  const { preferences, setTrainingView } = useUserPreferences()
  const isAdvanced = preferences.trainingView === GQLTrainingView.Advanced

  if (!isQuickWorkout)
    return (
      <div className="flex w-full gap-2">
        <ToggleLoggingMode
          isAdvanced={isAdvanced}
          setTrainingView={setTrainingView}
        />
        <MarkDayAsCompletedButton day={day} />
      </div>
    )

  return (
    <div className="flex w-full gap-2">
      <ToggleLoggingMode
        isAdvanced={isAdvanced}
        setTrainingView={setTrainingView}
      />
      <AddToFavouritesButton day={day} />
      <ClearWorkoutModal dayId={day.id} />
    </div>
  )
}

function ToggleLoggingMode({
  isAdvanced,
  setTrainingView,
}: {
  isAdvanced: boolean
  setTrainingView: (view: GQLTrainingView) => void
}) {
  return (
    <div
      className={cn(
        buttonVariants({
          variant: 'secondary',
          size: 'md',
        }),
        'rounded-xl flex-1',
      )}
      onClick={() =>
        setTrainingView(
          isAdvanced ? GQLTrainingView.Simple : GQLTrainingView.Advanced,
        )
      }
    >
      <span className="text-sm text-foreground">Logging Mode</span>
      <Switch checked={isAdvanced} />
    </div>
  )
}
