'use client'

import { Reorder, useDragControls } from 'framer-motion'
import { ArrowLeft, MinusIcon, PlusIcon } from 'lucide-react'
import { useMemo } from 'react'

import { AnimateNumber } from '@/components/animate-number'
import { Button } from '@/components/ui/button'
import { DrawerFooter } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { GQLFitspaceGetExercisesQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

import { DraggableExerciseItem } from './selectable-exercise-item'

// import { getExerciseMuscleDisplay } from './utils'

type Exercise = NonNullable<
  NonNullable<GQLFitspaceGetExercisesQuery['getExercises']>['publicExercises']
>[number]

interface ReviewExercisesProps {
  selectedExerciseIds: string[]
  exercises: Exercise[]
  onReorder: (newOrder: string[]) => void
  onRemove: (exerciseId: string) => void
  setCounts: Record<string, number | undefined>
  onSetCountChange: (exerciseId: string, setCount: number) => void
  saveAsFavourite: boolean
  onSaveAsFavouriteChange: (value: boolean) => void
  favouriteTitle: string
  onFavouriteTitleChange: (value: string) => void
  favouriteDescription: string
  onFavouriteDescriptionChange: (value: string) => void
  onGoBack: () => void
  onStart: () => void
  isAdding: boolean
  onDraggingChange?: (isDragging: boolean) => void
}

export function ReviewExercises({
  selectedExerciseIds,
  exercises,
  onReorder,
  onRemove,
  setCounts,
  onSetCountChange,
  saveAsFavourite,
  onSaveAsFavouriteChange,
  favouriteTitle,
  onFavouriteTitleChange,
  favouriteDescription,
  onFavouriteDescriptionChange,
  onGoBack,
  onStart,
  isAdding,
  onDraggingChange,
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

  const handleReorder = (newOrder: string[]) => {
    onReorder(newOrder)
  }

  const canStart =
    !isAdding && (!saveAsFavourite || favouriteTitle.trim().length > 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="px-4 pb-4 pt-2 space-y-4">
          <div className="flex items-center gap-3">
            <Button
              variant="tertiary"
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
                Drag the handle to reorder exercises
              </p>
            </div>
          </div>

          <Reorder.Group
            axis="y"
            values={selectedExerciseIds}
            onReorder={handleReorder}
            layout // Animates layout changes smoothly
            className="flex flex-col gap-2"
          >
            {selectedExercises.map((exercise, index) => (
              <ReorderableExerciseItem
                key={exercise.id}
                exercise={exercise}
                index={index}
                onRemove={onRemove}
                isAdding={isAdding}
                onDraggingChange={onDraggingChange}
                setCount={setCounts[exercise.id] ?? 3}
                onSetCountChange={onSetCountChange}
              />
            ))}
          </Reorder.Group>
        </div>
      </div>

      <DrawerFooter className="border-t">
        <div className="w-full space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <Label htmlFor="save-as-favourite" className="text-sm">
                Save as favourite
              </Label>
              <p className="text-xs text-muted-foreground">
                Reuse this workout later in My Plans
              </p>
            </div>
            <Switch
              id="save-as-favourite"
              checked={saveAsFavourite}
              onCheckedChange={onSaveAsFavouriteChange}
              disabled={isAdding}
            />
          </div>

          {saveAsFavourite && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favourite-title">Workout name *</Label>
                <Input
                  id="favourite-title"
                  value={favouriteTitle}
                  onChange={(e) => onFavouriteTitleChange(e.target.value)}
                  maxLength={100}
                  disabled={isAdding}
                  placeholder="e.g., Upper Body Strength"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="favourite-description">
                  Description (optional)
                </Label>
                <Textarea
                  id="favourite-description"
                  value={favouriteDescription}
                  onChange={(e) => onFavouriteDescriptionChange(e.target.value)}
                  maxLength={500}
                  disabled={isAdding}
                  rows={3}
                  placeholder="Add notes about this workout..."
                />
              </div>
            </div>
          )}

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
              disabled={!canStart}
              className="flex-1"
            >
              Start workout
            </Button>
          </div>
        </div>
      </DrawerFooter>
    </div>
  )
}

function ReorderableExerciseItem({
  exercise,
  index,
  onRemove,
  isAdding,
  onDraggingChange,
  setCount,
  onSetCountChange,
}: {
  exercise: Exercise
  index: number
  onRemove: (id: string) => void
  isAdding: boolean
  onDraggingChange?: (isDragging: boolean) => void
  setCount: number
  onSetCountChange: (exerciseId: string, setCount: number) => void
}) {
  const dragControls = useDragControls()
  // const muscleDisplay = getExerciseMuscleDisplay(exercise)

  const clampedSetCount = Math.max(1, Math.min(8, setCount))

  return (
    <Reorder.Item
      value={exercise.id}
      dragListener={false}
      dragControls={dragControls}
      onDragEnd={() => onDraggingChange?.(false)}
    >
      <div className={cn(isAdding && 'opacity-50 pointer-events-none')}>
        <DraggableExerciseItem
          id={exercise.id}
          name={`${index + 1}. ${exercise.name}`}
          // muscleDisplay={muscleDisplay}
          images={exercise.images}
          videoUrl={exercise.videoUrl}
          disabled={isAdding}
          onRemove={onRemove}
          belowContent={
            <div className="mt-2 flex justify-start items-baseline gap-2">
              <p className="text-sm text-muted-foreground">Sets</p>
              <div
                className="grid grid-cols-3 items-center gap-0.5 bg-card rounded-xl p-0.5"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Button
                  size="icon-sm"
                  variant="tertiary"
                  className="rounded-xl"
                  iconOnly={<MinusIcon />}
                  disabled={isAdding || clampedSetCount <= 1}
                  onClick={() =>
                    onSetCountChange(exercise.id, clampedSetCount - 1)
                  }
                >
                  Remove set
                </Button>
                <AnimateNumber
                  value={clampedSetCount}
                  duration={300}
                  className="text-center text-sm font-medium tabular-nums"
                />
                <Button
                  size="icon-sm"
                  variant="tertiary"
                  className="rounded-xl"
                  iconOnly={<PlusIcon />}
                  disabled={isAdding || clampedSetCount >= 8}
                  onClick={() =>
                    onSetCountChange(exercise.id, clampedSetCount + 1)
                  }
                >
                  Add set
                </Button>
              </div>
            </div>
          }
          onDragHandlePointerDown={(e) => {
            // Prevent Vaul (drawer) from treating this gesture as a dismiss drag.
            e.stopPropagation()
            e.preventDefault()
            onDraggingChange?.(true)
            dragControls.start(e.nativeEvent)
          }}
        />
      </div>
    </Reorder.Item>
  )
}
