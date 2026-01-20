'use client'

import { Pencil, Trash2 } from 'lucide-react'
import { useMemo } from 'react'

import { BaseExerciseItem } from '@/app/(protected)/fitspace/workout/training/components/add-single-exercise/selectable-exercise-item'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Button } from '@/components/ui/button'
import { DISPLAY_GROUP_TO_HIGH_LEVEL } from '@/config/muscles'
import type { GQLFitspaceGetExercisesQuery } from '@/generated/graphql-client'
import { translateEquipment } from '@/utils/translate-equipment'

type CustomExercise = NonNullable<
  NonNullable<GQLFitspaceGetExercisesQuery['getExercises']>['userExercises']
>[number]

interface MyExercisesSectionProps {
  exercises: CustomExercise[]
  isLoading: boolean
  isDeleting?: boolean
  showEmptyState?: boolean
  onEditExercise: (exercise: CustomExercise) => void
  onDeleteExercise: (exercise: CustomExercise) => void
}

export function MyExercisesSection({
  exercises,
  isLoading,
  isDeleting = false,
  showEmptyState = true,
  onEditExercise,
  onDeleteExercise,
}: MyExercisesSectionProps) {
  const sorted = useMemo(
    () => [...exercises].sort((a, b) => a.name.localeCompare(b.name)),
    [exercises],
  )

  const shouldShowEmptyState =
    showEmptyState && sorted.length === 0 && !isLoading

  return (
    <div className="space-y-3 animate-in fade-in duration-300">
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton count={6} variant="sm" />
        </div>
      ) : shouldShowEmptyState ? (
        <div className="text-sm text-muted-foreground">
          You don’t have any custom exercises yet.
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((exercise) => {
            const displayGroup = exercise.muscleGroups?.[0]?.displayGroup
            const highLevel = displayGroup
              ? DISPLAY_GROUP_TO_HIGH_LEVEL[displayGroup]
              : null
            const equipmentDisplay = exercise.equipment
              ? translateEquipment(exercise.equipment)
              : undefined

            return (
              <BaseExerciseItem
                key={exercise.id}
                id={exercise.id}
                name={exercise.name}
                muscleDisplay={highLevel ?? displayGroup ?? undefined}
                equipmentDisplay={equipmentDisplay}
                onClick={() => onEditExercise(exercise)}
                className="pr-0"
                trailing={
                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="tertiary"
                      size="icon-md"
                      iconOnly={<Pencil />}
                      onClick={(e) => {
                        e.stopPropagation()
                        onEditExercise(exercise)
                      }}
                    />
                    <Button
                      variant="tertiary"
                      size="icon-md"
                      iconOnly={<Trash2 />}
                      disabled={isDeleting}
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteExercise(exercise)
                      }}
                    />
                  </div>
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
