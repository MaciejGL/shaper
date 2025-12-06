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
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import {
  DISPLAY_GROUP_TO_HIGH_LEVEL,
  HIGH_LEVEL_TO_DISPLAY_GROUPS,
  type HighLevelGroup,
} from '@/constants/muscles'
import {
  type GQLFitspaceGetExercisesQuery,
  useFitspaceAddSingleExerciseToDayMutation,
  useFitspaceGetExercisesQuery,
  useFitspaceGetWorkoutDayQuery,
} from '@/generated/graphql-client'
import { queryInvalidation } from '@/lib/query-invalidation'

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
  const queryClient = useQueryClient()
  const router = useRouter()
  const [dayIdFromUrl] = useQueryState('day')

  const { data: exercisesData, isLoading } = useFitspaceGetExercisesQuery()

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
      onSuccess: async () => {
        await queryInvalidation.workoutAndPlans(queryClient)

        const queryKeyToInvalidate = useFitspaceGetWorkoutDayQuery.getKey({
          dayId: dayIdFromUrl || dayId,
        })
        await queryClient.refetchQueries({
          queryKey: queryKeyToInvalidate,
        })

        setAddingExerciseId(null)
        setOpen(false)
        router.refresh()
      },
      onError: () => {
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

  const drawerContent = (
    <ExerciseListWithFilters
      exercises={allExercises}
      onSelectExercise={handleSelectExercise}
      isAdding={isAdding}
      isLoading={isLoading}
      addingExerciseId={addingExerciseId}
      scheduledAt={scheduledAt}
    />
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
            Add Single Exercise
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
  isAdding,
  isLoading,
  addingExerciseId,
  scheduledAt,
}: {
  exercises: Exercise[]
  onSelectExercise: (id: string) => void
  isAdding: boolean
  isLoading: boolean
  addingExerciseId: string | null
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
              const isAnyExerciseAdding = isAdding

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
                        {muscleDisplay && (
                          <CardDescription>{muscleDisplay}</CardDescription>
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
    </div>
  )
}

