'use client'

import { CheckIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useWorkout } from '@/context/workout-context/workout-context'

export function CompactExercisesCompleted() {
  const { exercises } = useWorkout()

  const completedExercises = exercises.filter(
    (exercise) => exercise.completedAt,
  )

  const handleExerciseClick = (exerciseId: string) => {
    const exerciseElement = document.getElementById(exerciseId)
    if (exerciseElement) {
      const elementTop =
        exerciseElement.getBoundingClientRect().top + window.scrollY
      const offsetPosition = elementTop - 100

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div>
      <CardHeader className="flex items-center justify-between px-0 py-2">
        <h3 className="font-medium text-foreground">Exercises Completed </h3>
        <Badge variant="secondary">
          {completedExercises.length} / {exercises.length}
        </Badge>
      </CardHeader>
      <Card className="max-w-full py-2">
        <div className="space-y-0">
          {exercises.map((exercise, index) => (
            <button
              key={exercise.id}
              onClick={() =>
                !exercise.completedAt ? handleExerciseClick(exercise.id) : null
              }
              className="w-full text-left"
            >
              <div className="flex items-center justify-between py-4 px-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium whitespace-pre-wrap">
                    {exercise.name}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground pt-0.5">
                  {exercise.sets.filter((set) => set.completedAt).length}/
                  {exercise.sets.length} sets
                </p>
                {exercise.completedAt ? (
                  <CheckIcon className="size-4 text-green-500 ml-4 flex-shrink-0" />
                ) : (
                  <CheckIcon className="size-4 text-muted-foreground/20 ml-4 flex-shrink-0" />
                )}
              </div>
              {index < Math.min(exercises.length) - 1 && (
                <Separator className="bg-border/70" />
              )}
            </button>
          ))}
        </div>
      </Card>
    </div>
  )
}
