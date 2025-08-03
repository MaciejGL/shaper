'use client'

import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { QuickWorkoutPlan } from '../../../types'

import { PastWorkoutCard } from './past-workout-card'
import {
  formatWeekTitle,
  getCompletedWorkoutsForWeek,
  getWeeksWithCompletedWorkouts,
} from './utils'

interface PastWorkoutsViewProps {
  plan: QuickWorkoutPlan
  loading: boolean
}

export function PastWorkoutsView({ plan, loading }: PastWorkoutsViewProps) {
  // Get weeks with completed workouts, sorted by most recent first
  const weeksWithCompletedWorkouts = getWeeksWithCompletedWorkouts(plan)

  // State for currently selected week (default to most recent week with completed workouts)
  const [selectedWeekIndex, setSelectedWeekIndex] = useState(0)

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-32 w-full bg-card rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!plan?.weeks || plan.weeks.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-dashed">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">📋</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">No Past Workouts</h3>
        <p className="text-muted-foreground">
          Complete some workouts to see your history here.
        </p>
      </div>
    )
  }

  if (weeksWithCompletedWorkouts.length === 0) {
    return (
      <div className="text-center py-12 bg-card rounded-lg border border-dashed">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">💪</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">
          No Completed Workouts Yet
        </h3>
        <p className="text-muted-foreground">
          Start and complete workouts to build your workout history.
        </p>
      </div>
    )
  }

  const currentWeek = weeksWithCompletedWorkouts[selectedWeekIndex]
  const completedWorkouts = getCompletedWorkoutsForWeek(currentWeek)

  const canGoToPreviousWeek =
    selectedWeekIndex < weeksWithCompletedWorkouts.length - 1
  const canGoToNextWeek = selectedWeekIndex > 0

  const goToPreviousWeek = () => {
    if (canGoToPreviousWeek) {
      setSelectedWeekIndex(selectedWeekIndex + 1)
    }
  }

  const goToNextWeek = () => {
    if (canGoToNextWeek) {
      setSelectedWeekIndex(selectedWeekIndex - 1)
    }
  }

  return (
    <div className="space-y-4">
      {/* Week Navigation Header */}
      <div>
        <h3 className="text-lg font-semibold">Workout History</h3>
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {formatWeekTitle(currentWeek)}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="icon-sm"
              onClick={goToPreviousWeek}
              disabled={!canGoToPreviousWeek}
              iconStart={<ChevronLeftIcon />}
            />

            <span className="text-sm text-muted-foreground px-2">
              {selectedWeekIndex + 1} of {weeksWithCompletedWorkouts.length}
            </span>

            <Button
              variant="secondary"
              size="icon-sm"
              onClick={goToNextWeek}
              disabled={!canGoToNextWeek}
              iconEnd={<ChevronRightIcon />}
            />
          </div>
        </div>
      </div>

      {/* Completed Workouts for Selected Week */}
      {completedWorkouts.length > 0 ? (
        <div className="space-y-3">
          {completedWorkouts.map((workout) => (
            <PastWorkoutCard
              key={workout.id}
              workout={{
                ...workout,
                weekNumber: currentWeek.weekNumber,
                weekScheduledAt: currentWeek.scheduledAt,
              }}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 bg-card rounded-lg border border-dashed">
          <div className="mx-auto w-10 h-10 bg-muted rounded-full flex items-center justify-center mb-3">
            <span className="text-xl">📅</span>
          </div>
          <h4 className="font-medium mb-1">No completed workouts this week</h4>
          <p className="text-sm text-muted-foreground">
            Try navigating to a different week to see your workout history.
          </p>
        </div>
      )}
    </div>
  )
}
