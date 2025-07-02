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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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
  useAddSetExerciseFormMutation,
  useGetExerciseFormDataQuery,
  useRemoveExerciseFromDayMutation,
  useRemoveSetExerciseFormMutation,
  useUpdateExerciseFormMutation,
} from '@/generated/graphql-client'
import { useDebouncedInvalidation } from '@/hooks/use-debounced-invalidation'
import { useDebouncedMutationWrapper } from '@/hooks/use-debounced-mutation-wrapper'
import { formatTempoInput, handleTempoKeyDown } from '@/lib/format-tempo'
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
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

    // Revert to original stable key
    const stableKey = `${activeWeek}-${dayOfWeek}-${exerciseIndex}`

    // Memoize expensive computations
    const currentDay = useMemo(
      () =>
        formData.weeks[activeWeek]?.days.find(
          (day) => day.dayOfWeek === dayOfWeek,
        ),
      [formData.weeks, activeWeek, dayOfWeek],
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

    const handleRemoveExercise = useCallback(
      (
        e:
          | React.MouseEvent<HTMLDivElement, MouseEvent>
          | React.MouseEvent<HTMLButtonElement, MouseEvent>,
      ) => {
        e.stopPropagation()
        if (!exercise) {
          console.error('[SortableExercise]: Exercise not found', exerciseId)
          return
        }

        // Find the exercise in the current day and remove it
        const currentWeek = formData.weeks[activeWeek]
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
          console.error(
            '[SortableExercise]: Day not found for exercise removal',
          )
        }
      },
      [
        activeWeek,
        dayOfWeek,
        exerciseId,
        exercise,
        formData.weeks,
        removeExercise,
      ],
    )

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
          hoverable
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
          variant="outline"
          size="sm"
          onClick={() => onAddSet()}
        >
          <Plus className="h-4 w-4 mr-1" /> Add Set
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
            className="flex items-center gap-2 group/set"
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
                    onChange={(e) =>
                      onUpdateSet(
                        index,
                        'minReps',
                        e.target.value === ''
                          ? undefined
                          : Number.parseInt(e.target.value),
                      )
                    }
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
                    onChange={(e) =>
                      onUpdateSet(
                        index,
                        'maxReps',
                        e.target.value === ''
                          ? undefined
                          : Number.parseInt(e.target.value),
                      )
                    }
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
                  onChange={(e) =>
                    onUpdateSet(
                      index,
                      'weight',
                      e.target.value === ''
                        ? undefined
                        : Number.parseFloat(e.target.value),
                    )
                  }
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
                  onChange={(e) =>
                    onUpdateSet(
                      index,
                      'rpe',
                      e.target.value === ''
                        ? undefined
                        : Number.parseFloat(e.target.value),
                    )
                  }
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
                (!set.id || sets.length <= 1) &&
                  '!opacity-0 group-hover/set:!opacity-0',
              )}
              onClick={() => onRemoveSet(index)}
              disabled={sets.length <= 1 || !set.id}
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
  const { mutateAsync: updateExerciseForm } = useUpdateExerciseFormMutation()
  const { mutateAsync: addSetExerciseForm } = useAddSetExerciseFormMutation()
  const { mutateAsync: removeSetExerciseForm } =
    useRemoveSetExerciseFormMutation()
  const debouncedInvalidateQueries = useDebouncedInvalidation({
    queryKeys: ['GetTemplateTrainingPlanById', 'GetExerciseFormData'],
    delay: 1000,
  })
  const initialDataLoaded = useRef(false)

  const [localData, setLocalData] = useState<
    Omit<GQLUpdateExerciseFormInput, 'exerciseId'>
  >({
    name: '',
    instructions: '',
    additionalInstructions: '',
    restSeconds: undefined,
    warmupSets: undefined,
    tempo: '',
    sets: [],
  })

  useEffect(() => {
    if (data?.exercise && !initialDataLoaded.current) {
      setLocalData({
        name: data.exercise.name || '',
        type: data.exercise.type || null,
        instructions: data.exercise.instructions || '',
        additionalInstructions: data.exercise.additionalInstructions || '',
        restSeconds: data.exercise.restSeconds || undefined,
        warmupSets: data.exercise.warmupSets || undefined,
        tempo: data.exercise.tempo || '',
        sets: data.exercise.sets.map((set) => ({
          id: set.id,
          order: set.order,
          minReps: set.minReps || undefined,
          maxReps: set.maxReps || undefined,
          weight: set.weight || undefined,
          rpe: set.rpe || undefined,
        })),
      })

      initialDataLoaded.current = true
    }
  }, [data?.exercise])

  const exercise = data?.exercise

  const debouncedUpdateExerciseForm = useDebouncedMutationWrapper(
    updateExerciseForm,
    {
      delay: 700,
      onSuccess: () => debouncedInvalidateQueries(),
      onError: (error) => console.error('Update failed:', error),
    },
  )

  const updateExercise = useCallback(
    async (input: Omit<GQLUpdateExerciseFormInput, 'exerciseId'>) => {
      const beforeExercise = {
        ...exercise,
      }

      const updatedExercise: Omit<GQLUpdateExerciseFormInput, 'exerciseId'> = {
        ...localData,
        name: input.name,
        type: input.type,
        instructions: input.instructions,
        additionalInstructions: input.additionalInstructions,
        restSeconds: input.restSeconds ? Number(input.restSeconds) : undefined,
        warmupSets: input.warmupSets ? Number(input.warmupSets) : undefined,
        tempo: input.tempo,
        sets: input.sets,
      }

      try {
        setLocalData(updatedExercise)

        await debouncedUpdateExerciseForm(
          {
            input: {
              exerciseId,
              ...updatedExercise,
            },
          },
          {
            onError: () => {
              console.error('[Update exercise]: Failed to update exercise', {
                exerciseId,
              })
              setLocalData(beforeExercise)
            },
          },
        )
      } catch (error) {
        console.error('Day update failed:', error)
        setLocalData(beforeExercise)
      }
    },
    [debouncedUpdateExerciseForm, exerciseId, exercise, localData],
  )

  const addSet = useCallback(
    async (input: Omit<GQLUpdateExerciseSetFormInput, 'exerciseId'>) => {
      const lastSetData = localData.sets?.[localData.sets.length - 1]

      // Create a temporary ID for optimistic updates
      const tempId = `temp-${Date.now()}-${Math.random()}`

      const addedSet: Omit<GQLUpdateExerciseSetFormInput, 'exerciseId'> & {
        id?: string
      } = {
        id: tempId, // Add temporary ID for tracking
        minReps: input.minReps ? Number(input.minReps) : lastSetData?.minReps,
        maxReps: input.maxReps ? Number(input.maxReps) : lastSetData?.maxReps,
        weight: input.weight ? Number(input.weight) : lastSetData?.weight,
        rpe: input.rpe ? Number(input.rpe) : lastSetData?.rpe,
        order: localData.sets?.length ? localData.sets.length + 1 : 1,
      }

      try {
        // Optimistic update: add set with temporary ID
        setLocalData((prevData) => ({
          ...prevData,
          sets: [...(prevData.sets || []), addedSet],
        }))

        await addSetExerciseForm(
          {
            input: {
              exerciseId,
              set: {
                maxReps: addedSet.maxReps,
                minReps: addedSet.minReps,
                weight: addedSet.weight,
                rpe: addedSet.rpe,
              },
            },
          },
          {
            onSuccess: (data) => {
              debouncedInvalidateQueries()
              // Replace the temporary set with the real one from server
              setLocalData((prevData) => ({
                ...prevData,
                sets:
                  prevData.sets?.map((set) =>
                    set.id === tempId
                      ? { ...addedSet, id: data.addSetExerciseForm.id }
                      : set,
                  ) || [],
              }))
            },
            onError: () => {
              console.error('[Add set]: Failed to add set', {
                exerciseId,
              })
              // Remove the temporary set on error
              setLocalData((prevData) => ({
                ...prevData,
                sets: prevData.sets?.filter((set) => set.id !== tempId) || [],
              }))
            },
          },
        )
      } catch (error) {
        console.error('Day update failed:', error)
        // Remove the temporary set on error
        setLocalData((prevData) => ({
          ...prevData,
          sets: prevData.sets?.filter((set) => set.id !== tempId) || [],
        }))
      }
    },
    [
      exerciseId,
      localData.sets,
      addSetExerciseForm,
      debouncedInvalidateQueries,
    ],
  )

  const removeSet = useCallback(
    async (setId: string) => {
      const beforeSets = [...(localData.sets || [])]

      try {
        setLocalData({
          ...localData,
          sets: localData.sets?.filter((set) => set.id !== setId),
        })

        await removeSetExerciseForm(
          {
            setId,
          },
          {
            onSuccess: () => {
              debouncedInvalidateQueries()
            },
            onError: () => {
              console.error('[Remove set]: Failed to remove set', {
                exerciseId,
              })
              setLocalData({
                ...localData,
                sets: beforeSets,
              })
            },
          },
        )
      } catch (error) {
        console.error('Day update failed:', error)
        setLocalData({
          ...localData,
          sets: beforeSets,
        })
      }
    },
    [removeSetExerciseForm, localData, exerciseId, debouncedInvalidateQueries],
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
            value={localData.name ?? ''}
            onChange={(e) =>
              updateExercise({
                ...localData,
                name: e.target.value,
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
              value={localData.type ?? ''}
              onValueChange={(value) =>
                updateExercise({
                  ...localData,
                  type: value === 'none' ? null : (value as GQLExerciseType),
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
              value={localData.restSeconds ?? ''}
              min="0"
              step="15"
              onChange={(e) =>
                updateExercise({
                  ...localData,
                  restSeconds:
                    e.target.value === '' ? undefined : Number(e.target.value),
                })
              }
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
              value={localData.warmupSets ?? ''}
              onChange={(e) => {
                updateExercise({
                  ...localData,
                  warmupSets:
                    e.target.value === '' ? undefined : Number(e.target.value),
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
              value={localData.tempo ?? ''}
              onChange={(e) => {
                const formattedValue = formatTempoInput(e)
                updateExercise({
                  ...localData,
                  tempo: formattedValue,
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
              onUpdateSet={(index, field, value) => {
                return updateExercise({
                  ...localData,
                  sets: localData.sets?.map((set, i) =>
                    i === index ? { ...set, [field]: value } : set,
                  ),
                })
              }}
              onRemoveSet={(index) =>
                localData.sets?.[index].id
                  ? removeSet(localData.sets[index].id)
                  : Promise.resolve()
              }
              onAddSet={() =>
                addSet({
                  minReps: undefined,
                  maxReps: undefined,
                  weight: undefined,
                  rpe: undefined,
                  order: localData.sets?.length ? localData.sets.length + 1 : 1,
                })
              }
              isLoading={isLoading}
              sets={localData.sets || []}
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
                value={localData.instructions ?? ''}
                onChange={(e) =>
                  updateExercise({
                    ...localData,
                    instructions: e.target.value,
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
                value={localData.additionalInstructions ?? ''}
                onChange={(e) =>
                  updateExercise({
                    ...localData,
                    additionalInstructions: e.target.value,
                  })
                }
              />
            </div>
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
            variant="outline"
            disabled={isRemovingExercise || hasPendingMutations}
          >
            Done
          </Button>
        </DialogClose>
      </DialogFooter>
    </div>
  )
}
