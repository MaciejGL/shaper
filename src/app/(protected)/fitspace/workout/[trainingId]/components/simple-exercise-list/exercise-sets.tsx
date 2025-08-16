import { CheckIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useUserPreferences } from '@/context/user-preferences-context'
import type { WorkoutContextPlan } from '@/context/workout-context/workout-context'
import { cn } from '@/lib/utils'

interface ExerciseSetsProps {
  exercise: WorkoutContextPlan['weeks'][number]['days'][number]['exercises'][number]
  handleToggleSet: (setId: string, completed: boolean) => void
  completingSets: Set<string>
}

export function ExerciseSets({
  exercise,
  handleToggleSet,
  completingSets,
}: ExerciseSetsProps) {
  const { preferences } = useUserPreferences()
  const totalSets = exercise.sets.length

  if (totalSets === 0) return null

  return (
    <div className="grid gap-1.5">
      <h3 className="text-sm font-medium text-muted-foreground">Sets</h3>
      {exercise.sets.map((set, index) => (
        <div
          key={set.id}
          className={cn(
            'flex items-center justify-between px-2 py-2 rounded text-sm bg-muted/50 relative',
            set.completedAt
              ? 'after:content-[""] after:absolute after:left-0 after:top-0 after:bottom-0 after:rounded-l-lg after:w-1 after:bg-green-500'
              : 'bg-muted/50',
          )}
        >
          <div className="flex items-center gap-2">
            <span className="w-6 text-center font-semibold text-sm text-muted-foreground">
              {index + 1}.
            </span>
            <div className="flex gap-3">
              {set.minReps && set.maxReps ? (
                <span>
                  {set.minReps}-{set.maxReps} reps
                </span>
              ) : set.reps || set.minReps ? (
                <span>{set.reps || set.minReps} reps</span>
              ) : null}

              {typeof set.weight === 'number' ? (
                <div className="flex items-center gap-3">
                  {set.reps || set.minReps ? (
                    <span className="text-muted-foreground">x</span>
                  ) : null}
                  <span>
                    {set.weight} {preferences.weightUnit}
                  </span>
                </div>
              ) : null}
            </div>
          </div>

          <Button
            variant="tertiary"
            size="icon-sm"
            iconOnly={
              <CheckIcon
                className={cn(
                  set.completedAt
                    ? 'text-green-600 data-[loading=true]:text-green-600/30'
                    : 'text-muted-foreground/50 data-[loading=true]:text-muted-foreground/30',
                )}
              />
            }
            loading={completingSets.has(set.id)}
            onClick={() => handleToggleSet(set.id, !set.completedAt)}
          />
        </div>
      ))}
    </div>
  )
}
