'use client'

import { Reorder } from 'framer-motion'
import { ArrowLeft, GripVertical, XIcon } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '@/components/ui/button'
import { DrawerFooter } from '@/components/ui/drawer'
import type { GQLFitspaceGetExercisesQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

type Exercise = NonNullable<
  NonNullable<GQLFitspaceGetExercisesQuery['getExercises']>['publicExercises']
>[number]

interface ReviewExercisesProps {
  selectedExerciseIds: string[]
  exercises: Exercise[]
  onReorder: (newOrder: string[]) => void
  onRemove: (exerciseId: string) => void
  onGoBack: () => void
  onStart: () => void
  isAdding: boolean
}

function ReorderableExerciseItem({
  exercise,
  index,
  onRemove,
  isAdding,
}: {
  exercise: Exercise
  index: number
  onRemove: (id: string) => void
  isAdding: boolean
}) {
  return (
    <Reorder.Item
      value={exercise.id}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg bg-card border border-border',
        'cursor-grab active:cursor-grabbing shadow-sm',
        isAdding && 'opacity-50 pointer-events-none',
      )}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <GripVertical className="size-5 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium text-muted-foreground shrink-0 w-6">
          {index + 1}.
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{exercise.name}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        iconOnly={<XIcon />}
        onClick={(e) => {
          e.stopPropagation()
          onRemove(exercise.id)
        }}
        disabled={isAdding}
        className="shrink-0"
      >
        Remove
      </Button>
    </Reorder.Item>
  )
}

export function ReviewExercises({
  selectedExerciseIds,
  exercises,
  onReorder,
  onRemove,
  onGoBack,
  onStart,
  isAdding,
}: ReviewExercisesProps) {
  const exercisesMap = useMemo(
    () => new Map(exercises.map((ex) => [ex.id, ex])),
    [exercises],
  )

  const selectedExercises = useMemo(
    () =>
      selectedExerciseIds
        .map((id) => exercisesMap.get(id))
        .filter((ex): ex is Exercise => ex !== undefined),
    [selectedExerciseIds, exercisesMap],
  )

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon-sm"
              iconOnly={<ArrowLeft />}
              onClick={onGoBack}
              disabled={isAdding}
            >
              Back
            </Button>
            <div>
              <h2 className="text-lg font-semibold">Review your workout</h2>
              <p className="text-sm text-muted-foreground">
                Drag to reorder exercises
              </p>
            </div>
          </div>

          <Reorder.Group
            axis="y"
            values={selectedExerciseIds}
            onReorder={onReorder}
            className="space-y-2"
          >
            {selectedExercises.map((exercise, index) => (
              <ReorderableExerciseItem
                key={exercise.id}
                exercise={exercise}
                index={index}
                onRemove={onRemove}
                isAdding={isAdding}
              />
            ))}
          </Reorder.Group>
        </div>
      </div>

      <DrawerFooter className="border-t">
        <div className="flex items-center gap-3 w-full">
          <Button
            variant="outline"
            onClick={onGoBack}
            disabled={isAdding}
            className="flex-1"
          >
            Go back
          </Button>
          <Button
            onClick={onStart}
            loading={isAdding}
            disabled={isAdding}
            className="flex-1"
          >
            Start workout
          </Button>
        </div>
      </DrawerFooter>
    </div>
  )
}

