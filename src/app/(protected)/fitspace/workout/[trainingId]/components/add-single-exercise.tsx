'use client'

import { useQueryClient } from '@tanstack/react-query'
import { PlusIcon, SearchIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useCallback, useDeferredValue, useMemo, useState } from 'react'

import { LoadingSkeleton } from '@/components/loading-skeleton'
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
  DrawerTrigger,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import {
  type GQLFitspaceGetExercisesQuery,
  useFitspaceAddSingleExerciseToDayMutation,
  useFitspaceGetExercisesQuery,
  useFitspaceGetWorkoutDayQuery,
} from '@/generated/graphql-client'

type Exercise = NonNullable<
  NonNullable<GQLFitspaceGetExercisesQuery['getExercises']>['publicExercises']
>[number]

interface AddSingleExerciseProps {
  dayId: string
  variant?: 'card' | 'button'
}

export function AddSingleExercise({
  dayId,
  variant = 'card',
}: AddSingleExerciseProps) {
  const [open, setOpen] = useState(false)
  const [addingExerciseId, setAddingExerciseId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const router = useRouter()
  const [dayIdFromUrl] = useQueryState('day')

  const { data: exercisesData, isLoading } = useFitspaceGetExercisesQuery()

  const allExercises = useMemo(() => {
    const publicExercises = exercisesData?.getExercises?.publicExercises || []
    const trainerExercises = exercisesData?.getExercises?.trainerExercises || []

    // Deduplicate exercises by ID (same exercise might appear in both arrays)
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
      onSuccess: async () => {
        // Invalidate the ACTUAL query that the component uses
        const queryKeyToInvalidate = useFitspaceGetWorkoutDayQuery.getKey({
          dayId: dayIdFromUrl || dayId,
        })

        // Invalidate queries to refresh the data
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: queryKeyToInvalidate }),
          queryClient.invalidateQueries({ queryKey: ['navigation'] }),
          queryClient.invalidateQueries({
            queryKey: ['FitspaceGetQuickWorkoutNavigation'],
          }),
          queryClient.invalidateQueries({ queryKey: ['GetQuickWorkoutPlan'] }),
        ])

        // Refetch the day query to ensure fresh data
        await queryClient.refetchQueries({
          queryKey: queryKeyToInvalidate,
        })

        // Close the drawer and refresh
        setAddingExerciseId(null)
        setOpen(false)
        router.refresh()
      },
      onError: () => {
        // Reset adding state on error
        setAddingExerciseId(null)
      },
    })

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

  if (variant === 'button') {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button
            variant="secondary"
            size="md"
            iconStart={<PlusIcon />}
            className="w-full"
          >
            Add Single Exercise
          </Button>
        </DrawerTrigger>
        <DrawerContent
          dialogTitle="Add Single Exercise"
          className="max-h-[85vh]"
        >
          <DrawerHeader>
            <DrawerTitle>Add Single Exercise</DrawerTitle>
            <DrawerDescription>
              Select an exercise to add to your workout
            </DrawerDescription>
          </DrawerHeader>
          <ExerciseList
            exercises={allExercises}
            onSelectExercise={handleSelectExercise}
            isAdding={isAdding}
            isLoading={isLoading}
            addingExerciseId={addingExerciseId}
          />
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Card
          borderless
          className="cursor-pointer transition-all hover:scale-[1.01]"
        >
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
        <DrawerHeader>
          <DrawerTitle>Add Single Exercise</DrawerTitle>
          <DrawerDescription>
            Select an exercise to add to your workout
          </DrawerDescription>
        </DrawerHeader>
        <ExerciseList
          exercises={allExercises}
          onSelectExercise={handleSelectExercise}
          isAdding={isAdding}
          isLoading={isLoading}
          addingExerciseId={addingExerciseId}
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
}: {
  exercises: Exercise[]
  onSelectExercise: (id: string) => void
  isAdding: boolean
  isLoading: boolean
  addingExerciseId: string | null
}) {
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)

  const filteredExercises = useMemo(() => {
    if (!deferredSearchQuery.trim()) return exercises

    const query = deferredSearchQuery.toLowerCase()
    return exercises.filter((exercise) => {
      // Search by exercise name
      const nameMatch = exercise.name.toLowerCase().includes(query)

      // Search by muscle groups
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

            return (
              <Card
                key={exercise.id}
                variant="tertiary"
                borderless
                className="cursor-pointer transition-all hover:scale-[1.01]"
                onClick={() =>
                  !isAnyExerciseAdding && onSelectExercise(exercise.id)
                }
              >
                <CardContent>
                  <div className="flex items-center">
                    <div className="flex-1">
                      <CardTitle className="text-base">
                        {exercise.name}
                      </CardTitle>
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
                        onSelectExercise(exercise.id)
                      }}
                      disabled={isAnyExerciseAdding}
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
