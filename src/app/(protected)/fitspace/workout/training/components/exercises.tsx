'use client'

import { LayoutGroup } from 'framer-motion'
import React, { useState } from 'react'

import { GQLFitspaceGetWorkoutDayQuery } from '@/generated/graphql-client'
import { useTrackWorkoutSession } from '@/hooks/use-track-workout-session'

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
      <div className="px-4 ">
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
  const miniMapExercises = exercises.map((ex) => ({
    id: ex.id,
    name: ex.substitutedBy?.name ?? ex.name,
    order: ex.order,
    completedAt: ex.substitutedBy?.completedAt ?? ex.completedAt ?? null,
  }))

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
        {/* Overview Pill (static at top) */}
        {hasExercises && (
          <WorkoutOverviewPill
            exercises={miniMapExercises}
            startedAt={day.startedAt}
            onInViewChange={setIsOverviewVisible}
          />
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
            <div className="grid grid-cols-2 gap-2 pb-4 px-4">
              <div className="col-span-full">
                <AddSingleExercise dayId={day.id} variant="button" />
              </div>
              <ClearWorkoutModal dayId={day.id} />
              <AddToFavouritesButton day={day} />
            </div>
          )}
        </div>
      </div>
    </LayoutGroup>
  )
}
