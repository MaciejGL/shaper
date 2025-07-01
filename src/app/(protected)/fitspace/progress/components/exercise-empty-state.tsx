import { Dumbbell, SettingsIcon } from 'lucide-react'

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
      <div className="text-center py-8">
        <Dumbbell className="size-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Exercises Found</h3>
        <p className="text-muted-foreground mb-4">
          No exercises found for this user
        </p>
      </div>
    )
  }

  return (
    <div className="text-center py-8">
      <Dumbbell className="size-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">No Exercises Selected</h3>
      <p className="text-muted-foreground mb-4">
        Select exercises you want to track
      </p>
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
