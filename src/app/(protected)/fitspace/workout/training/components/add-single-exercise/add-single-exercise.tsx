'use client'

import { useQueryClient } from '@tanstack/react-query'
import { PlusIcon } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
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

import {
  AiExerciseSuggestionsPanel,
  AiExerciseSuggestionsProvider,
  AiExerciseSuggestionsTrigger,
} from './ai-exercise-suggestions'
import { ExerciseListWithFilters } from './exercise-list-with-filters'
import { ReviewExercises } from './review-exercises'
import { SelectedExercisesFooter } from './selected-exercises-footer'
import { useWeeklyFocus } from './use-weekly-focus'

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

  const weeklyFocus = useWeeklyFocus(scheduledAt)

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
    const userExercises = exercisesData?.getExercises?.userExercises || []

    const exerciseMap = new Map<string, Exercise>()

    publicExercises.forEach((exercise) => {
      exerciseMap.set(exercise.id, exercise)
    })

    trainerExercises.forEach((exercise) => {
      exerciseMap.set(exercise.id, exercise)
    })

    userExercises.forEach((exercise) => {
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
      <AiExerciseSuggestionsProvider
        allExercises={allExercises}
        selectedExerciseIds={selectedExerciseIds}
        onToggleExercise={handleToggleExercise}
      >
        <ExerciseListWithFilters
          exercises={allExercises}
          selectedExerciseIds={selectedExerciseIds}
          onToggleExercise={handleToggleExercise}
          isLoading={isLoading}
          categories={exercisesData?.muscleGroupCategories}
          suggestionsTrigger={<AiExerciseSuggestionsTrigger />}
          suggestionsPanel={<AiExerciseSuggestionsPanel />}
          muscleFilterMode="weeklyFocus"
          weeklyFocus={weeklyFocus}
        />
      </AiExerciseSuggestionsProvider>

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
        direction="right"
      >
        <DrawerContent
          dialogTitle="Build my own workout"
          className="data-[vaul-drawer-direction=right]:max-w-screen data-[vaul-drawer-direction=right]:w-screen overflow-hidden data-[vaul-drawer-direction=right]:border-l-0"
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
        direction="right"
      >
        <DrawerTrigger asChild>
          <Button size="lg" iconStart={<PlusIcon />} className="w-full">
            Add Exercise
          </Button>
        </DrawerTrigger>
        <DrawerContent
          dialogTitle="Add Single Exercise"
          className="data-[vaul-drawer-direction=right]:max-w-screen data-[vaul-drawer-direction=right]:w-screen overflow-hidden data-[vaul-drawer-direction=right]:border-l-0"
        >
          {drawerContent}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={setOpen}
      dismissible={!isReorderDragging}
      direction="right"
    >
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
      <DrawerContent
        dialogTitle="Add Single Exercise"
        className="data-[vaul-drawer-direction=right]:max-w-screen data-[vaul-drawer-direction=right]:w-screen overflow-hidden data-[vaul-drawer-direction=right]:border-l-0"
      >
        {drawerContent}
      </DrawerContent>
    </Drawer>
  )
}
