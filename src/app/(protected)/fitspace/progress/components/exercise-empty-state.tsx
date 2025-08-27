import { Dumbbell, Logs, SettingsIcon } from 'lucide-react'

import { EmptyStateCard } from '@/components/empty-state-card'
import { Button } from '@/components/ui/button'

interface ExerciseEmptyStateProps {
  onOpenSelection: () => void
  hasAvailableExercises?: boolean
}

export function ExerciseEmptyState({
  onOpenSelection,
  hasAvailableExercises = true,
}: ExerciseEmptyStateProps) {
  if (!hasAvailableExercises) {
    return (
      <EmptyStateCard
        title="Not enough logged exercises"
        description="Continue workouts, once you log enough, you will be able to view your progress"
        icon={Logs}
      />
    )
  }

  return (
    <div className="space-y-4">
      <EmptyStateCard
        title="No Exercises Selected"
        description="Select exercises you want to track"
        icon={Dumbbell}
      />
      <Button
        variant="secondary"
        className="mt-4 mx-auto"
        iconStart={<SettingsIcon />}
        onClick={onOpenSelection}
      >
        Select Exercises
      </Button>
    </div>
  )
}
