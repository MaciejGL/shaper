'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useCallback, useMemo, useState } from 'react'

import { ExerciseListWithFilters } from '@/app/(protected)/fitspace/workout/training/components/add-single-exercise/exercise-list-with-filters'
import { SelectableExerciseItem } from '@/app/(protected)/fitspace/workout/training/components/add-single-exercise/selectable-exercise-item'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import {
  type GQLFitspaceGetExercisesQuery,
  useFitspaceGetExercisesQuery,
  useGetFavouriteWorkoutQuery,
} from '@/generated/graphql-client'
import { useUpdateFavouriteWorkout } from '@/hooks/use-favourite-workouts'
import { cn } from '@/lib/utils'

type Exercise = NonNullable<
  NonNullable<GQLFitspaceGetExercisesQuery['getExercises']>['publicExercises']
>[number]

interface AddExerciseToFavouriteDrawerProps {
  open: boolean
  onClose: () => void
  favouriteId: string
}

export function AddExerciseToFavouriteDrawer({
  open,
  onClose,
  favouriteId,
}: AddExerciseToFavouriteDrawerProps) {
  const [mutatingExerciseId, setMutatingExerciseId] = useState<string | null>(
    null,
  )
  const queryClient = useQueryClient()

  const { data: exercisesData, isLoading } = useFitspaceGetExercisesQuery()
  const { data: favouriteData } = useGetFavouriteWorkoutQuery({
    id: favouriteId,
  })

  const allExercises = useMemo(() => {
    const publicExercises = exercisesData?.getExercises?.publicExercises || []
    const trainerExercises = exercisesData?.getExercises?.trainerExercises || []
    const userExercises = exercisesData?.getExercises?.userExercises || []

    // Deduplicate exercises by ID
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

  // Get set of already added exercise IDs
  const addedExerciseIds = useMemo(() => {
    const currentExercises = favouriteData?.getFavouriteWorkout?.exercises || []
    return new Set(
      currentExercises
        .map((ex) => ex.baseId)
        .filter((id): id is string => !!id),
    )
  }, [favouriteData])

  const { mutateAsync: updateFavourite, isPending: isAdding } =
    useUpdateFavouriteWorkout()

  const MAX_EXERCISES = 12

  const currentExerciseCount =
    favouriteData?.getFavouriteWorkout?.exercises?.length || 0
  const canAddMore = currentExerciseCount < MAX_EXERCISES

  const selectedExerciseIds = useMemo(
    () => Array.from(addedExerciseIds),
    [addedExerciseIds],
  )

  const handleToggleExercise = useCallback(
    async (exerciseId: string, exerciseName: string) => {
      const currentExercises =
        favouriteData?.getFavouriteWorkout?.exercises || []

      const isAlreadyAdded = currentExercises.some(
        (ex) => ex.baseId === exerciseId,
      )
      setMutatingExerciseId(exerciseId)

      try {
        if (!isAlreadyAdded && currentExercises.length >= MAX_EXERCISES) return

        const nextExercises = isAlreadyAdded
          ? currentExercises.filter((ex) => ex.baseId !== exerciseId)
          : [
              ...currentExercises,
              {
                id: 'temp',
                name: exerciseName,
                order:
                  currentExercises.length > 0
                    ? Math.max(...currentExercises.map((ex) => ex.order)) + 1
                    : 1,
                baseId: exerciseId,
                favouriteWorkoutId: favouriteId,
                restSeconds: null,
                instructions: [],
                sets: [
                  {
                    id: 'temp',
                    order: 1,
                    reps: null,
                    minReps: null,
                    maxReps: null,
                    weight: null,
                    rpe: null,
                  },
                ],
              },
            ]

        const exercises = nextExercises.map((ex) => ({
          name: ex.name,
          order: ex.order,
          baseId: ex.baseId || undefined,
          restSeconds: ex.restSeconds || null,
          instructions: ex.instructions || [],
          sets: ex.sets.map((set) => ({
            order: set.order,
            reps: set.reps || null,
            minReps: set.minReps || null,
            maxReps: set.maxReps || null,
            weight: set.weight || null,
            rpe: set.rpe || null,
          })),
        }))

        await updateFavourite({
          input: {
            id: favouriteId,
            exercises,
          },
        })

        // Invalidate queries
        await queryClient.invalidateQueries({
          queryKey: ['GetFavouriteWorkouts'],
        })
        await queryClient.invalidateQueries({
          queryKey: ['GetFavouriteWorkout', { id: favouriteId }],
        })
      } catch (error) {
        console.error('Failed to toggle exercise:', error)
      } finally {
        setMutatingExerciseId(null)
      }
    },
    [favouriteId, favouriteData, updateFavourite, queryClient],
  )

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent dialogTitle="Add Exercise" className="max-h-[85vh] h-full">
        <div className="overflow-y-auto">
          <DrawerHeader>
            <DrawerTitle>Add Exercise</DrawerTitle>
            <DrawerDescription>
              {canAddMore
                ? `Select an exercise to add to your template (${currentExerciseCount}/${MAX_EXERCISES})`
                : `Maximum limit reached (${MAX_EXERCISES} exercises)`}
            </DrawerDescription>
          </DrawerHeader>
          <ExerciseListWithFilters
            title={false}
            exercises={allExercises}
            selectedExerciseIds={selectedExerciseIds}
            onToggleExercise={(exerciseId) => {
              const exercise = allExercises.find((ex) => ex.id === exerciseId)
              if (!exercise) return
              void handleToggleExercise(exerciseId, exercise.name)
            }}
            isLoading={isLoading}
            categories={exercisesData?.muscleGroupCategories}
            subtitle=""
            muscleFilterMode="simple"
            renderItem={(exercise, isSelected) => (
              <SelectableExerciseRow
                exercise={exercise as Exercise}
                isSelected={isSelected}
                isAdding={isAdding}
                mutatingExerciseId={mutatingExerciseId}
                addedExerciseIds={addedExerciseIds}
                canAddMore={canAddMore}
                onToggle={(id, name) => void handleToggleExercise(id, name)}
              />
            )}
          />
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function SelectableExerciseRow({
  exercise,
  isSelected,
  isAdding,
  mutatingExerciseId,
  addedExerciseIds,
  canAddMore,
  onToggle,
}: {
  exercise: Exercise
  isSelected: boolean
  isAdding: boolean
  mutatingExerciseId: string | null
  addedExerciseIds: Set<string>
  canAddMore: boolean
  onToggle: (id: string, name: string) => void
}) {
  const isThisExerciseMutating = mutatingExerciseId === exercise.id
  const isAlreadyAdded = addedExerciseIds.has(exercise.id)
  const isDisabled =
    isAdding || isThisExerciseMutating || (!canAddMore && !isAlreadyAdded)

  return (
    <div className={cn(isDisabled && 'pointer-events-none')}>
      <SelectableExerciseItem
        id={exercise.id}
        name={exercise.name}
        muscleDisplay={exercise.muscleGroups
          ?.map((mg) => mg.alias)
          .filter((alias): alias is string => Boolean(alias))
          .join(', ')}
        images={exercise.images as ({ medium?: string | null } | null)[] | null}
        videoUrl={exercise.videoUrl}
        isSelected={isSelected}
        onToggle={(id) => onToggle(id, exercise.name)}
        disabled={isDisabled}
        detailExercise={exercise}
      />
      {isThisExerciseMutating ? (
        <div className="sr-only" aria-live="polite">
          Updating {exercise.name}
        </div>
      ) : null}
    </div>
  )
}
