import type { WorkoutOutput } from '@/lib/ai-training/types'

interface WorkoutDisplayProps {
  workout: WorkoutOutput
}

export function WorkoutDisplay({ workout }: WorkoutDisplayProps) {
  return (
    <div className="space-y-4">
      {workout.exercises.map((exercise, index) => (
        <div
          key={`${exercise.id}-${index}`}
          className="rounded-lg border p-4 space-y-2"
        >
          <div className="flex-center justify-between">
            <h3 className="font-semibold">
              {index + 1}. {exercise.name}
            </h3>
          </div>

          <div className="flex gap-4 text-sm">
            <span className="text-muted-foreground">
              {exercise.sets} sets × {exercise.minReps}
              {exercise.maxReps !== exercise.minReps &&
                `-${exercise.maxReps}`}{' '}
              reps
            </span>
            {exercise.equipment && (
              <span className="text-muted-foreground">
                • {exercise.equipment}
              </span>
            )}
          </div>

          {exercise.muscleGroups && exercise.muscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {exercise.muscleGroups.map((muscle) => (
                <span
                  key={muscle}
                  className="rounded bg-muted px-2 py-0.5 text-xs"
                >
                  {muscle}
                </span>
              ))}
            </div>
          )}

          {exercise.explanation && (
            <p className="text-sm text-muted-foreground">
              {exercise.explanation}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
