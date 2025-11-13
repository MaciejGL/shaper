'use client'

import { useQueryClient } from '@tanstack/react-query'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { useCallback, useDeferredValue, useMemo, useState } from 'react'
import { Virtuoso } from 'react-virtuoso'

import { LoadingSkeleton } from '@/components/loading-skeleton'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import {
  type GQLFitspaceGetExercisesQuery,
  useFitspaceGetExercisesQuery,
  useGetFavouriteWorkoutQuery,
} from '@/generated/graphql-client'
import { useUpdateFavouriteWorkout } from '@/hooks/use-favourite-workouts'

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
  const [addingExerciseId, setAddingExerciseId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data: exercisesData, isLoading } = useFitspaceGetExercisesQuery()
  const { data: favouriteData } = useGetFavouriteWorkoutQuery({
    id: favouriteId,
  })

  const allExercises = useMemo(() => {
    const publicExercises = exercisesData?.getExercises?.publicExercises || []
    const trainerExercises = exercisesData?.getExercises?.trainerExercises || []

    // Deduplicate exercises by ID
    const exerciseMap = new Map<string, Exercise>()

    publicExercises.forEach((exercise) => {
      exerciseMap.set(exercise.id, exercise)
    })

    trainerExercises.forEach((exercise) => {
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

  const handleSelectExercise = useCallback(
    async (exerciseId: string, exerciseName: string) => {
      const currentExercises =
        favouriteData?.getFavouriteWorkout?.exercises || []

      // Check limit
      if (currentExercises.length >= MAX_EXERCISES) {
        console.warn('Maximum exercise limit reached')
        return
      }

      setAddingExerciseId(exerciseId)

      try {
        const maxOrder =
          currentExercises.length > 0
            ? Math.max(...currentExercises.map((ex) => ex.order))
            : 0

        // Add new exercise to existing ones
        const exercises = [
          ...currentExercises.map((ex) => ({
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
          })),
          {
            name: exerciseName,
            order: maxOrder + 1,
            baseId: exerciseId,
            restSeconds: null,
            instructions: null,
            sets: [
              {
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

        setAddingExerciseId(null)
        // Don't close drawer - let user add more exercises
      } catch (error) {
        console.error('Failed to add exercise:', error)
        setAddingExerciseId(null)
      }
    },
    [favouriteId, favouriteData, updateFavourite, queryClient],
  )

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent dialogTitle="Add Exercise" className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Add Exercise</DrawerTitle>
          <DrawerDescription>
            {canAddMore
              ? `Select an exercise to add to your template (${currentExerciseCount}/${MAX_EXERCISES})`
              : `Maximum limit reached (${MAX_EXERCISES} exercises)`}
          </DrawerDescription>
        </DrawerHeader>
        <ExerciseList
          exercises={allExercises}
          onSelectExercise={handleSelectExercise}
          isAdding={isAdding}
          isLoading={isLoading}
          addingExerciseId={addingExerciseId}
          addedExerciseIds={addedExerciseIds}
          canAddMore={canAddMore}
        />
      </DrawerContent>
    </Drawer>
  )
}

function ExerciseList({
  exercises,
  onSelectExercise,
  isAdding,
  isLoading,
  addingExerciseId,
  addedExerciseIds,
  canAddMore,
}: {
  exercises: Exercise[]
  onSelectExercise: (id: string, name: string) => void
  isAdding: boolean
  isLoading: boolean
  addingExerciseId: string | null
  addedExerciseIds: Set<string>
  canAddMore: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const filteredExercises = useMemo(() => {
    if (!deferredSearchQuery.trim()) return exercises

    const query = deferredSearchQuery.toLowerCase()
    return exercises.filter((exercise) => {
      const nameMatch = exercise.name.toLowerCase().includes(query)
      const muscleGroupMatch = exercise.muscleGroups?.some((mg) =>
        mg.alias?.toLowerCase().includes(query),
      )

      return nameMatch || muscleGroupMatch
    })
  }, [exercises, deferredSearchQuery])

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pb-3 pt-1 flex-shrink-0">
        <Input
          id="search-exercises"
          placeholder="Search by name or muscle group..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          iconStart={<SearchIcon />}
        />
      </div>

      <div className="flex-1 min-h-0">
        {isLoading && (
          <div className="px-4 pb-4 space-y-2">
            <LoadingSkeleton count={8} variant="sm" cardVariant="tertiary" />
          </div>
        )}
        {!isLoading && filteredExercises.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No exercises found' : 'No exercises available'}
          </div>
        )}
        {!isLoading && filteredExercises.length > 0 && (
          <Virtuoso
            data={filteredExercises}
            style={{ height: '100%' }}
            itemContent={(_index, exercise) => {
              const isThisExerciseAdding = addingExerciseId === exercise.id
              const isAnyExerciseAdding = isAdding
              const isAlreadyAdded = addedExerciseIds.has(exercise.id)
              const isDisabled = !canAddMore || isAlreadyAdded

              return (
                <Card
                  className={
                    isDisabled
                      ? 'opacity-60 cursor-not-allowed'
                      : 'cursor-pointer transition-all hover:scale-[1.01]'
                  }
                  onClick={() =>
                    !isAnyExerciseAdding &&
                    !isDisabled &&
                    onSelectExercise(exercise.id, exercise.name)
                  }
                >
                  <CardContent>
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-base">
                            {exercise.name}
                          </CardTitle>
                          {isAlreadyAdded && (
                            <Badge variant="secondary" size="sm">
                              Added
                            </Badge>
                          )}
                        </div>
                        {exercise.muscleGroups &&
                          exercise.muscleGroups.length > 0 && (
                            <CardDescription>
                              {exercise.muscleGroups
                                .map((mg) => mg.alias)
                                .filter((alias): alias is string =>
                                  Boolean(alias),
                                )
                                .join(', ')}
                            </CardDescription>
                          )}
                      </div>
                      <Button
                        size="icon-md"
                        variant="ghost"
                        iconOnly={<PlusIcon />}
                        onClick={(e) => {
                          e.stopPropagation()
                          if (!isDisabled) {
                            onSelectExercise(exercise.id, exercise.name)
                          }
                        }}
                        disabled={isAnyExerciseAdding || isDisabled}
                        loading={isThisExerciseAdding}
                      >
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            }}
            components={{
              List: (props) => (
                <div {...props} className="px-4 pb-4 space-y-2" />
              ),
            }}
          />
        )}
      </div>
    </div>
  )
}
