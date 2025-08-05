import React from 'react'

import { Button } from '@/components/ui/button'
import { GQLExerciseType } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { SupersetsNavigationProps } from './types'

export function SupersetsNavigation({
  exercise,
  exercises,
  onPaginationClick,
}: SupersetsNavigationProps) {
  const currentExerciseIndex = exercises.findIndex((e) => e.id === exercise.id)
  const isExercise1A = exercise.type === GQLExerciseType.Superset_1A
  const isExercise1B = exercise.type === GQLExerciseType.Superset_1B
  const exercise1A = isExercise1A
    ? exercise
    : exercises[currentExerciseIndex - 1]
  const exercise1B = isExercise1B
    ? exercise
    : exercises[currentExerciseIndex + 1]

  const isSuperset =
    exercise.type === GQLExerciseType.Superset_1A ||
    exercise.type === GQLExerciseType.Superset_1B

  if (!isSuperset) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {exercise1A && (
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            'w-full whitespace-normal h-auto py-1 justify-start text-left',
            exercise.id === exercise1B.id && 'bg-muted/50',
          )}
          onClick={() => onPaginationClick(exercise1A.id, 'prev')}
        >
          <div className="flex items-center gap-1">
            <div
              className={cn(
                'text-lg text-muted-foreground w-4 shrink-0',
                exercise.id === exercise1A.id && 'text-primary',
              )}
            >
              A
            </div>
            <div className="text-xs text-muted-foreground">
              {exercise1A.name}
            </div>
          </div>
        </Button>
      )}
      {exercise1B && (
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            'w-full whitespace-normal h-auto py-1 justify-start text-left',
            exercise.id === exercise1A.id && 'bg-muted/50',
          )}
          onClick={() => onPaginationClick(exercise1B.id, 'next')}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'text-lg text-muted-foreground w-4 shrink-0',
                exercise.id === exercise1B.id && 'text-primary',
              )}
            >
              B
            </div>
            <div className="text-xs text-muted-foreground">
              {exercise1B.name}
            </div>
          </div>
        </Button>
      )}
    </div>
  )
}
