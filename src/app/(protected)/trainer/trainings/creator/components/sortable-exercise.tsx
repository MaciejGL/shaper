'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useIsMutating } from '@tanstack/react-query'
import {
  FlameIcon,
  GaugeIcon,
  Loader2,
  MoreHorizontal,
  Pencil,
  TimerIcon,
  Trash2,
} from 'lucide-react'
import { InfoIcon, Plus, X } from 'lucide-react'
import { useCallback, useMemo } from 'react'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { VideoPreview } from '@/components/video-preview'
import { useTrainingPlan } from '@/context/training-plan-context/training-plan-context'
import {
  GQLExerciseType,
  GQLUpdateExerciseFormInput,
  GQLUpdateExerciseSetFormInput,
  useGetExerciseFormDataQuery,
  useRemoveExerciseFromDayMutation,
} from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'
import { useExerciseFormMutations } from '@/hooks/use-exercise-form-mutations'
import { formatTempoInput, handleTempoKeyDown } from '@/lib/format-tempo'
import { isTemporaryId } from '@/lib/optimistic-mutations'
import { cn } from '@/lib/utils'

import { EXERCISE_TYPES } from './utils'

interface SortableExerciseProps {
  exerciseId: string
  dayOfWeek: number
  exerciseIndex: number
}

export const SortableExercise = React.memo(
  function SortableExercise({
    exerciseId,
    dayOfWeek,
    exerciseIndex,
  }: SortableExerciseProps) {
    const { formData, activeWeek, removeExercise } = useTrainingPlan()
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

    // Revert to original stable key
    const stableKey = `${activeWeek}-${dayOfWeek}-${exerciseIndex}`

    // Memoize expensive computations
    const currentDay = useMemo(
      () =>
        formData?.weeks[activeWeek]?.days.find(
          (day) => day.dayOfWeek === dayOfWeek,
        ),
      [formData?.weeks, activeWeek, dayOfWeek],
    )

    // Revert to original index-based lookup
    const exercise = useMemo(
      () => currentDay?.exercises[exerciseIndex], // Use index instead of find
      [currentDay, exerciseIndex],
    )

    const {
      attributes,
      listeners,
      setNodeRef,
      transform,
      transition,
      isDragging,
    } = useSortable({
      id: stableKey,
      data: {
        type: 'day-exercise',
        exercise,
        weekIndex: activeWeek,
        dayIndex: dayOfWeek,
        exerciseIndex,
      },
      // Optimize animations
      animateLayoutChanges: () => false, // Disable layout animations for better performance
    })

    // Optimized transform with hardware acceleration
    const style = {
      transform: CSS.Transform.toString(transform),
      transition: isDragging ? 'none' : transition, // Disable transitions while dragging
      willChange: isDragging ? 'transform' : 'auto', // Hint for browser optimization
      zIndex: isDragging ? 1000 : 1,
    }

    const handleRemoveExercise = useCallback(() => {
      if (!formData || !exercise) return

      // Find the exercise in the current day and remove it
      const currentWeek = formData.weeks[activeWeek]
      if (!currentWeek) return

      const day = currentWeek.days.find((d) => d.dayOfWeek === dayOfWeek)

      if (day) {
        const exerciseIndex = day.exercises.findIndex(
          (ex) => ex.id === exercise.id,
        )
        if (exerciseIndex !== -1) {
          removeExercise(activeWeek, dayOfWeek, exerciseIndex)
        } else {
          console.error('[SortableExercise]: Exercise not found for removal')
        }
      } else {
        console.error('[SortableExercise]: Day not found for exercise removal')
      }
    }, [activeWeek, dayOfWeek, exercise, removeExercise, formData])

    if (!exercise) {
      console.warn('[SortableExercise]: Exercise not found', exerciseId)
      return null
    }

    return (
      <div className="relative group">
        <Card
          ref={setNodeRef}
          style={style}
          {...attributes}
          {...listeners}
          className={cn(
            'cursor-grab active:cursor-grabbing p-0 transition-all duration-200 ease-out min-h-[120px] select-none',
            // Remove border and background when dragging. It's a wrapper in sorting context
            isDragging && 'border-none !bg-primary/10 mx-2 !scale-100',
          )}
          variant="secondary"
        >
          {/* {isDragging && <InsertionIndicatorBlank isActive={true} />} */}
          {!isDragging && (
            <CardContent
              className="grow p-3 flex flex-col gap-2 justify-between overflow-hidden cursor-pointer"
              onClick={() => {
                setIsEditDialogOpen(true)
              }}
            >
              {exercise.type && (
                <Badge variant="secondary">
                  {EXERCISE_TYPES[exercise.type]}
                </Badge>
              )}
              <p className="text-md font-medium pr-4">{exercise.name}</p>
              <p className="text-sm text-muted-foreground">
                {exercise.additionalInstructions}
              </p>

              <div className="flex items-center gap-2 flex-wrap mt-8">
                {exercise.sets.length > 0 && (
                  <Badge variant="outline">
                    <FlameIcon /> {exercise.sets.length} set
                    {exercise.sets.length === 1 ? '' : 's'}
                  </Badge>
                )}
                {exercise.warmupSets && (
                  <Badge variant="outline">
                    <FlameIcon />
                    {exercise.warmupSets} warmup
                    {exercise.warmupSets === 1 ? '' : 's'}
                  </Badge>
                )}
                {exercise.restSeconds && (
                  <Badge variant="outline">
                    <TimerIcon /> {exercise.restSeconds} rest
                  </Badge>
                )}
                {exercise.tempo && (
                  <Badge variant="outline">
                    <GaugeIcon /> {exercise.tempo}
                  </Badge>
                )}
              </div>
            </CardContent>
          )}
        </Card>
        {!isDragging && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="p-0 absolute top-1 right-1 z-10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                iconOnly={<MoreHorizontal />}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                <Pencil className="w-3 h-3" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleRemoveExercise}
                className="cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {isEditDialogOpen && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent dialogTitle={exercise.name} className="sm:max-w-2xl">
              <ExerciseDialogContent exerciseId={exerciseId} />
            </DialogContent>
          </Dialog>
        )}
      </div>
    )
  },
  (prevProps, nextProps) => {
    // More specific comparison to reduce re-renders
    return (
      prevProps.exerciseId === nextProps.exerciseId &&
      prevProps.dayOfWeek === nextProps.dayOfWeek &&
      prevProps.exerciseIndex === nextProps.exerciseIndex
    )
  },
)

type KanbanExerciseSetsProps = {
  isLoading: boolean
  sets: GQLUpdateExerciseSetFormInput[]
  onUpdateSet: (index: number, field: string, value?: number) => Promise<void>
  onRemoveSet: (index: number) => Promise<void>
  onAddSet: () => Promise<void>
}

function KanbanExerciseSets({
  isLoading,
  onUpdateSet,
  onRemoveSet,
  onAddSet,
  sets,
}: KanbanExerciseSetsProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-end">
        <Label>Sets</Label>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => onAddSet()}
          iconStart={<Plus />}
        >
          Add Set
        </Button>
      </div>

      <div
        className={cn(
          'space-y-2 bg-card px-6 py-2 rounded-md',
          isLoading && 'animate-pulse min-h-[76px]',
        )}
      >
        {sets.map((set, index) => (
          <div
            key={set.order + index}
            className={cn(
              'flex items-center gap-2 group/set',
              set.id && isTemporaryId(set.id) && 'opacity-60 animate-pulse',
            )}
          >
            <div
              className={cn('font-medium w-8', set.order === 1 && 'mt-[20px]')}
            >
              #{set.order}
            </div>
            <div className="flex items-center gap-4">
              <div>
                {set.order === 1 && (
                  <Label htmlFor={`reps-${set.order}`} className="text-sm mb-1">
                    Reps
                    <Tooltip>
                      <TooltipTrigger>
                        <InfoIcon className="size-3" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>
                          Minimum reps are required. If You don't want to
                          specify range of reps You can leave Max Reps blank.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </Label>
                )}
                <div className="flex items-center gap-1">
                  <Input
                    id={`min-reps-${set.order}`}
                    placeholder="Min*"
                    variant="ghost"
                    type="number"
                    min="1"
                    value={set.minReps || ''}
                    disabled={set.id ? isTemporaryId(set.id) : true}
                    onChange={(e) => {
                      // Don't update sets with temporary IDs to prevent API errors
                      if (!set.id || isTemporaryId(set.id)) return
                      onUpdateSet(
                        index,
                        'minReps',
                        e.target.value === ''
                          ? undefined
                          : Number.parseInt(e.target.value),
                      )
                    }}
                    className="max-w-20"
                  />
                  -
                  <Input
                    id={`max-reps-${set.order}`}
                    variant="ghost"
                    type="number"
                    placeholder="Max"
                    min="1"
                    error={
                      set.minReps && set.maxReps && set.minReps > set.maxReps
                        ? 'Min reps must be less than max reps'
                        : undefined
                    }
                    value={set.maxReps || ''}
                    disabled={set.id ? isTemporaryId(set.id) : true}
                    onChange={(e) => {
                      // Don't update sets with temporary IDs to prevent API errors
                      if (!set.id || isTemporaryId(set.id)) return
                      onUpdateSet(
                        index,
                        'maxReps',
                        e.target.value === ''
                          ? undefined
                          : Number.parseInt(e.target.value),
                      )
                    }}
                    className="max-w-20"
                  />
                </div>
              </div>
              <div>
                {set.order === 1 && (
                  <Label
                    htmlFor={`weight-${set.order}`}
                    className="text-sm mb-1"
                  >
                    Weight
                  </Label>
                )}
                <Input
                  id={`weight-${set.order}`}
                  variant="ghost"
                  type="number"
                  min="0"
                  step="2.5"
                  value={set.weight ?? ''}
                  disabled={set.id ? isTemporaryId(set.id) : true}
                  onChange={(e) => {
                    // Don't update sets with temporary IDs to prevent API errors
                    if (!set.id || isTemporaryId(set.id)) return
                    onUpdateSet(
                      index,
                      'weight',
                      e.target.value === ''
                        ? undefined
                        : Number.parseFloat(e.target.value),
                    )
                  }}
                  className="max-w-32"
                />
              </div>
              <div>
                {set.order === 1 && (
                  <Label htmlFor={`rpe-${set.order}`} className="text-sm mb-1">
                    RPE
                  </Label>
                )}
                <Input
                  id={`rpe-${set.order}`}
                  variant="ghost"
                  type="number"
                  min="1"
                  max="10"
                  step="1"
                  value={set.rpe ?? ''}
                  disabled={set.id ? isTemporaryId(set.id) : true}
                  onChange={(e) => {
                    // Don't update sets with temporary IDs to prevent API errors
                    if (!set.id || isTemporaryId(set.id)) return
                    onUpdateSet(
                      index,
                      'rpe',
                      e.target.value === ''
                        ? undefined
                        : Number.parseFloat(e.target.value),
                    )
                  }}
                  className="max-w-20"
                />
              </div>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon-md"
              className={cn(
                '!opacity-0 group-hover/set:!opacity-100 self-end',
                (!set.id ||
                  sets.length <= 1 ||
                  (set.id && isTemporaryId(set.id))) &&
                  '!opacity-0 group-hover/set:!opacity-0',
              )}
              onClick={() => onRemoveSet(index)}
              disabled={
                sets.length <= 1 ||
                !set.id ||
                Boolean(set.id && isTemporaryId(set.id))
              }
              iconOnly={<X />}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

type ExerciseDialogContentProps = {
  exerciseId: string
}

function ExerciseDialogContent({ exerciseId }: ExerciseDialogContentProps) {
  // Use cached data directly - no local state needed!
  const { data, error, isLoading } = useGetExerciseFormDataQuery(
    { exerciseId },
    {
      enabled: !!exerciseId,
      staleTime: 30 * 1000,
    },
  )

  const debouncedBoardInvalidation = useDebouncedInvalidation({
    queryKeys: ['GetTemplateTrainingPlanById'],
    delay: 100,
  })

  const { mutateAsync: removeExercise, isPending: isRemovingExercise } =
    useRemoveExerciseFromDayMutation({
      onSuccess: () => {
        debouncedBoardInvalidation()
      },
    })

  // Use the unified optimistic mutations system
  const {
    updateExercise: updateExerciseOptimistic,
    addSet: addSetOptimistic,
    removeSet: removeSetOptimistic,
    updateSet: updateSetOptimistic,
  } = useExerciseFormMutations(exerciseId)

  const exercise = data?.exercise

  const updateExercise = useCallback(
    (input: Omit<GQLUpdateExerciseFormInput, 'exerciseId'>) => {
      updateExerciseOptimistic({
        input: {
          exerciseId,
          ...input,
        },
      })
    },
    [updateExerciseOptimistic, exerciseId],
  )

  const addSetToExercise = useCallback(() => {
    const lastSetData = exercise?.sets?.[exercise.sets.length - 1]

    addSetOptimistic({
      minReps: lastSetData?.minReps ?? undefined,
      maxReps: lastSetData?.maxReps ?? undefined,
      weight: lastSetData?.weight ?? undefined,
      rpe: lastSetData?.rpe ?? undefined,
    })
  }, [addSetOptimistic, exercise?.sets])

  const removeSet = useCallback(
    (setId: string) => {
      removeSetOptimistic({ setId })
    },
    [removeSetOptimistic],
  )

  const hasPendingMutations = useIsMutating() > 0

  if (error) {
    return <div>Failed to load exercise</div>
  }

  return (
    <div className="gap-2">
      <DialogHeader className="mb-8">
        <DialogTitle className="flex flex-row items-center gap-2">
          Edit exercise{' '}
          {hasPendingMutations && <Loader2 className="w-4 h-4 animate-spin" />}
        </DialogTitle>
        <DialogDescription>
          Edit the exercise details and sets.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <Label htmlFor="exerciseName" className="text-sm">
            Name
          </Label>
          <Input
            id="exerciseName"
            variant="ghost"
            value={exercise?.name ?? ''}
            onChange={(e) =>
              updateExercise({
                name: e.target.value,
                type: exercise?.type,
                instructions: exercise?.instructions,
                additionalInstructions: exercise?.additionalInstructions,
                restSeconds: exercise?.restSeconds,
                warmupSets: exercise?.warmupSets,
                tempo: exercise?.tempo,
                sets: exercise?.sets?.map((set) => ({
                  id: set.id,
                  order: set.order,
                  minReps: set.minReps,
                  maxReps: set.maxReps,
                  weight: set.weight,
                  rpe: set.rpe,
                })),
              })
            }
          />
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm items-end">
          <div className="flex flex-col gap-1">
            <Label htmlFor="exerciseType" className="text-sm">
              Variation
            </Label>
            <Select
              value={exercise?.type ?? ''}
              onValueChange={(value) =>
                updateExercise({
                  name: exercise?.name,
                  type: value === 'none' ? null : (value as GQLExerciseType),
                  instructions: exercise?.instructions,
                  additionalInstructions: exercise?.additionalInstructions,
                  restSeconds: exercise?.restSeconds,
                  warmupSets: exercise?.warmupSets,
                  tempo: exercise?.tempo,
                  sets: exercise?.sets?.map((set) => ({
                    id: set.id,
                    order: set.order,
                    minReps: set.minReps,
                    maxReps: set.maxReps,
                    weight: set.weight,
                    rpe: set.rpe,
                  })),
                })
              }
            >
              <SelectTrigger variant="ghost">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No variation</SelectItem>
                {Object.entries(EXERCISE_TYPES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {exercise?.type !== GQLExerciseType.Cardio && (
            <Input
              id="restSeconds"
              label="Rest (s)"
              type="number"
              size="md"
              variant="ghost"
              value={exercise?.restSeconds ?? ''}
              min="0"
              step="15"
              onChange={(e) => {
                const restSeconds =
                  e.target.value === '' ? undefined : Number(e.target.value)
                updateExercise({
                  name: exercise?.name,
                  type: exercise?.type,
                  instructions: exercise?.instructions,
                  additionalInstructions: exercise?.additionalInstructions,
                  restSeconds,
                  warmupSets: exercise?.warmupSets,
                  tempo: exercise?.tempo,
                  sets: exercise?.sets?.map((set) => ({
                    id: set.id,
                    order: set.order,
                    minReps: set.minReps,
                    maxReps: set.maxReps,
                    weight: set.weight,
                    rpe: set.rpe,
                  })),
                })
              }}
              className="min-w-28 max-w-min"
              iconStart={<TimerIcon />}
            />
          )}

          {exercise?.type !== GQLExerciseType.Cardio && (
            <Input
              id="warmup"
              label="Warmup sets"
              size="md"
              variant="ghost"
              type="number"
              min="0"
              step="1"
              value={exercise?.warmupSets ?? ''}
              onChange={(e) => {
                const warmupSets =
                  e.target.value === '' ? undefined : Number(e.target.value)
                updateExercise({
                  name: exercise?.name,
                  type: exercise?.type,
                  instructions: exercise?.instructions,
                  additionalInstructions: exercise?.additionalInstructions,
                  restSeconds: exercise?.restSeconds,
                  warmupSets,
                  tempo: exercise?.tempo,
                  sets: exercise?.sets?.map((set) => ({
                    id: set.id,
                    order: set.order,
                    minReps: set.minReps,
                    maxReps: set.maxReps,
                    weight: set.weight,
                    rpe: set.rpe,
                  })),
                })
              }}
              iconStart={<GaugeIcon />}
              className="min-w-28 max-w-min"
            />
          )}

          {exercise?.type !== GQLExerciseType.Cardio && (
            <Input
              id="tempo"
              label="Tempo"
              size="md"
              variant="ghost"
              pattern="[0-9]*"
              placeholder="3-2-3"
              value={exercise?.tempo ?? ''}
              onChange={(e) => {
                const formattedValue = formatTempoInput(e)
                updateExercise({
                  name: exercise?.name,
                  type: exercise?.type,
                  instructions: exercise?.instructions,
                  additionalInstructions: exercise?.additionalInstructions,
                  restSeconds: exercise?.restSeconds,
                  warmupSets: exercise?.warmupSets,
                  tempo: formattedValue,
                  sets: exercise?.sets?.map((set) => ({
                    id: set.id,
                    order: set.order,
                    minReps: set.minReps,
                    maxReps: set.maxReps,
                    weight: set.weight,
                    rpe: set.rpe,
                  })),
                })
              }}
              onKeyDown={handleTempoKeyDown}
              iconStart={<GaugeIcon />}
              className="min-w-28 max-w-min"
            />
          )}

          <div className="flex gap-1">
            {exercise?.videoUrl && (
              <VideoPreview url={exercise.videoUrl} variant="secondary" />
            )}
          </div>
        </div>
        <div className="w-full grid grid-cols-1 @4xl/section:grid-cols-[1fr_400px] gap-8">
          {exercise?.type !== GQLExerciseType.Cardio && (
            <KanbanExerciseSets
              onUpdateSet={async (index, field, value) => {
                const currentSet = exercise?.sets?.[index]
                if (!currentSet) return

                // Use the specific updateSet function for individual set updates
                updateSetOptimistic({
                  id: currentSet.id,
                  order: currentSet.order,
                  minReps: field === 'minReps' ? value : currentSet.minReps,
                  maxReps: field === 'maxReps' ? value : currentSet.maxReps,
                  weight: field === 'weight' ? value : currentSet.weight,
                  rpe: field === 'rpe' ? value : currentSet.rpe,
                })
              }}
              onRemoveSet={async (index) => {
                const setId = exercise?.sets?.[index]?.id
                if (setId) {
                  removeSet(setId)
                }
              }}
              onAddSet={async () => {
                addSetToExercise()
              }}
              isLoading={isLoading}
              sets={
                exercise?.sets?.map((set) => ({
                  id: set.id,
                  order: set.order,
                  minReps: set.minReps,
                  maxReps: set.maxReps,
                  weight: set.weight,
                  rpe: set.rpe,
                })) || []
              }
            />
          )}
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="instructions"
                className="flex flex-col items-start text-sm"
              >
                <p>Instructions (Visible in exercise menu)</p>
              </Label>
              <Textarea
                id="instructions"
                className="min-h-24"
                variant="ghost"
                value={exercise?.instructions ?? ''}
                onChange={(e) =>
                  updateExercise({
                    name: exercise?.name,
                    type: exercise?.type,
                    instructions: e.target.value,
                    additionalInstructions: exercise?.additionalInstructions,
                    restSeconds: exercise?.restSeconds,
                    warmupSets: exercise?.warmupSets,
                    tempo: exercise?.tempo,
                    sets: exercise?.sets?.map((set) => ({
                      id: set.id,
                      order: set.order,
                      minReps: set.minReps,
                      maxReps: set.maxReps,
                      weight: set.weight,
                      rpe: set.rpe,
                    })),
                  })
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="additionalInstructions"
                className="flex flex-col items-start text-sm"
              >
                <p>
                  Additional Instructions (Visible directly in the exercise
                  view)
                </p>
              </Label>
              <Textarea
                id="additionalInstructions"
                rows={3}
                variant="ghost"
                className="min-h-24"
                value={exercise?.additionalInstructions ?? ''}
                onChange={(e) =>
                  updateExercise({
                    name: exercise?.name,
                    type: exercise?.type,
                    instructions: exercise?.instructions,
                    additionalInstructions: e.target.value,
                    restSeconds: exercise?.restSeconds,
                    warmupSets: exercise?.warmupSets,
                    tempo: exercise?.tempo,
                    sets: exercise?.sets?.map((set) => ({
                      id: set.id,
                      order: set.order,
                      minReps: set.minReps,
                      maxReps: set.maxReps,
                      weight: set.weight,
                      rpe: set.rpe,
                    })),
                  })
                }
              />
            </div>
            {(exercise?.substitutes?.length ?? 0) > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-sm">Substitute options</p>
                <div className="flex flex-wrap gap-2">
                  {exercise?.substitutes.map((substitute) => (
                    <div
                      key={substitute.id}
                      className="px-3 py-2 rounded-md bg-card"
                    >
                      {substitute.substitute.name}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <DialogFooter className="flex flex-row justify-between mt-4">
        <Button
          variant="destructive"
          onClick={() => removeExercise({ exerciseId })}
          disabled={isRemovingExercise || hasPendingMutations}
          loading={isRemovingExercise}
        >
          Remove exercise
        </Button>
        <DialogClose asChild>
          <Button
            variant="secondary"
            disabled={isRemovingExercise || hasPendingMutations}
          >
            Done
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  )
}
