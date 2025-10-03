'use client'

import { useQueryClient } from '@tanstack/react-query'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { useCallback, useDeferredValue, useMemo, useState } from 'react'

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

  const handleSelectExercise = useCallback(
    async (exerciseId: string, exerciseName: string) => {
      setAddingExerciseId(exerciseId)

      try {
        const currentExercises =
          favouriteData?.getFavouriteWorkout?.exercises || []
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
        onClose()
      } catch (error) {
        console.error('Failed to add exercise:', error)
        setAddingExerciseId(null)
      }
    },
    [favouriteId, favouriteData, updateFavourite, queryClient, onClose],
  )

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent dialogTitle="Add Exercise" className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>Add Exercise</DrawerTitle>
          <DrawerDescription>
            Select an exercise to add to your template
          </DrawerDescription>
        </DrawerHeader>
        <ExerciseList
          exercises={allExercises}
          onSelectExercise={handleSelectExercise}
          isAdding={isAdding}
          isLoading={isLoading}
          addingExerciseId={addingExerciseId}
          addedExerciseIds={addedExerciseIds}
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
}: {
  exercises: Exercise[]
  onSelectExercise: (id: string, name: string) => void
  isAdding: boolean
  isLoading: boolean
  addingExerciseId: string | null
  addedExerciseIds: Set<string>
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
    <div className="flex flex-col overflow-hidden">
      <div className="px-4 pb-3 pt-1">
        <Input
          id="search-exercises"
          placeholder="Search by name or muscle group..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          iconStart={<SearchIcon />}
        />
      </div>

      <div className="px-4 pb-4 overflow-y-auto space-y-2">
        {isLoading ? (
          <LoadingSkeleton count={8} />
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchQuery ? 'No exercises found' : 'No exercises available'}
          </div>
        ) : (
          filteredExercises.map((exercise) => {
            const isThisExerciseAdding = addingExerciseId === exercise.id
            const isAnyExerciseAdding = isAdding
            const isAlreadyAdded = addedExerciseIds.has(exercise.id)

            return (
              <Card
                key={exercise.id}
                variant="tertiary"
                borderless
                className={
                  isAlreadyAdded
                    ? 'opacity-60 cursor-not-allowed'
                    : 'cursor-pointer transition-all hover:scale-[1.01]'
                }
                onClick={() =>
                  !isAnyExerciseAdding &&
                  !isAlreadyAdded &&
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
                        if (!isAlreadyAdded) {
                          onSelectExercise(exercise.id, exercise.name)
                        }
                      }}
                      disabled={isAnyExerciseAdding || isAlreadyAdded}
                      loading={isThisExerciseAdding}
                    >
                      Add
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
