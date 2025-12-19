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
  useFitspaceGetExercisesQuery,
  useFitspaceGetWorkoutDayQuery,
} from '@/generated/graphql-client'
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

  const handleToggleExercise = useCallback((exerciseId: string) => {
    setSelectedExerciseIds((prev) => {
      const index = prev.indexOf(exerciseId)
      if (index > -1) {
        // Remove if already selected
        return prev.filter((id) => id !== exerciseId)
      } else {
        // Add to end if not selected
        return [...prev, exerciseId]
      }
    })
  }, [])

  const handleReorder = useCallback((newOrder: string[]) => {
    setSelectedExerciseIds(newOrder)
  }, [])

  const handleRemoveExercise = useCallback((exerciseId: string) => {
    setSelectedExerciseIds((prev) => prev.filter((id) => id !== exerciseId))
  }, [])

  const handleClearAll = useCallback(() => {
    setSelectedExerciseIds([])
  }, [])

  const handleReviewWorkout = useCallback(() => {
    if (selectedExerciseIds.length === 0) return
    setIsReviewMode(true)
  }, [selectedExerciseIds])

  const handleGoBack = useCallback(() => {
    setIsReviewMode(false)
  }, [])

  const handleStart = useCallback(async () => {
    if (selectedExerciseIds.length === 0) return
    setIsBatchAdding(true)

    try {
      // Add all exercises in one batch mutation maintaining order
      await addMultipleExercises({
        dayId,
        exerciseBaseIds: selectedExerciseIds,
      })

      // Invalidate queries once after all exercises are added
      await invalidateWorkoutQueries()

      setSelectedExerciseIds([])
      setIsReviewMode(false)
      setOpen(false)
    } catch (error) {
      console.error('Failed to add exercises:', error)
    } finally {
      setIsBatchAdding(false)
    }
  }, [
    selectedExerciseIds,
    addMultipleExercises,
    dayId,
    setOpen,
    invalidateWorkoutQueries,
  ])

  // Reset selection and review mode when drawer closes
  useEffect(() => {
    if (!open) {
      setSelectedExerciseIds([])
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
      <div>
        <div className="flex items-start justify-between gap-3 pt-2">
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

        <div className="my-6">
          <WeeklyFocusChips
            groupSummaries={groupSummaries}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
            isLoading={isLoadingProgress}
          />
        </div>

        <Input
          id="search-exercises"
          placeholder="Search by exercise or muscle group..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          iconStart={<SearchIcon />}
          className="mb-4"
        />

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground pt-1">
            {selectedGroup ? `${selectedGroup} exercises` : 'All exercises'}{' '}
            {!isLoading && `(${filteredExercises.length})`}
          </h3>
          {isLoading ? (
            <LoadingSkeleton count={8} />
          ) : filteredExercises.length === 0 ? (
            <div className="text-center py-8 space-y-1">
              <p className="text-muted-foreground">
                No exercises match this filter.
              </p>
              <p className="text-sm text-muted-foreground/70">
                Try a different muscle group or clear filters.
              </p>
            </div>
          ) : (
            filteredExercises.map((exercise) => {
              const isSelected = selectedExerciseIds.includes(exercise.id)

              const muscleDisplay = getExerciseMuscleDisplay(exercise)

              return (
                <SelectableExerciseItem
                  key={exercise.id}
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
                />
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
