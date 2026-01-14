'use client'

import { useQueryClient } from '@tanstack/react-query'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import {
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Virtuoso } from 'react-virtuoso'
import { toast } from 'sonner'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import {
  HIGH_LEVEL_TO_DISPLAY_GROUPS,
  type HighLevelGroup,
} from '@/config/muscles'
import {
  type GQLFitspaceGetExercisesQuery,
  useFitspaceAddMultipleExercisesToDayMutation,
  useFitspaceAddSetMutation,
  useFitspaceGetExercisesQuery,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceRemoveSetMutation,
} from '@/generated/graphql-client'
import { useCreateFavouriteWorkout } from '@/hooks/use-favourite-workouts'
import { queryInvalidation } from '@/lib/query-invalidation'

import { AiExerciseSuggestions } from './ai-exercise-suggestions'
import { ReviewExercises } from './review-exercises'
import { SelectableExerciseItem } from './selectable-exercise-item'
import { SelectedExercisesFooter } from './selected-exercises-footer'
import { useWeeklyFocus } from './use-weekly-focus'
import { getExerciseMuscleDisplay } from './utils'
import { WeeklyFocusChips } from './weekly-focus-chips'

type Exercise = NonNullable<
  NonNullable<GQLFitspaceGetExercisesQuery['getExercises']>['publicExercises']
>[number]

const DEFAULT_SET_COUNT = 3
const MIN_SET_COUNT = 1
const MAX_SET_COUNT = 8

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
  const setOpen = useMemo(
    () =>
      isControlled
        ? (value: boolean) => onOpenChange?.(value)
        : setInternalOpen,
    [isControlled, onOpenChange],
  )

  const [selectedExerciseIds, setSelectedExerciseIds] = useState<string[]>([])
  const [setCounts, setSetCounts] = useState<
    Record<string, number | undefined>
  >({})
  const [saveAsFavourite, setSaveAsFavourite] = useState(false)
  const [favouriteTitle, setFavouriteTitle] = useState('')
  const [favouriteDescription, setFavouriteDescription] = useState('')
  const [isBatchAdding, setIsBatchAdding] = useState(false)
  const [isReviewMode, setIsReviewMode] = useState(false)
  const [isReorderDragging, setIsReorderDragging] = useState(false)

  const queryClient = useQueryClient()
  const [dayIdFromUrl] = useQueryState('day')

  const { data: exercisesData, isLoading } = useFitspaceGetExercisesQuery()

  const invalidateWorkoutQueries = useCallback(async () => {
    await queryInvalidation.workoutAndPlans(queryClient)
    const queryKey = useFitspaceGetWorkoutDayQuery.getKey({
      dayId: dayIdFromUrl || dayId,
    })
    await queryClient.refetchQueries({ queryKey })
  }, [queryClient, dayIdFromUrl, dayId])

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

  const { mutateAsync: addMultipleExercises } =
    useFitspaceAddMultipleExercisesToDayMutation()

  const { mutateAsync: addSet } = useFitspaceAddSetMutation()
  const { mutateAsync: removeSet } = useFitspaceRemoveSetMutation()

  const { mutateAsync: createFavourite } = useCreateFavouriteWorkout()

  const clampSetCount = useCallback(
    (count: number) => Math.max(MIN_SET_COUNT, Math.min(MAX_SET_COUNT, count)),
    [],
  )

  const getDesiredSetCount = useCallback(
    (exerciseId: string) =>
      clampSetCount(setCounts[exerciseId] ?? DEFAULT_SET_COUNT),
    [clampSetCount, setCounts],
  )

  const handleToggleExercise = useCallback((exerciseId: string) => {
    setSelectedExerciseIds((prev) => {
      const isSelected = prev.includes(exerciseId)

      setSetCounts((prevCounts) => {
        const next = { ...prevCounts }
        if (isSelected) {
          delete next[exerciseId]
        } else if (next[exerciseId] === undefined) {
          next[exerciseId] = DEFAULT_SET_COUNT
        }
        return next
      })

      return isSelected
        ? prev.filter((id) => id !== exerciseId)
        : [...prev, exerciseId]
    })
  }, [])

  const handleReorder = useCallback((newOrder: string[]) => {
    setSelectedExerciseIds(newOrder)
  }, [])

  const handleRemoveExercise = useCallback((exerciseId: string) => {
    setSelectedExerciseIds((prev) => prev.filter((id) => id !== exerciseId))
    setSetCounts((prev) => {
      const next = { ...prev }
      delete next[exerciseId]
      return next
    })
  }, [])

  const handleClearAll = useCallback(() => {
    setSelectedExerciseIds([])
    setSetCounts({})
  }, [])

  const handleReviewWorkout = useCallback(() => {
    if (selectedExerciseIds.length === 0) return
    setIsReviewMode(true)
  }, [selectedExerciseIds])

  const handleGoBack = useCallback(() => {
    setIsReviewMode(false)
  }, [])

  const handleSetCountChange = useCallback(
    (exerciseId: string, nextCount: number) => {
      setSetCounts((prev) => ({
        ...prev,
        [exerciseId]: clampSetCount(nextCount),
      }))
    },
    [clampSetCount],
  )

  const handleStart = useCallback(async () => {
    if (selectedExerciseIds.length === 0) return
    setIsBatchAdding(true)

    try {
      const exercisesMap = new Map(allExercises.map((ex) => [ex.id, ex]))

      if (saveAsFavourite && favouriteTitle.trim()) {
        try {
          const favouriteExercises = selectedExerciseIds.map(
            (exerciseId, idx) => {
              const ex = exercisesMap.get(exerciseId)
              const desiredSetCount = getDesiredSetCount(exerciseId)
              return {
                name: ex?.name ?? 'Exercise',
                order: idx + 1,
                baseId: exerciseId,
                restSeconds: null,
                description: ex?.description ?? null,
                additionalInstructions: null,
                instructions: ex?.instructions ?? [],
                tips: ex?.tips ?? [],
                difficulty: ex?.difficulty ?? null,
                sets: Array.from(
                  { length: desiredSetCount },
                  (_v, setIndex) => ({
                    order: setIndex + 1,
                    reps: null,
                    minReps: null,
                    maxReps: null,
                    weight: null,
                    rpe: null,
                  }),
                ),
              }
            },
          )

          await createFavourite({
            input: {
              title: favouriteTitle.trim(),
              description: favouriteDescription.trim() || null,
              folderId: null,
              exercises: favouriteExercises,
            },
          })
        } catch (error) {
          console.error('Failed to save favourite workout:', error)
          toast.error('Failed to save favourite workout. Starting anyway.')
        }
      }

      // Add all exercises in one batch mutation maintaining order
      const createdExercises = await addMultipleExercises({
        dayId,
        exerciseBaseIds: selectedExerciseIds,
      })

      // Reconcile desired set counts per created exercise
      try {
        for (const created of createdExercises.addMultipleExercisesToDay ??
          []) {
          const baseId = created.baseId
          if (!baseId) continue
          const desiredSetCount = getDesiredSetCount(baseId)

          const currentSets = [...(created.sets ?? [])].sort(
            (a, b) => a.order - b.order,
          )
          const currentCount = currentSets.length

          if (desiredSetCount > currentCount) {
            for (let i = 0; i < desiredSetCount - currentCount; i++) {
              await addSet({ exerciseId: created.id })
            }
          } else if (desiredSetCount < currentCount) {
            const toRemove = currentSets
              .slice(desiredSetCount)
              .reverse()
              .map((s) => s.id)
            for (const setId of toRemove) {
              await removeSet({ setId })
            }
          }
        }
      } catch (error) {
        console.error('Failed to apply set counts:', error)
        toast.error('Failed to apply set counts. Starting anyway.')
      }

      // Invalidate queries once after all exercises are added
      await invalidateWorkoutQueries()

      setSelectedExerciseIds([])
      setSetCounts({})
      setSaveAsFavourite(false)
      setFavouriteTitle('')
      setFavouriteDescription('')
      setIsReviewMode(false)
      setOpen(false)
    } catch (error) {
      console.error('Failed to add exercises:', error)
    } finally {
      setIsBatchAdding(false)
    }
  }, [
    selectedExerciseIds,
    allExercises,
    addMultipleExercises,
    addSet,
    removeSet,
    dayId,
    setOpen,
    invalidateWorkoutQueries,
    saveAsFavourite,
    favouriteTitle,
    favouriteDescription,
    createFavourite,
    getDesiredSetCount,
  ])

  // Reset selection and review mode when drawer closes
  useEffect(() => {
    if (!open) {
      setSelectedExerciseIds([])
      setSetCounts({})
      setSaveAsFavourite(false)
      setFavouriteTitle('')
      setFavouriteDescription('')
      setIsReviewMode(false)
      setIsReorderDragging(false)
    }
  }, [open])

  const drawerContent = isReviewMode ? (
    <ReviewExercises
      selectedExerciseIds={selectedExerciseIds}
      exercises={allExercises}
      onReorder={handleReorder}
      onRemove={handleRemoveExercise}
      setCounts={setCounts}
      onSetCountChange={handleSetCountChange}
      saveAsFavourite={saveAsFavourite}
      onSaveAsFavouriteChange={setSaveAsFavourite}
      favouriteTitle={favouriteTitle}
      onFavouriteTitleChange={setFavouriteTitle}
      favouriteDescription={favouriteDescription}
      onFavouriteDescriptionChange={setFavouriteDescription}
      onGoBack={handleGoBack}
      onStart={handleStart}
      isAdding={isBatchAdding}
      onDraggingChange={setIsReorderDragging}
    />
  ) : (
    <>
      <ExerciseListWithFilters
        exercises={allExercises}
        selectedExerciseIds={selectedExerciseIds}
        onToggleExercise={handleToggleExercise}
        isLoading={isLoading}
        scheduledAt={scheduledAt}
      />

      <SelectedExercisesFooter
        selectedCount={selectedExerciseIds.length}
        onClearAll={handleClearAll}
        onReview={handleReviewWorkout}
      />
    </>
  )

  if (variant === 'drawer-only') {
    return (
      <Drawer
        open={open}
        onOpenChange={setOpen}
        dismissible={!isReorderDragging}
      >
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
      <Drawer
        open={open}
        onOpenChange={setOpen}
        dismissible={!isReorderDragging}
      >
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
    <Drawer open={open} onOpenChange={setOpen} dismissible={!isReorderDragging}>
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
  selectedExerciseIds,
  onToggleExercise,
  isLoading,
  scheduledAt,
}: {
  exercises: Exercise[]
  selectedExerciseIds: string[]
  onToggleExercise: (id: string) => void
  isLoading: boolean
  scheduledAt?: string | null
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<HighLevelGroup | null>(
    null,
  )
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const selectedExerciseIdSet = useMemo(
    () => new Set(selectedExerciseIds),
    [selectedExerciseIds],
  )
  const [scrollParent, setScrollParent] = useState<HTMLDivElement | null>(null)
  const setScrollParentRef = useCallback((el: HTMLDivElement | null) => {
    if (el) setScrollParent(el)
  }, [])

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

  const headerContent = (
    <div className="px-4 pb-4 pt-2">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold">Build your workout</h2>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
              Today
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Pick exercises for today's session.
          </p>
        </div>
      </div>

      <div className="my-6">
        <AiExerciseSuggestions
          allExercises={exercises}
          selectedExerciseIds={selectedExerciseIds}
          onToggleExercise={onToggleExercise}
        />
      </div>

      <div className="mt-6">
        <WeeklyFocusChips
          groupSummaries={groupSummaries}
          selectedGroup={selectedGroup}
          onSelectGroup={setSelectedGroup}
          isLoading={isLoadingProgress}
        />
      </div>

      <div className="pt-6">
        <Input
          id="search-exercises"
          placeholder="Search exercises name or muscle group..."
          value={searchQuery}
          variant="secondary"
          size="lg"
          onChange={(e) => setSearchQuery(e.target.value)}
          iconStart={<SearchIcon />}
        />
      </div>

      <h3 className="text-sm font-medium text-muted-foreground pt-4">
        {selectedGroup ? `${selectedGroup} exercises` : 'All exercises'}{' '}
        {!isLoading && `(${filteredExercises.length})`}
      </h3>
    </div>
  )

  return (
    <div className="flex-1 min-h-0">
      <div ref={setScrollParentRef} className="h-full overflow-y-auto">
        {headerContent}

        {isLoading ? (
          <div className="px-4 pb-4 space-y-2">
            <LoadingSkeleton count={8} />
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="px-4 pb-4">
            <div className="text-center py-8 space-y-1">
              <p className="text-muted-foreground">
                No exercises match this filter.
              </p>
              <p className="text-sm text-muted-foreground/70">
                Try a different muscle group or clear filters.
              </p>
            </div>
          </div>
        ) : scrollParent ? (
          <Virtuoso
            data={filteredExercises}
            customScrollParent={scrollParent}
            computeItemKey={(_index, exercise) => exercise.id}
            itemContent={(_index, exercise) => {
              const isSelected = selectedExerciseIdSet.has(exercise.id)
              const muscleDisplay = getExerciseMuscleDisplay(exercise)

              return (
                <div className="px-4 pb-2">
                  <SelectableExerciseItem
                    id={exercise.id}
                    name={exercise.name}
                    muscleDisplay={muscleDisplay}
                    images={
                      exercise.images as
                        | ({ medium?: string | null } | null)[]
                        | null
                    }
                    videoUrl={exercise.videoUrl}
                    isSelected={isSelected}
                    onToggle={onToggleExercise}
                    detailExercise={exercise}
                  />
                </div>
              )
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
