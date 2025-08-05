import { useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheckIcon,
  Check,
  CheckIcon,
  ChevronDown,
  FlameIcon,
  GaugeIcon,
  InfoIcon,
  ListChecksIcon,
  MoreHorizontalIcon,
  NotebookPenIcon,
  PlusIcon,
  Replace,
  TrashIcon,
  XIcon,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { AnimateChangeInHeight } from '@/components/animations/animated-height-change'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import {
  Drawer,
  DrawerTrigger,
  SimpleDrawerContent,
} from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { VideoPreview } from '@/components/video-preview'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  GQLExerciseType,
  GQLFitspaceGetWorkoutQuery,
  useFitspaceAddSetMutation,
  useFitspaceGetWorkoutQuery,
  useFitspaceMarkExerciseAsCompletedMutation,
  useFitspaceMarkSetAsCompletedMutation,
  useFitspaceRemoveExerciseFromWorkoutMutation,
  useFitspaceRemoveSetMutation,
  useFitspaceUpdateSetLogMutation,
} from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { ExerciseNotes, useExerciseNotesCount } from './exercise-notes'
import { ExerciseWeightInput } from './exercise-weight-input'
import { createOptimisticSetUpdate } from './simple-exercise-list/optimistic-updates'
import { WorkoutExercise } from './workout-page.client'

interface ExerciseProps {
  exercise: WorkoutExercise
  exercises: WorkoutExercise[]
  onPaginationClick: (exerciseId: string, type: 'prev' | 'next') => void
}

export function Exercise({
  exercise,
  exercises,
  onPaginationClick,
}: ExerciseProps) {
  const { getPastLogs } = useWorkout()
  const previousLogs = getPastLogs(exercise)
  const invalidateQuery = useInvalidateQuery()
  const { trainingId } = useParams<{ trainingId: string }>()
  const { mutateAsync: markExerciseAsCompleted } =
    useFitspaceMarkExerciseAsCompletedMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({
            trainingId: trainingId,
          }),
        })
      },
    })

  const { mutateAsync: removeExercise, isPending: isRemoving } =
    useFitspaceRemoveExerciseFromWorkoutMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({
            trainingId: trainingId,
          }),
        })
      },
    })
  const [isExerciseCompleted, setIsExerciseCompleted] = useState(
    Boolean(exercise.completedAt),
  )

  useEffect(() => {
    setIsExerciseCompleted(Boolean(exercise.completedAt))
  }, [exercise.completedAt])

  const handleMarkAsCompleted = async (checked: boolean) => {
    setIsExerciseCompleted(checked)
    try {
      await markExerciseAsCompleted({
        exerciseId: exercise.id,
        completed: checked,
      })
    } catch (error) {
      setIsExerciseCompleted(!checked)
    }
  }

  const handleRemoveExercise = async () => {
    await removeExercise({
      exerciseId: exercise.id,
    })
    const nextExercise = exercises.find((e) => e.order > exercise.order)
    if (nextExercise) {
      onPaginationClick(nextExercise.id, 'next')
    } else {
      const prevExercise = exercises.find((e) => e.order === exercise.order - 1)
      if (prevExercise) {
        onPaginationClick(prevExercise.id, 'prev')
      } else {
        onPaginationClick('summary', 'next')
      }
    }
  }

  return (
    <div>
      <ExerciseHeader
        exercise={exercise}
        exercises={exercises}
        onPaginationClick={onPaginationClick}
      />

      <Card className="px-2 mt-4">
        <ExerciseMetadata
          exercise={exercise}
          handleMarkAsCompleted={handleMarkAsCompleted}
          isCompleted={isExerciseCompleted}
          handleRemoveExercise={handleRemoveExercise}
          isRemoving={isRemoving}
        />
        <ExerciseSets
          exercise={exercise}
          previousLogs={previousLogs}
          isExerciseCompleted={isExerciseCompleted}
        />
      </Card>
    </div>
  )
}

function ExerciseHeader({
  exercise,
  exercises,
  onPaginationClick,
}: {
  exercise: WorkoutExercise
  exercises: WorkoutExercise[]
  onPaginationClick: (exerciseId: string, type: 'prev' | 'next') => void
}) {
  const [activeExerciseId, setActiveExerciseId] = useQueryState('exercise')

  const isSuperset =
    exercise.type === GQLExerciseType.Superset_1A ||
    exercise.type === GQLExerciseType.Superset_1B

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <ExerciseSelector
          exercise={exercise}
          activeExerciseId={activeExerciseId}
          setActiveExerciseId={setActiveExerciseId}
        />
      </div>
      {isSuperset && (
        <div className="mt-2">
          <SupersetsNavigation
            exercise={exercise}
            exercises={exercises}
            onPaginationClick={onPaginationClick}
          />
        </div>
      )}
    </div>
  )
}

export function ExerciseSelector({
  exercise,
  activeExerciseId,
  setActiveExerciseId,
  className,
}: {
  exercise?: WorkoutExercise
  activeExerciseId?: string | null
  setActiveExerciseId: (exerciseId: string) => void
  className?: string
}) {
  const { activeDay } = useWorkout()

  const activeDayWithoutSubstitutes = activeDay?.exercises.filter(
    (e) =>
      activeDay?.exercises.findIndex((e2) => e2.substitutedBy?.id === e.id) ===
      -1,
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group/dropdown" asChild>
        <Button
          variant="secondary"
          className={cn('grow justify-between bg-secondary', className)}
          iconEnd={
            <ChevronDown
              className={cn(
                'text-muted-foreground size-4 group-hover/dropdown:text-primary transition-all duration-200 shrink-0',
              )}
            />
          }
        >
          <div className="flex items-center gap-2 overflow-hidden">
            {activeExerciseId === 'summary' ? (
              <span className="truncate">Summary</span>
            ) : (
              <span className="truncate">
                {exercise?.order}.{' '}
                {exercise?.substitutedBy?.name || exercise?.name}{' '}
              </span>
            )}
            {exercise?.completedAt ? (
              <BadgeCheckIcon className="text-green-500 !size-4" />
            ) : null}
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-64">
        {activeDayWithoutSubstitutes?.map((exercise, index) => (
          <React.Fragment key={exercise.id}>
            <DropdownMenuItem
              key={exercise.id}
              disabled={exercise.id === activeExerciseId}
              onClick={() => setActiveExerciseId(exercise.id)}
            >
              <div className="text-sm grid grid-cols-[auto_1fr_auto] items-center w-full gap-2">
                <ArrowRight
                  className={cn(
                    'text-primary size-4 opacity-0',
                    activeExerciseId === exercise.id && 'opacity-100',
                  )}
                />
                <p>
                  {index + 1}. {exercise.substitutedBy?.name || exercise.name}
                </p>
                {exercise.substitutedBy?.completedAt || exercise.completedAt ? (
                  <BadgeCheckIcon className="self-start ml-auto mt-0.5 text-green-500" />
                ) : null}
              </div>
            </DropdownMenuItem>
          </React.Fragment>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={activeExerciseId === 'summary'}
          onClick={() => setActiveExerciseId('summary')}
        >
          <div className="text-sm grid grid-cols-[auto_1fr] items-center w-full gap-2">
            <ListChecksIcon className={cn('text-primary size-4')} />
            <p>Summary</p>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const sharedLayoutStyles = cn(
  'w-full py-1 px-2.5 grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-3 items-center',
)

function ExerciseSets({
  exercise,
  previousLogs,
  isExerciseCompleted,
}: {
  exercise: WorkoutExercise
  previousLogs: (WorkoutExercise & {
    performedOnWeekNumber: number
    performedOnDayNumber: number
  })[]
  isExerciseCompleted: boolean
}) {
  const { trainingId } = useParams<{ trainingId: string }>()
  const invalidateQuery = useInvalidateQuery()
  const queryClient = useQueryClient()
  const { mutateAsync: addSet, isPending: isAddingSet } =
    useFitspaceAddSetMutation({
      onSuccess: (data) => {
        // Manually update the cache with the new set
        queryClient.setQueryData(
          useFitspaceGetWorkoutQuery.getKey({ trainingId }),
          (old: GQLFitspaceGetWorkoutQuery) => {
            if (!old?.getWorkout?.plan || !data?.addSet) return old

            const newWorkout = JSON.parse(
              JSON.stringify(old),
            ) as NonNullable<GQLFitspaceGetWorkoutQuery>
            if (!newWorkout.getWorkout?.plan) return newWorkout

            // Find the exercise and add the new set
            newWorkout.getWorkout.plan.weeks.forEach((week) => {
              week.days.forEach((day) => {
                day.exercises.forEach((exerciseItem) => {
                  const targetExerciseId =
                    exercise.substitutedBy?.id || exercise.id
                  const currentExerciseId =
                    exerciseItem.substitutedBy?.id || exerciseItem.id

                  if (currentExerciseId === targetExerciseId) {
                    const setsToUpdate =
                      exerciseItem.substitutedBy?.sets || exerciseItem.sets

                    // Get the last set to inherit target values from
                    const lastSet = setsToUpdate[setsToUpdate.length - 1]

                    // Create a properly structured set with correct order and isExtra = true
                    const newSet = {
                      ...data.addSet,
                      order: setsToUpdate.length + 1,
                      isExtra: true,
                      // Inherit target values from the last set
                      reps: lastSet?.reps || null,
                      minReps: lastSet?.minReps || null,
                      maxReps: lastSet?.maxReps || null,
                      weight: lastSet?.weight || null,
                      rpe: lastSet?.rpe || null,
                      // Always null for new sets
                      log: null,
                      completedAt: null,
                    }

                    setsToUpdate.push(newSet)
                  }
                })
              })
            })

            return newWorkout
          },
        )
      },
      onSettled: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        })
      },
    })
  const hasRpe = exercise.sets.some((set) => set.rpe)

  const handleAddSet = async () => {
    await addSet({
      exerciseId: exercise.substitutedBy?.id || exercise.id,
    })
  }

  const { mutateAsync: removeSet } = useFitspaceRemoveSetMutation({
    onMutate: async (variables) => {
      // Cancel outgoing queries to prevent race conditions
      const queryKey = useFitspaceGetWorkoutQuery.getKey({ trainingId })
      await queryClient.cancelQueries({ queryKey })

      // Get current data for rollback
      const previousData =
        queryClient.getQueryData<GQLFitspaceGetWorkoutQuery>(queryKey)

      // Optimistically update cache to remove the set
      queryClient.setQueryData(queryKey, (old: GQLFitspaceGetWorkoutQuery) => {
        if (!old?.getWorkout?.plan) return old

        const newWorkout = JSON.parse(
          JSON.stringify(old),
        ) as NonNullable<GQLFitspaceGetWorkoutQuery>
        if (!newWorkout.getWorkout?.plan) return newWorkout

        // Find and remove the set from the workout data
        newWorkout.getWorkout.plan.weeks.forEach((week) => {
          week.days.forEach((day) => {
            day.exercises.forEach((exercise) => {
              const setsToUpdate = exercise.substitutedBy?.sets || exercise.sets
              const setIndex = setsToUpdate.findIndex(
                (s) => s.id === variables.setId,
              )
              if (setIndex !== -1) {
                setsToUpdate.splice(setIndex, 1)
                // Reorder remaining sets
                setsToUpdate.forEach((remainingSet, index) => {
                  remainingSet.order = index + 1
                })
              }
            })
          })
        })

        return newWorkout
      })

      return { previousData }
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        const queryKey = useFitspaceGetWorkoutQuery.getKey({ trainingId })
        queryClient.setQueryData(queryKey, context.previousData)
      }
    },
    onSuccess: () => {
      invalidateQuery({
        queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
      })
    },
  })

  const removeExtraSet = async () => {
    const exerciseSets = exercise.substitutedBy?.sets || exercise.sets
    // Find the last extra set (highest order among extra sets)
    const extraSets = exerciseSets.filter((set) => set.isExtra)
    const lastExtraSet = extraSets.reduce(
      (latest, current) => (current.order > latest.order ? current : latest),
      extraSets[0],
    )

    if (lastExtraSet) {
      await removeSet({
        setId: lastExtraSet.id,
      })
    }
  }

  const hasExtraSets = (exercise.substitutedBy?.sets || exercise.sets).some(
    (set) => set.isExtra,
  )

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-1">
        <div
          className={cn(sharedLayoutStyles, 'text-xs text-muted-foreground')}
        >
          <div className="min-w-2.5"></div>
          <div className="text-center min-w-[96px]">Reps</div>
          <div className="text-center min-w-[96px]">Weight</div>
          <div className={cn('text-center', !hasRpe && 'opacity-0')}>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center gap-1">
                  RPE <InfoIcon className="size-2.5 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                Suggested effort level for the set.
                <br />
                <br />
                <strong>RPE (Rate of Perceived Exertion)</strong>: A subjective
                measure of how hard an exercise feels, typically on a scale from
                1 (very easy) to 10 (maximum effort).
                <br />
                <br />
                For example, if you can do maximum 10 reps of a weight, your RPE
                is 10.
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-center min-w-[40px]"></div>
        </div>

        {hasExtraSets && <div className="w-8 shrink-0" />}
      </div>
      <div className="flex flex-col">
        {(exercise.substitutedBy?.sets || exercise.sets).map((set) => {
          return (
            <ExerciseSet
              key={set.id}
              set={set}
              previousLogs={previousLogs}
              isExerciseCompleted={isExerciseCompleted}
            />
          )
        })}

        <div
          className={cn(
            'grid grid-cols-1 items-center gap-2',
            hasExtraSets && 'grid-cols-2',
          )}
        >
          {hasExtraSets && (
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              iconStart={<XIcon />}
              onClick={removeExtraSet}
            >
              Remove last set
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            className={cn('w-max', hasExtraSets && 'w-full')}
            iconStart={<PlusIcon />}
            loading={isAddingSet}
            onClick={handleAddSet}
          >
            Add set
          </Button>
        </div>
      </div>
    </div>
  )
}

function ExerciseSet({
  set,
  previousLogs,
}: {
  set: WorkoutExercise['sets'][number]
  previousLogs: (WorkoutExercise & {
    performedOnWeekNumber: number
    performedOnDayNumber: number
  })[]
  isExerciseCompleted: boolean
}) {
  const { trainingId } = useParams<{ trainingId: string }>()
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const [isCompletingSet, setIsCompletingSet] = useState(false)
  const hasUserEdited = useRef(false)
  const { toDisplayWeight } = useWeightConversion()
  const invalidateQuery = useInvalidateQuery()
  const queryClient = useQueryClient()

  const { mutateAsync: updateSetLog } = useFitspaceUpdateSetLogMutation({
    onMutate: async (newLog) => {
      await queryClient.cancelQueries({
        queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
      })

      const previousWorkout = queryClient.getQueryData(
        useFitspaceGetWorkoutQuery.getKey({ trainingId }),
      )

      queryClient.setQueryData(
        useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        (old: GQLFitspaceGetWorkoutQuery) => {
          if (!old?.getWorkout?.plan) return old

          const newWorkout = JSON.parse(
            JSON.stringify(old),
          ) as NonNullable<GQLFitspaceGetWorkoutQuery>
          if (!newWorkout.getWorkout?.plan) return newWorkout

          const updatedSet = newWorkout.getWorkout.plan.weeks
            .flatMap((week) => week.days)
            .flatMap((day) => day.exercises)
            .flatMap(
              (exercise) => exercise.substitutedBy?.sets || exercise.sets,
            )
            .find((s) => s.id === newLog.input.setId)

          if (updatedSet) {
            updatedSet.log = {
              id: updatedSet.log?.id || 'temp-id',
              reps: newLog.input.loggedReps,
              weight: newLog.input.loggedWeight,
              rpe: updatedSet.log?.rpe,
              createdAt: new Date().toISOString(),
            }
          }

          return newWorkout
        },
      )

      return { previousWorkout }
    },
    onError: (err, newLog, context) => {
      if (context?.previousWorkout) {
        queryClient.setQueryData(
          useFitspaceGetWorkoutQuery.getKey({ trainingId }),
          context.previousWorkout,
        )
      }
    },
    onSettled: () => {
      invalidateQuery({
        queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
      })
    },
  })

  const { mutateAsync: markSetAsCompleted } =
    useFitspaceMarkSetAsCompletedMutation({
      onMutate: async ({ setId, completed }) => {
        // Cancel outgoing queries to prevent race conditions
        const queryKey = useFitspaceGetWorkoutQuery.getKey({ trainingId })
        await queryClient.cancelQueries({ queryKey })

        // Get current data for rollback
        const previousData =
          queryClient.getQueryData<GQLFitspaceGetWorkoutQuery>(queryKey)

        // Optimistically update the cache
        queryClient.setQueryData(
          queryKey,
          createOptimisticSetUpdate(setId, completed),
        )

        return { previousData }
      },
      onError: (err, variables, context) => {
        // Rollback on error
        if (context?.previousData) {
          const queryKey = useFitspaceGetWorkoutQuery.getKey({ trainingId })
          queryClient.setQueryData(queryKey, context.previousData)
        }
        setIsCompletingSet(false)
      },
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        })
        setIsCompletingSet(false)
      },
    })

  const handleToggleSetCompletion = async () => {
    setIsCompletingSet(true)
    try {
      await markSetAsCompleted({
        setId: set.id,
        completed: !set.completedAt,
      })
    } catch (error) {
      console.error('Failed to toggle set completion:', error)
      setIsCompletingSet(false)
    }
  }

  useEffect(() => {
    if (set.log && !hasUserEdited.current) {
      setReps(set.log.reps?.toString() ?? '')
      setWeight(set.log.weight?.toString() ?? '')
    }
  }, [set.log])

  const debouncedUpdate = useMemo(
    () =>
      debounce(async (repsValue: string, weightValue: string) => {
        if (!hasUserEdited.current) return
        await updateSetLog({
          input: {
            setId: set.id,
            loggedReps: repsValue ? +repsValue : null,
            loggedWeight: weightValue ? +weightValue : null,
          },
        })
      }, 500),
    [set.id, updateSetLog],
  )

  useEffect(() => {
    debouncedUpdate(reps, weight)
    return () => debouncedUpdate.cancel()
  }, [reps, weight, debouncedUpdate])

  const repRange =
    set.minReps && set.maxReps
      ? `${set.minReps}-${set.maxReps}`
      : (set.minReps ?? set.maxReps ?? set.reps)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    key: 'reps' | 'weight',
  ) => {
    const sanitizedValue = e.target.value
      .replace(',', '.') // Replace comma with dot
      .replace(/[^0-9.]/g, '') // Remove anything not digit or dot
      .replace(/(\..*)\./g, '$1') // Prevent more than one dot

    hasUserEdited.current = true

    if (key === 'reps') {
      setReps(sanitizedValue)
    } else {
      setWeight(sanitizedValue)
    }
  }

  const showLabel =
    !set.isExtra &&
    (set.reps || set.minReps || set.maxReps || set.weight || set.rpe)

  const lastLog = previousLogs[previousLogs.length - 1]
  const thisSet = lastLog?.sets[set.order - 1]
  return (
    <AnimateChangeInHeight>
      {showLabel && (
        <div className="flex items-center gap-1">
          <div
            className={cn(
              sharedLayoutStyles,
              'rounded-t-md bg-secondary/50 dark:bg-card/50 pb-2 -mb-2 border-t border-l border-r border-border dark:border-none',
            )}
          >
            <div className="min-w-2.5"></div>
            <div className="text-xs text-muted-foreground text-center min-w-[96px]">
              {repRange}
            </div>
            <div className="text-xs text-muted-foreground text-center min-w-[96px]">
              {set.weight ? toDisplayWeight(set.weight)?.toFixed(1) : ''}
            </div>
            <div className="" />
            <div className="min-w-[40px]" />
          </div>
        </div>
      )}

      <div className="flex items-start gap-1 pb-2 ">
        <div>
          <div
            className={cn(
              sharedLayoutStyles,
              'rounded-md bg-card dark:bg-secondary text-primary relative',
            )}
          >
            <div className="min-w-2.5">{set.order}.</div>
            <Input
              id={`set-${set.id}-reps`}
              value={reps}
              onChange={(e) => handleInputChange(e, 'reps')}
              inputMode="decimal"
              variant={'secondary'}
              placeholder={thisSet?.log?.reps?.toString() || ''}
              className="min-w-[96px] text-center"
            />
            <ExerciseWeightInput
              setId={set.id}
              weightInKg={weight ? parseFloat(weight) : null}
              onWeightChange={(weightInKg) => {
                hasUserEdited.current = true
                setWeight(weightInKg?.toString() || '')
              }}
              placeholder={
                thisSet?.log?.weight
                  ? toDisplayWeight(thisSet.log.weight)?.toString()
                  : ''
              }
              disabled={false}
            />
            <div className="text-sm text-muted-foreground text-center">
              {set.rpe}
            </div>
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="icon-sm"
                iconOnly={
                  <CheckIcon
                    className={cn(
                      'size-4 transition-colors',
                      set.completedAt
                        ? 'text-green-500'
                        : 'text-muted-foreground/40',
                    )}
                  />
                }
                loading={isCompletingSet}
                onClick={handleToggleSetCompletion}
                className="self-center"
              />
            </div>
          </div>
        </div>
      </div>
    </AnimateChangeInHeight>
  )
}

function SupersetsNavigation({
  exercise,
  exercises,
  onPaginationClick,
}: {
  exercise: WorkoutExercise
  exercises: WorkoutExercise[]
  onPaginationClick: (exerciseId: string, type: 'prev' | 'next') => void
}) {
  const currentExerciseIndex = exercises.findIndex((e) => e.id === exercise.id)
  const isExercise1A = exercise.type === GQLExerciseType.Superset_1A
  const isExercise1B = exercise.type === GQLExerciseType.Superset_1B
  const exercise1A = isExercise1A
    ? exercise
    : exercises[currentExerciseIndex - 1]
  const exercise1B = isExercise1B
    ? exercise
    : exercises[currentExerciseIndex + 1]

  const isSuperset =
    exercise.type === GQLExerciseType.Superset_1A ||
    exercise.type === GQLExerciseType.Superset_1B

  if (!isSuperset) {
    return null
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {exercise1A && (
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            'w-full whitespace-normal h-auto py-1 justify-start text-left',
            exercise.id === exercise1B.id && 'bg-muted/50',
          )}
          onClick={() => onPaginationClick(exercise1A.id, 'prev')}
        >
          <div className="flex items-center gap-1">
            <div
              className={cn(
                'text-lg text-muted-foreground w-4 shrink-0',
                exercise.id === exercise1A.id && 'text-primary',
              )}
            >
              A
            </div>
            <div className="text-xs text-muted-foreground">
              {exercise1A.name}
            </div>
          </div>
        </Button>
      )}
      {exercise1B && (
        <Button
          variant="secondary"
          size="sm"
          className={cn(
            'w-full whitespace-normal h-auto py-1 justify-start text-left',
            exercise.id === exercise1A.id && 'bg-muted/50',
          )}
          onClick={() => onPaginationClick(exercise1B.id, 'next')}
        >
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'text-lg text-muted-foreground w-4 shrink-0',
                exercise.id === exercise1B.id && 'text-primary',
              )}
            >
              B
            </div>
            <div className="text-xs text-muted-foreground">
              {exercise1B.name}
            </div>
          </div>
        </Button>
      )}
    </div>
  )
}

function ExerciseNotebook({ exercise }: { exercise: WorkoutExercise }) {
  const notesCount = useExerciseNotesCount(exercise)

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <div className="flex items-center gap-1 relative">
          <Button variant="secondary" iconOnly={<NotebookPenIcon />} />
          {notesCount > 0 && (
            <div className="text-xs absolute -top-1 -right-1 bg-amber-500/60 rounded-full size-4 shrink-0 flex items-center justify-center">
              {notesCount}
            </div>
          )}
        </div>
      </DrawerTrigger>
      <SimpleDrawerContent
        title="Exercise Notes"
        headerIcon={<NotebookPenIcon />}
        className="max-h-[80vh] flex flex-col"
      >
        <div className="flex-1 overflow-y-auto">
          <ExerciseNotes exercise={exercise} />
        </div>
      </SimpleDrawerContent>
    </Drawer>
  )
}

function ExerciseMetadata({
  exercise,
  handleMarkAsCompleted,
  isCompleted,
  handleRemoveExercise,
  isRemoving,
}: {
  exercise: WorkoutExercise
  handleMarkAsCompleted: (checked: boolean) => void
  isCompleted: boolean
  handleRemoveExercise: () => void
  isRemoving: boolean
}) {
  const { trainingId } = useParams<{ trainingId: string }>()
  const invalidateQuery = useInvalidateQuery()

  const { mutateAsync: markSetAsCompleted } =
    useFitspaceMarkSetAsCompletedMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        })
      },
    })

  const handleToggleSet = async (setId: string, completed: boolean) => {
    try {
      await markSetAsCompleted({
        setId,
        completed,
      })
    } catch (error) {
      console.error('Failed to toggle set:', error)
    }
  }

  const isSuperset =
    exercise.type === GQLExerciseType.Superset_1A ||
    exercise.type === GQLExerciseType.Superset_1B

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {exercise.restSeconds && (
            <CountdownTimer
              variant="secondary"
              restDuration={2}
              onComplete={() => {
                // Find the first uncompleted set and mark it as done
                const firstUncompletedSet = (
                  exercise.substitutedBy?.sets || exercise.sets
                ).find((set) => !set.completedAt)
                if (firstUncompletedSet) {
                  handleToggleSet(firstUncompletedSet.id, true)
                }
              }}
            />
          )}
          <div className="flex gap-2 ml-auto">
            <ExerciseNotebook exercise={exercise} />
            {(exercise.substitutedBy?.videoUrl || exercise.videoUrl) && (
              <VideoPreview
                variant="secondary"
                url={
                  exercise.substitutedBy?.videoUrl || exercise.videoUrl || ''
                }
              />
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" iconOnly={<MoreHorizontalIcon />} />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem
                  onClick={() => handleMarkAsCompleted(!isCompleted)}
                >
                  <Check
                    className={cn(
                      'transition-all duration-200',
                      isCompleted ? 'text-green-500' : 'text-muted-foreground',
                    )}
                  />
                  {isCompleted ? 'Mark as incomplete' : 'Mark as completed'}
                </DropdownMenuItem>
                {exercise.substitutes.length > 0 && (
                  <DropdownMenuItem>
                    <Replace /> Swap exercise
                  </DropdownMenuItem>
                )}
                {exercise.isExtra && (
                  <DropdownMenuItem
                    onClick={handleRemoveExercise}
                    loading={isRemoving}
                  >
                    <TrashIcon /> Remove exercise
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      {exercise.additionalInstructions && (
        <div className="text-sm text-muted-foreground mt-2">
          {exercise.additionalInstructions}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        {isSuperset && (
          <Badge variant="secondary" size="md">
            <ArrowLeftRight />
            Superset A/B
          </Badge>
        )}
        {exercise.warmupSets && (
          <Badge variant="secondary" size="md">
            <FlameIcon />
            {exercise.warmupSets} warmup{exercise.warmupSets > 1 ? 's' : ''}
          </Badge>
        )}

        {exercise.tempo && (
          <Badge variant="secondary" size="md">
            <GaugeIcon />
            {exercise.tempo}
          </Badge>
        )}
      </div>
    </div>
  )
}
