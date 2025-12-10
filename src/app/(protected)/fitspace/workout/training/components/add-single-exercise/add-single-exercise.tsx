'use client'

import { useQueryClient } from '@tanstack/react-query'
import { CheckIcon, PlusIcon, SearchIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { ExerciseMediaPreview } from '@/components/exercise-media-preview'
import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import {
  DISPLAY_GROUP_TO_HIGH_LEVEL,
  HIGH_LEVEL_TO_DISPLAY_GROUPS,
  type HighLevelGroup,
} from '@/config/muscles'
import {
  type GQLFitspaceGetExercisesQuery,
  useFitspaceAddSingleExerciseToDayMutation,
  useFitspaceGetExercisesQuery,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceRemoveExerciseFromWorkoutMutation,
} from '@/generated/graphql-client'
import { queryInvalidation } from '@/lib/query-invalidation'
import { cn } from '@/lib/utils'

import { AiExerciseSuggestions } from './ai-exercise-suggestions'
import type { AddedExerciseInfo } from './types'
import { useWeeklyFocus } from './use-weekly-focus'
import { WeeklyFocusChips } from './weekly-focus-chips'

type Exercise = NonNullable<
  NonNullable<GQLFitspaceGetExercisesQuery['getExercises']>['publicExercises']
>[number]

interface AddSingleExerciseProps {
  dayId: string
  variant?: 'card' | 'button' | 'drawer-only'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  scheduledAt?: string | null
}

export function AddSingleExercise({
  dayId,
  variant = 'card',
  open: controlledOpen,
  onOpenChange,
  scheduledAt,
}: AddSingleExerciseProps) {
  const [internalOpen, setInternalOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : internalOpen
  const setOpen = isControlled
    ? (value: boolean) => onOpenChange?.(value)
    : setInternalOpen
  const [addingExerciseId, setAddingExerciseId] = useState<string | null>(null)
  const [removingExerciseId, setRemovingExerciseId] = useState<string | null>(
    null,
  )
  const [addedExercises, setAddedExercises] = useState<
    Map<string, AddedExerciseInfo>
  >(new Map())
  const [exerciseToRemove, setExerciseToRemove] = useState<{
    baseId: string
    trainingExerciseId: string
    hasLogs: boolean
  } | null>(null)
  const queryClient = useQueryClient()
  const [dayIdFromUrl] = useQueryState('day')

  const { data: exercisesData, isLoading } = useFitspaceGetExercisesQuery()

  // Helper to invalidate workout queries after mutations
  const invalidateWorkoutQueries = useCallback(async () => {
    await queryInvalidation.workoutAndPlans(queryClient)
    const queryKey = useFitspaceGetWorkoutDayQuery.getKey({
      dayId: dayIdFromUrl || dayId,
    })
    await queryClient.refetchQueries({ queryKey })
  }, [queryClient, dayIdFromUrl, dayId])

  // Fetch current workout day to get existing exercises
  const { data: workoutDayData } = useFitspaceGetWorkoutDayQuery(
    { dayId },
    { enabled: !!dayId },
  )

  // Sync addedExercises with exercises from workout day (source of truth)
  useEffect(() => {
    const existingExercises =
      workoutDayData?.getWorkoutDay?.day?.exercises || []

    const newMap = new Map<string, AddedExerciseInfo>()
    existingExercises.forEach((ex) => {
      if (ex.baseId) {
        newMap.set(ex.baseId, {
          trainingExerciseId: ex.id,
          hasLogs: ex.sets.some((set) => set.completedAt != null),
        })
      }
    })

    setAddedExercises(newMap)
  }, [workoutDayData])

  const allExercises = useMemo(() => {
    const publicExercises = exercisesData?.getExercises?.publicExercises || []
    const trainerExercises = exercisesData?.getExercises?.trainerExercises || []

    const exerciseMap = new Map<string, Exercise>()

    publicExercises.forEach((exercise) => {
      exerciseMap.set(exercise.id, exercise)
    })

    trainerExercises.forEach((exercise) => {
      exerciseMap.set(exercise.id, exercise)
    })

    return Array.from(exerciseMap.values())
  }, [exercisesData])

  const { mutate: addExercise, isPending: isAdding } =
    useFitspaceAddSingleExerciseToDayMutation({
      onSuccess: async (data, variables) => {
        // Track the added exercise with its training exercise ID
        const trainingExerciseId = data?.addSingleExerciseToDay?.id
        if (trainingExerciseId) {
          setAddedExercises(
            (prev) =>
              new Map([
                ...prev,
                [
                  variables.exerciseBaseId,
                  { trainingExerciseId, hasLogs: false },
                ],
              ]),
          )
        }

        await invalidateWorkoutQueries()
        setAddingExerciseId(null)
      },
      onError: () => {
        setAddingExerciseId(null)
      },
    })

  const { mutate: removeExercise, isPending: isRemoving } =
    useFitspaceRemoveExerciseFromWorkoutMutation({
      onSuccess: async (_data, variables) => {
        // Remove from map by finding the baseId
        setAddedExercises((prev) => {
          const newMap = new Map(prev)
          for (const [baseId, info] of newMap) {
            if (info.trainingExerciseId === variables.exerciseId) {
              newMap.delete(baseId)
              break
            }
          }
          return newMap
        })

        setExerciseToRemove(null)
        setRemovingExerciseId(null)

        await invalidateWorkoutQueries()
      },
      onError: () => {
        setRemovingExerciseId(null)
        setExerciseToRemove(null)
      },
    })

  const handleRemoveExercise = useCallback(
    (baseId: string) => {
      const info = addedExercises.get(baseId)
      if (!info) return

      setRemovingExerciseId(baseId)

      if (info.hasLogs) {
        // Show confirmation dialog
        setExerciseToRemove({ baseId, ...info })
      } else {
        // Remove directly
        removeExercise({ exerciseId: info.trainingExerciseId })
      }
    },
    [addedExercises, removeExercise],
  )

  const confirmRemove = useCallback(() => {
    if (exerciseToRemove) {
      removeExercise({ exerciseId: exerciseToRemove.trainingExerciseId })
    }
  }, [exerciseToRemove, removeExercise])

  const handleSelectExercise = useCallback(
    (exerciseId: string) => {
      setAddingExerciseId(exerciseId)
      addExercise({
        dayId,
        exerciseBaseId: exerciseId,
      })
    },
    [addExercise, dayId],
  )

  // Handle batch adding exercises from AI suggestions
  const [isBatchAdding, setIsBatchAdding] = useState(false)
  const handleAddMultipleExercises = useCallback(
    async (exerciseIds: string[]) => {
      if (exerciseIds.length === 0) return
      setIsBatchAdding(true)
      
      // Add exercises sequentially to avoid race conditions
      for (const exerciseId of exerciseIds) {
        await new Promise<void>((resolve) => {
          addExercise(
            { dayId, exerciseBaseId: exerciseId },
            {
              onSettled: () => resolve(),
            },
          )
        })
      }
      
      setIsBatchAdding(false)
    },
    [addExercise, dayId],
  )

  const drawerContent = (
    <>
      <ExerciseListWithFilters
        exercises={allExercises}
        onSelectExercise={handleSelectExercise}
        onRemoveExercise={handleRemoveExercise}
        onAddMultipleExercises={handleAddMultipleExercises}
        isAdding={isAdding}
        isRemoving={isRemoving}
        isBatchAdding={isBatchAdding}
        isLoading={isLoading}
        addingExerciseId={addingExerciseId}
        removingExerciseId={removingExerciseId}
        addedExercises={addedExercises}
        scheduledAt={scheduledAt}
      />

      <Dialog
        open={!!exerciseToRemove}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setExerciseToRemove(null)
            setRemovingExerciseId(null)
          }
        }}
      >
        <DialogContent dialogTitle="Remove exercise?">
          <DialogHeader>
            <DialogTitle>Remove exercise?</DialogTitle>
            <DialogDescription>
              This exercise has logged sets. Removing it will delete all your
              workout data for this exercise.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-row gap-2">
            <DialogClose asChild>
              <Button variant="secondary" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmRemove}
              loading={isRemoving}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )

  if (variant === 'drawer-only') {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent
          dialogTitle="Build my own workout"
          className="max-h-[85vh]"
        >
          {drawerContent}
        </DrawerContent>
      </Drawer>
    )
  }

  if (variant === 'button') {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button size="lg" iconStart={<PlusIcon />} className="w-full">
            Add Exercise
          </Button>
        </DrawerTrigger>
        <DrawerContent
          dialogTitle="Add Single Exercise"
          className="max-h-[85vh]"
        >
          {drawerContent}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Card className="cursor-pointer transition-all hover:scale-[1.01]">
          <CardContent>
            <div className="flex items-center">
              <div className="p-2 mr-3 bg-card-on-card rounded-lg">
                <PlusIcon className="size-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg">Add Single Exercise</CardTitle>
                <CardDescription>Add one exercise at a time</CardDescription>
              </div>
              <Button variant="link" size="icon-sm" iconOnly={<PlusIcon />}>
                Add Exercise
              </Button>
            </div>
          </CardContent>
        </Card>
      </DrawerTrigger>
      <DrawerContent dialogTitle="Add Single Exercise" className="max-h-[85vh]">
        {drawerContent}
      </DrawerContent>
    </Drawer>
  )
}

function ExerciseListWithFilters({
  exercises,
  onSelectExercise,
  onRemoveExercise,
  onAddMultipleExercises,
  isAdding,
  isRemoving,
  isBatchAdding,
  isLoading,
  addingExerciseId,
  removingExerciseId,
  addedExercises,
  scheduledAt,
}: {
  exercises: Exercise[]
  onSelectExercise: (id: string) => void
  onRemoveExercise: (baseId: string) => void
  onAddMultipleExercises: (ids: string[]) => void
  isAdding: boolean
  isRemoving: boolean
  isBatchAdding: boolean
  isLoading: boolean
  addingExerciseId: string | null
  removingExerciseId: string | null
  addedExercises: Map<string, AddedExerciseInfo>
  scheduledAt?: string | null
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<HighLevelGroup | null>(
    null,
  )
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const { groupSummaries, isLoading: isLoadingProgress } =
    useWeeklyFocus(scheduledAt)

  const filteredExercises = useMemo(() => {
    let result = exercises

    if (selectedGroup) {
      const displayGroups = HIGH_LEVEL_TO_DISPLAY_GROUPS[selectedGroup]
      result = result.filter((exercise) =>
        exercise.muscleGroups?.some((mg) =>
          displayGroups.includes(mg.displayGroup),
        ),
      )
    }

    if (deferredSearchQuery.trim()) {
      const query = deferredSearchQuery.toLowerCase()
      result = result.filter((exercise) => {
        const nameMatch = exercise.name.toLowerCase().includes(query)
        const muscleGroupMatch = exercise.muscleGroups?.some((mg) =>
          mg.alias?.toLowerCase().includes(query),
        )
        return nameMatch || muscleGroupMatch
      })
    }

    return result
  }, [exercises, selectedGroup, deferredSearchQuery])

  return (
    <div className="flex-1 overflow-y-auto px-4 pb-4">
      <div className="space-y-4">
        <div className="space-y-1 pt-2">
          <h2 className="text-lg font-semibold">Build my own workout</h2>
          <p className="text-sm text-muted-foreground">
            Choose exercises and sets manually.
          </p>
        </div>

        <AiExerciseSuggestions
          onAddExercises={onAddMultipleExercises}
          isAddingExercises={isBatchAdding}
        />

        <WeeklyFocusChips
          groupSummaries={groupSummaries}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
          isLoading={isLoadingProgress}
        />

        <Input
          id="search-exercises"
          placeholder="Search by exercise or muscle group..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          iconStart={<SearchIcon />}
        />

        <div className="space-y-2">
          {isLoading ? (
            <LoadingSkeleton count={8} />
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchQuery || selectedGroup
                ? 'No exercises found'
                : 'No exercises available'}
            </div>
          ) : (
            filteredExercises.map((exercise) => {
              const isThisExerciseAdding = addingExerciseId === exercise.id
              const isThisExerciseRemoving = removingExerciseId === exercise.id
              const isAnyOperationPending = isAdding || isRemoving
              const isAlreadyAdded = addedExercises.has(exercise.id)

              const primaryDisplayGroup =
                exercise.muscleGroups?.[0]?.displayGroup
              const highLevelGroup = primaryDisplayGroup
                ? DISPLAY_GROUP_TO_HIGH_LEVEL[primaryDisplayGroup]
                : null

              const muscleAliases =
                exercise.muscleGroups
                  ?.map((mg) => mg.alias)
                  .filter((alias): alias is string => Boolean(alias)) || []

              const muscleDisplay = highLevelGroup
                ? `${highLevelGroup} · ${muscleAliases.join(', ')}`
                : muscleAliases.join(', ')

              return (
                <Card
                  key={exercise.id}
                  variant="secondary"
                  className={cn(
                    'p-0',
                    !isAlreadyAdded &&
                      'cursor-pointer transition-all hover:scale-[1.01]',
                  )}
                  onClick={() =>
                    !isAnyOperationPending &&
                    !isAlreadyAdded &&
                    onSelectExercise(exercise.id)
                  }
                >
                  <CardContent className="p-0 pr-2">
                    <div className="flex items-center gap-3">
                      {/* Wrapper to prevent click propagation on media preview */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <ExerciseMediaPreview
                          images={exercise.images}
                          videoUrl={exercise.videoUrl}
                          className="size-20 shrink-0"
                          hidePagination={true}
                          hideVideoOverlay={true}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base">
                          {exercise.name}
                        </CardTitle>
                        {muscleDisplay && (
                          <CardDescription className="truncate">
                            {muscleDisplay}
                          </CardDescription>
                        )}
                      </div>
                      {isAlreadyAdded ? (
                        <Button
                          size="icon-md"
                          variant="default"
                          iconOnly={<CheckIcon />}
                          onClick={(e) => {
                            e.stopPropagation()
                            onRemoveExercise(exercise.id)
                          }}
                          disabled={isAnyOperationPending}
                          loading={isThisExerciseRemoving}
                        >
                          Remove
                        </Button>
                      ) : (
                        <Button
                          size="icon-md"
                          variant="secondary"
                          iconOnly={<PlusIcon />}
                          onClick={(e) => {
                            e.stopPropagation()
                            onSelectExercise(exercise.id)
                          }}
                          disabled={isAnyOperationPending}
                          loading={isThisExerciseAdding}
                        >
                          Add
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
