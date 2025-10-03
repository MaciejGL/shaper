'use client'

import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useQueryClient } from '@tanstack/react-query'
import { formatDistanceToNow } from 'date-fns'
import {
  ChevronRight,
  Clock,
  Edit,
  Grip,
  MinusIcon,
  PlusIcon,
  Trash2,
  X,
} from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'

import { AnimateNumber } from '@/components/animate-number'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import {
  GQLGetFavouriteWorkoutsQuery,
  GQLUpdateFavouriteWorkoutMutation,
  useUpdateFavouriteExerciseSetsMutation,
} from '@/generated/graphql-client'
import {
  WorkoutStatusAnalysis,
  useUpdateFavouriteWorkout,
} from '@/hooks/use-favourite-workouts'
import { useOptimisticMutation } from '@/lib/optimistic-mutations'
import { estimateWorkoutTime } from '@/lib/workout/esimate-workout-time'

import { AddExerciseToFavouriteDrawer } from './add-exercise-to-favourite-drawer'
import { EditFavouriteMetadataDrawer } from './edit-favourite-metadata-drawer'
import { EmptyFavouriteOptions } from './empty-favourite-options'
import { FavouriteAiWizard } from './favourite-ai-wizard'

interface FavouriteWorkoutCardProps {
  favourite: NonNullable<
    NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
  >[number]
  onStart: () => void
  onRefetch: () => void
  onDelete: () => void
  workoutStatus: WorkoutStatusAnalysis
  isLoading: boolean
}

export function FavouriteWorkoutCard({
  favourite,
  onStart,
  onRefetch,
  onDelete,
  workoutStatus,
  isLoading,
}: FavouriteWorkoutCardProps) {
  const [showAiWizard, setShowAiWizard] = useState(false)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [showEditMetadata, setShowEditMetadata] = useState(false)

  const queryClient = useQueryClient()
  const { mutateAsync: updateFavourite } = useUpdateFavouriteWorkout()
  const queryKey = useMemo(() => ['GetFavouriteWorkouts'], [])

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Require 8px movement before drag starts
      },
    }),
  )

  const totalExercises = favourite.exercises.length
  const totalSets = favourite.exercises.reduce(
    (sum, exercise) => sum + exercise.sets.length,
    0,
  )
  const isEmpty = totalExercises === 0

  // Create a simplified exercise structure for time estimation
  const exercisesForEstimation = favourite.exercises.map((exercise) => ({
    restSeconds: exercise.restSeconds,
    warmupSets: 0,
    sets: exercise.sets.map((set) => ({ id: set.id })),
  }))

  const estimatedTime = estimateWorkoutTime(exercisesForEstimation)

  const createdAgo = formatDistanceToNow(new Date(favourite.createdAt), {
    addSuffix: true,
  })

  // Determine button state based on workout status
  const getStartButtonProps = () => {
    if (!workoutStatus.canStart) {
      return {
        disabled: true,
        variant: 'secondary' as const,
        text: 'Not Available',
      }
    }

    if (workoutStatus.needsConfirmation) {
      return {
        disabled: false,
        variant: 'secondary' as const,
        text: 'Replace & Start',
        loading: isLoading,
      }
    }

    return {
      disabled: false,
      variant: 'default' as const,
      text: 'Start Workout',
      loading: isLoading,
    }
  }

  const buttonProps = getStartButtonProps()

  // Lightweight mutation for updating set counts (instant, no debounce needed)
  const { mutateAsync: updateExerciseSets } =
    useUpdateFavouriteExerciseSetsMutation()

  const { optimisticMutate: updateSetCountOptimistic } = useOptimisticMutation<
    GQLGetFavouriteWorkoutsQuery,
    unknown,
    { exerciseId: string; setCount: number }
  >({
    queryKey,
    mutationFn: ({ exerciseId, setCount }) =>
      updateExerciseSets({ exerciseId, setCount }),
    updateFn: (oldData, { exerciseId, setCount }) => {
      if (!oldData?.getFavouriteWorkouts) return oldData

      return {
        ...oldData,
        getFavouriteWorkouts: oldData.getFavouriteWorkouts.map((fav) => {
          if (fav.id !== favourite.id) return fav

          return {
            ...fav,
            exercises: fav.exercises.map((ex) => {
              if (ex.id !== exerciseId) return ex

              const currentSetCount = ex.sets.length

              if (setCount > currentSetCount) {
                // Add sets
                const setsToAdd = setCount - currentSetCount
                const lastSet = ex.sets[ex.sets.length - 1]
                const maxOrder =
                  ex.sets.length > 0
                    ? Math.max(...ex.sets.map((s) => s.order))
                    : 0

                const newSets = Array.from({ length: setsToAdd }, (_, i) => ({
                  id: `temp-${Date.now()}-${i}`,
                  order: maxOrder + i + 1,
                  reps: lastSet?.reps || null,
                  minReps: lastSet?.minReps || null,
                  maxReps: lastSet?.maxReps || null,
                  weight: lastSet?.weight || null,
                  rpe: lastSet?.rpe || null,
                }))

                return {
                  ...ex,
                  sets: [...ex.sets, ...newSets],
                }
              } else if (setCount < currentSetCount) {
                // Remove sets
                return {
                  ...ex,
                  sets: ex.sets.slice(0, setCount),
                }
              }

              return ex
            }),
          }
        }),
      }
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey })
    },
  })

  // Handle adding a set to an exercise
  const handleAddSet = useCallback(
    (exerciseId: string) => {
      const exercise = favourite.exercises.find((ex) => ex.id === exerciseId)
      if (!exercise) return

      const newSetCount = exercise.sets.length + 1
      updateSetCountOptimistic({ exerciseId, setCount: newSetCount })
    },
    [favourite.exercises, updateSetCountOptimistic],
  )

  // Handle removing a set from an exercise
  const handleRemoveSet = useCallback(
    (exerciseId: string) => {
      const exercise = favourite.exercises.find((ex) => ex.id === exerciseId)
      if (!exercise || exercise.sets.length <= 1) return

      const newSetCount = exercise.sets.length - 1
      updateSetCountOptimistic({ exerciseId, setCount: newSetCount })
    },
    [favourite.exercises, updateSetCountOptimistic],
  )

  // Optimistic mutation for removing an exercise
  const { optimisticMutate: removeExerciseOptimistic } = useOptimisticMutation<
    GQLGetFavouriteWorkoutsQuery,
    GQLUpdateFavouriteWorkoutMutation,
    { exerciseId: string } & Parameters<typeof updateFavourite>[0]
  >({
    queryKey,
    mutationFn: ({ input }) => updateFavourite({ input }),
    updateFn: (oldData, { exerciseId }) => {
      if (!oldData?.getFavouriteWorkouts) return oldData

      return {
        ...oldData,
        getFavouriteWorkouts: oldData.getFavouriteWorkouts.map((fav) => {
          if (fav.id !== favourite.id) return fav

          return {
            ...fav,
            exercises: fav.exercises.filter((ex) => ex.id !== exerciseId),
          }
        }),
      }
    },
    onError: async () => {
      await queryClient.invalidateQueries({ queryKey })
    },
  })

  // Handle removing an exercise from the favourite
  const handleRemoveExercise = (exerciseId: string) => {
    const exercises = favourite.exercises
      .filter((ex) => ex.id !== exerciseId)
      .map((ex) => ({
        name: ex.name,
        order: ex.order,
        baseId: ex.baseId || undefined,
        restSeconds: ex.restSeconds || null,
        instructions: ex.instructions || [],
        sets: ex.sets.map((s) => ({
          order: s.order,
          reps: s.reps || null,
          minReps: s.minReps || null,
          maxReps: s.maxReps || null,
          weight: s.weight || null,
          rpe: s.rpe || null,
        })),
      }))

    removeExerciseOptimistic({
      exerciseId,
      input: {
        id: favourite.id,
        exercises,
      },
    })
  }

  // Optimistic mutation for reordering exercises
  const { optimisticMutate: reorderExercisesOptimistic } =
    useOptimisticMutation<
      GQLGetFavouriteWorkoutsQuery,
      GQLUpdateFavouriteWorkoutMutation,
      {
        reorderedExercises: typeof favourite.exercises
      } & Parameters<typeof updateFavourite>[0]
    >({
      queryKey,
      mutationFn: ({ input }) => updateFavourite({ input }),
      updateFn: (oldData, { reorderedExercises }) => {
        if (!oldData?.getFavouriteWorkouts) return oldData

        return {
          ...oldData,
          getFavouriteWorkouts: oldData.getFavouriteWorkouts.map((fav) => {
            if (fav.id !== favourite.id) return fav

            return {
              ...fav,
              exercises: reorderedExercises,
            }
          }),
        }
      },
      onError: async () => {
        await queryClient.invalidateQueries({ queryKey })
      },
    })

  // Handle drag end for reordering exercises
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = favourite.exercises.findIndex((ex) => ex.id === active.id)
    const newIndex = favourite.exercises.findIndex((ex) => ex.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Create a new array with reordered exercises
    const reorderedExercises = [...favourite.exercises]
    const [movedExercise] = reorderedExercises.splice(oldIndex, 1)
    reorderedExercises.splice(newIndex, 0, movedExercise)

    // Map to the format expected by the mutation with updated order values
    const exercises = reorderedExercises.map((ex, index) => ({
      name: ex.name,
      order: index, // Update order based on new position
      baseId: ex.baseId || undefined,
      restSeconds: ex.restSeconds || null,
      instructions: ex.instructions || [],
      sets: ex.sets.map((s) => ({
        order: s.order,
        reps: s.reps || null,
        minReps: s.minReps || null,
        maxReps: s.maxReps || null,
        weight: s.weight || null,
        rpe: s.rpe || null,
      })),
    }))

    reorderExercisesOptimistic({
      reorderedExercises,
      input: {
        id: favourite.id,
        exercises,
      },
    })
  }

  // Get unique muscle groups by filtering duplicates based on ID
  const uniqueMuscleGroups = favourite.exercises
    .flatMap((exercise) => exercise.base?.muscleGroups ?? [])
    .filter(
      (muscleGroup, index, array) =>
        array.findIndex((mg) => mg.groupSlug === muscleGroup.groupSlug) ===
        index,
    )

  return (
    <>
      <Accordion type="single" collapsible>
        <AccordionItem
          value="body-fat-estimation-guide"
          className="bg-card rounded-lg"
        >
          <AccordionTrigger className="flex items-center justify-between w-full p-4 text-left hover:bg-card-on-card/80 dark:hover:bg-card-on-card/80 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-base font-medium truncate">
                  {favourite.title}
                </h3>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  iconOnly={<Edit />}
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowEditMetadata(true)
                  }}
                >
                  Edit
                </Button>
              </div>
              <div className="flex items-center gap-1">
                {favourite.exercises.length > 0 && (
                  <Badge variant="secondary" size="sm">
                    {favourite.exercises.length} exercises
                  </Badge>
                )}
                {uniqueMuscleGroups.length > 0 &&
                  uniqueMuscleGroups.slice(0, 2).map((muscleGroup) => (
                    <Badge
                      key={muscleGroup?.id}
                      variant="muscle"
                      size="sm"
                      className="capitalize"
                    >
                      {muscleGroup?.groupSlug}
                    </Badge>
                  ))}
                {uniqueMuscleGroups.length > 2 && (
                  <Badge variant="muscle" size="sm">
                    +{uniqueMuscleGroups.length - 2}
                  </Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <div>
              <CardHeader className="py-5 border-t space-y-2">
                {favourite.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {favourite.description}
                  </p>
                )}
                <div className="flex gap-1 flex-wrap">
                  <Badge variant="secondary">{totalSets} sets</Badge>
                  {estimatedTime > 0 && (
                    <Badge variant="secondary">
                      <Clock className="w-3 h-3 mr-1" />~{estimatedTime}min
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-0 pb-4 space-y-4">
                {isEmpty ? (
                  <EmptyFavouriteOptions
                    onOpenAiWizard={() => setShowAiWizard(true)}
                    onOpenAddExercise={() => setShowAddExercise(true)}
                  />
                ) : (
                  <>
                    {/* Exercise Preview */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Exercises</h4>

                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={favourite.exercises.map((ex) => ex.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="text-sm flex flex-col gap-1">
                            {favourite.exercises.map((exercise, index) => (
                              <SortableExerciseItem
                                key={exercise.id}
                                exercise={exercise}
                                index={index}
                                onAddSet={handleAddSet}
                                onRemoveSet={handleRemoveSet}
                                onRemoveExercise={handleRemoveExercise}
                              />
                            ))}
                            <Button
                              size="sm"
                              variant="tertiary"
                              iconStart={<PlusIcon />}
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowAddExercise(true)
                              }}
                              className="mt-1"
                            >
                              Add Exercise
                            </Button>
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  </>
                )}
                <span className="text-xs text-muted-foreground">
                  Created {createdAgo}
                </span>
              </CardContent>
              <CardFooter className="flex gap-2 border-t [.border-t]:pt-4">
                <Button
                  size="icon-sm"
                  onClick={onDelete}
                  variant="ghost"
                  iconOnly={<Trash2 />}
                >
                  Delete
                </Button>

                {!isEmpty && !buttonProps.disabled && (
                  <Button
                    onClick={onStart}
                    size="sm"
                    variant={buttonProps.variant}
                    disabled={buttonProps.disabled}
                    iconEnd={<ChevronRight />}
                    className="ml-auto"
                  >
                    {buttonProps.text}
                  </Button>
                )}
              </CardFooter>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {/* AI Wizard */}
      {showAiWizard && (
        <FavouriteAiWizard
          open={showAiWizard}
          onClose={() => setShowAiWizard(false)}
          favouriteId={favourite.id}
          favouriteTitle={favourite.title}
        />
      )}

      {/* Add Exercise Drawer */}
      {showAddExercise && (
        <AddExerciseToFavouriteDrawer
          open={showAddExercise}
          onClose={() => setShowAddExercise(false)}
          favouriteId={favourite.id}
        />
      )}

      {/* Edit Metadata Drawer */}
      {showEditMetadata && (
        <EditFavouriteMetadataDrawer
          open={showEditMetadata}
          onClose={() => setShowEditMetadata(false)}
          favouriteId={favourite.id}
          currentTitle={favourite.title}
          currentDescription={favourite.description}
          onSuccess={onRefetch}
        />
      )}
    </>
  )
}

// Sortable Exercise Item Component
interface SortableExerciseItemProps {
  exercise: NonNullable<
    NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
  >[number]['exercises'][number]
  index: number
  onAddSet: (id: string) => void
  onRemoveSet: (id: string) => void
  onRemoveExercise: (id: string) => void
}

function SortableExerciseItem({
  exercise,
  index,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
}: SortableExerciseItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: exercise.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[auto_1fr_auto] items-center gap-1 w-full"
    >
      <span className="text-xs text-muted-foreground w-4 shrink-0">
        {index + 1}.
      </span>
      <Card
        borderless
        variant="tertiary"
        className="flex-1 p-2 rounded-md gap-3"
      >
        <CardHeader className="flex items-center justify-between p-0">
          <p className="justify-start whitespace-normal font-medium text-base">
            {exercise.name}
          </p>
          <Button
            size="icon-xs"
            variant="ghost"
            className="opacity-40 hover:opacity-100"
            iconOnly={<X />}
            onClick={(e) => {
              e.stopPropagation()
              onRemoveExercise(exercise.id)
            }}
          >
            Remove exercise
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center gap-0.5 shrink-0">
            <div className="grid grid-cols-[1fr_auto] items-center gap-4 ml-auto">
              <p>Sets</p>
              <div className="grid grid-cols-3 items-center gap-0.5 bg-card rounded-lg p-1">
                <Button
                  size="icon-sm"
                  variant="tertiary"
                  iconOnly={<MinusIcon />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveSet(exercise.id)
                  }}
                >
                  Remove set
                </Button>
                <AnimateNumber
                  value={exercise.sets.length}
                  duration={300}
                  className="text-center text-lg font-medium"
                />
                <Button
                  size="icon-sm"
                  variant="tertiary"
                  iconOnly={<PlusIcon />}
                  onClick={(e) => {
                    e.stopPropagation()
                    onAddSet(exercise.id)
                  }}
                >
                  Add set
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <button
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground cursor-grab active:cursor-grabbing shrink-0 touch-none"
      >
        <Grip className="size-4" />
      </button>
    </div>
  )
}
