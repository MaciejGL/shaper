'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { getOnboardingWorkouts } from '@/config/onboarding-workouts'

import { CompactWorkoutCard } from '../../explore/components/free-workouts-tab'

interface OnboardingWorkoutStepProps {
  selectedGoalId: string
  onStartWorkout: (trainingDayId: string) => void
  onBrowseMore: () => void
  isStarting: boolean
}

export function OnboardingWorkoutStep({
  selectedGoalId,
  onStartWorkout,
  onBrowseMore,
  isStarting,
}: OnboardingWorkoutStepProps) {
  const workouts = getOnboardingWorkouts(selectedGoalId)
  const [clickedWorkoutId, setClickedWorkoutId] = useState<string | null>(null)

  const handleClick = (workout: { id: string; trainingDayId: string }) => {
    if (isStarting) return
    setClickedWorkoutId(workout.id)
    onStartWorkout(workout.trainingDayId)
  }

  if (!workouts) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground text-center">
          No curated workouts available for this goal yet.
        </p>
        <Button variant="default" className="w-full" onClick={onBrowseMore}>
          Browse all workouts
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2">
        {workouts.map((workout, index) => (
          <motion.div
            key={workout.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <CompactWorkoutCard
              workout={workout}
              onClick={() => handleClick(workout)}
              isLoading={isStarting && clickedWorkoutId === workout.id}
            />
          </motion.div>
        ))}
      </div>
      <button
        onClick={onBrowseMore}
        disabled={isStarting}
        className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-1 disabled:opacity-50"
      >
        or browse all workouts
      </button>
    </div>
  )
}
