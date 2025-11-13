'use client'

import { BarChartIcon } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { useWorkout } from '@/context/workout-context/workout-context'

import { CompactExercisesCompleted } from './compact-exercises-completed'
import { WorkoutSummaryDrawer } from './workout-summary-drawer'

export function WorkoutActions() {
  const [showSummary, setShowSummary] = useState(false)
  const { exercises } = useWorkout()

  const completedExercises = exercises.filter(
    (exercise) => exercise.completedAt,
  )

  const hasCompletedExercises = completedExercises.length > 0

  return (
    <div className="space-y-4">
      <CompactExercisesCompleted />

      {hasCompletedExercises && (
        <Button
          variant="default"
          className="w-full"
          onClick={() => setShowSummary(true)}
          iconStart={<BarChartIcon />}
        >
          View Workout Summary
        </Button>
      )}

      <WorkoutSummaryDrawer
        open={showSummary}
        onOpenChange={setShowSummary}
        onComplete={() => setShowSummary(false)}
      />
    </div>
  )
}
