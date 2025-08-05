import { useQueryState } from 'nuqs'
import React from 'react'

import { GQLExerciseType } from '@/generated/graphql-client'

import { ExerciseSelector } from './exercise-selector'
import { SupersetsNavigation } from './supersets-navigation'
import { ExerciseHeaderProps } from './types'

export function ExerciseHeader({
  exercise,
  exercises,
  onPaginationClick,
}: ExerciseHeaderProps) {
  const [activeExerciseId, setActiveExerciseId] = useQueryState('exercise')

  const isSuperset =
    exercise.type === GQLExerciseType.Superset_1A ||
    exercise.type === GQLExerciseType.Superset_1B

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <ExerciseSelector
          exercise={exercise}
          activeExerciseId={activeExerciseId}
          setActiveExerciseId={setActiveExerciseId}
        />
      </div>
      {isSuperset && (
        <div className="mt-2">
          <SupersetsNavigation
            exercise={exercise}
            exercises={exercises}
            onPaginationClick={onPaginationClick}
          />
        </div>
      )}
    </div>
  )
}
