import { DropdownMenuPortal } from '@radix-ui/react-dropdown-menu'
import { useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheckIcon,
  Check,
  ChevronDown,
  FlameIcon,
  GaugeIcon,
  InfoIcon,
  ListChecksIcon,
  MoreHorizontalIcon,
  NotebookTextIcon,
  PlusIcon,
  Replace,
  TimerIcon,
  TrashIcon,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'

import { AnimateChangeInHeight } from '@/components/animations/animated-height-change'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Drawer, SimpleDrawerContent } from '@/components/ui/drawer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
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
  useFitspaceRemoveExerciseFromWorkoutMutation,
  useFitspaceRemoveSetMutation,
  useFitspaceSwapExerciseMutation,
  useFitspaceUpdateSetLogMutation,
} from '@/generated/graphql-client'
import { convertSecondsToTimeString } from '@/lib/convert-seconds-time-to-string'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

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
        isCompleted={isExerciseCompleted}
        handleMarkAsCompleted={handleMarkAsCompleted}
        onPaginationClick={onPaginationClick}
        handleRemoveExercise={handleRemoveExercise}
        isRemoving={isRemoving}
      />
      <ExerciseSets
        exercise={exercise}
        previousLogs={previousLogs}
        isExerciseCompleted={isExerciseCompleted}
      />
    </div>
  )
}

function ExerciseHeader({
  exercise,
  exercises,
  isCompleted,
  handleMarkAsCompleted,
  onPaginationClick,
  handleRemoveExercise,
  isRemoving,
}: {
  exercise: WorkoutExercise
  exercises: WorkoutExercise[]
  isCompleted: boolean
  handleMarkAsCompleted: (checked: boolean) => void
  onPaginationClick: (exerciseId: string, type: 'prev' | 'next') => void
  handleRemoveExercise: () => void
  isRemoving: boolean
}) {
  const invalidateQuery = useInvalidateQuery()
  const { trainingId } = useParams<{ trainingId: string }>()
  const { mutateAsync: swapExercise, isPending: isSwapping } =
    useFitspaceSwapExerciseMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        })
        toast.success('Exercise swapped')
      },
    })

  const [isSwapExerciseOpen, setIsSwapExerciseOpen] = useState(false)
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<
    string | null
  >(null)
  const [activeExerciseId, setActiveExerciseId] = useQueryState('exercise')
  const [isInstructionsOpen, setIsInstructionsOpen] = useState(false)

  const restDuration = exercise.restSeconds
    ? convertSecondsToTimeString(exercise.restSeconds)
    : null

  const isSuperset =
    exercise.type === GQLExerciseType.Superset_1A ||
    exercise.type === GQLExerciseType.Superset_1B

  const handleSwapExercise = async () => {
    if (!selectedSubstituteId) {
      return
    }
    await swapExercise({
      exerciseId: exercise.id,
      substituteId: selectedSubstituteId,
    })
    setIsSwapExerciseOpen(false)
    setSelectedSubstituteId(null)
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <ExerciseSelector
          exercise={exercise}
          activeExerciseId={activeExerciseId}
          setActiveExerciseId={setActiveExerciseId}
        />
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
            {exercise.instructions && (
              <DropdownMenuItem onClick={() => setIsInstructionsOpen(true)}>
                <NotebookTextIcon /> Instructions
              </DropdownMenuItem>
            )}
            {exercise.substitutes.length > 0 && (
              <DropdownMenuItem onClick={() => setIsSwapExerciseOpen(true)}>
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
      {isSuperset && (
        <div className="mt-2">
          <SupersetsNavigation
            exercise={exercise}
            exercises={exercises}
            onPaginationClick={onPaginationClick}
          />
        </div>
      )}
      <div className="flex items-start justify-between gap-4 mt-4">
        <div className="flex flex-wrap gap-2">
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
          {exercise.restSeconds && (
            <Badge variant="secondary" size="md">
              <TimerIcon />
              {restDuration} rest
            </Badge>
          )}
          {exercise.tempo && (
            <Badge variant="secondary" size="md">
              <GaugeIcon />
              {exercise.tempo}
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {(exercise.substitutedBy?.videoUrl || exercise.videoUrl) && (
            <VideoPreview
              variant="secondary"
              url={exercise.substitutedBy?.videoUrl || exercise.videoUrl || ''}
            />
          )}
          <Button
            variant="secondary"
            onClick={() => handleMarkAsCompleted(!isCompleted)}
            iconOnly={
              <Check
                className={cn(
                  'transition-all duration-200',
                  isCompleted ? 'text-green-500' : 'text-muted-foreground',
                )}
              />
            }
          />

          <Dialog
            open={isInstructionsOpen}
            onOpenChange={setIsInstructionsOpen}
          >
            <DialogContent dialogTitle={exercise.name}>
              <DialogHeader>
                <DialogTitle>{exercise.name}</DialogTitle>
              </DialogHeader>
              <DialogDescription className="whitespace-pre-wrap">
                {exercise.instructions}
              </DialogDescription>
            </DialogContent>
          </Dialog>
          {isSwapExerciseOpen && (
            <Drawer
              open={isSwapExerciseOpen}
              onOpenChange={setIsSwapExerciseOpen}
            >
              <SimpleDrawerContent
                title="Swap exercise"
                footer={
                  <Button
                    variant="secondary"
                    disabled={!selectedSubstituteId}
                    loading={isSwapping}
                    onClick={() => handleSwapExercise()}
                  >
                    Swap
                  </Button>
                }
              >
                <div className="flex flex-col gap-2">
                  <RadioGroup
                    value={selectedSubstituteId}
                    onValueChange={(value) => {
                      setSelectedSubstituteId(value)
                    }}
                  >
                    <Label
                      key={exercise.id}
                      htmlFor={exercise.id}
                      className={cn(
                        'flex items-center gap-2 p-4 rounded-md bg-card-on-card',
                        !exercise.substitutedBy && 'opacity-50 cursor-default',
                      )}
                    >
                      <RadioGroupItem
                        value={exercise.id}
                        id={exercise.id}
                        disabled={!exercise.substitutedBy}
                      />
                      {exercise.name} (original)
                    </Label>
                    {exercise.substitutes.map((substitute) => (
                      <Label
                        key={substitute.substitute.id}
                        htmlFor={substitute.substitute.id}
                        className={cn(
                          'flex items-center gap-2 p-4 rounded-md bg-card-on-card',
                          substitute.substitute.id ===
                            exercise.substitutedBy?.baseId &&
                            'opacity-50 cursor-default',
                        )}
                      >
                        <RadioGroupItem
                          value={substitute.substitute.id}
                          id={substitute.substitute.id}
                          disabled={
                            substitute.substitute.id ===
                            exercise.substitutedBy?.baseId
                          }
                        />
                        {substitute.substitute.name}
                      </Label>
                    ))}
                  </RadioGroup>
                </div>
              </SimpleDrawerContent>
            </Drawer>
          )}
        </div>
      </div>
      {exercise.additionalInstructions && (
        <div className="text-sm text-muted-foreground mt-2">
          {exercise.additionalInstructions}
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
  'w-full py-1 px-2.5 grid grid-cols-[auto_1fr_1fr_1fr] gap-3 items-center',
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

  const hasExtraSets = (exercise.substitutedBy?.sets || exercise.sets).some(
    (set) => set.isExtra,
  )

  return (
    <div className="flex flex-col mt-4 py-4">
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
              hasExtraSets={hasExtraSets}
            />
          )
        })}
        <Button
          variant="secondary"
          size="sm"
          className="w-max"
          iconStart={<PlusIcon />}
          loading={isAddingSet}
          onClick={handleAddSet}
        >
          Add set
        </Button>
      </div>
    </div>
  )
}

function ExerciseSet({
  set,
  previousLogs,
  hasExtraSets,
}: {
  set: WorkoutExercise['sets'][number]
  previousLogs: (WorkoutExercise & {
    performedOnWeekNumber: number
    performedOnDayNumber: number
  })[]
  isExerciseCompleted: boolean
  hasExtraSets: boolean
}) {
  const { trainingId } = useParams<{ trainingId: string }>()
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const hasUserEdited = useRef(false)
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

  const { mutateAsync: removeSet, isPending: isRemovingSet } =
    useFitspaceRemoveSetMutation({
      onSuccess: (data, variables) => {
        // Update cache after successful removal
        queryClient.setQueryData(
          useFitspaceGetWorkoutQuery.getKey({ trainingId }),
          (old: GQLFitspaceGetWorkoutQuery) => {
            if (!old?.getWorkout?.plan) return old

            const newWorkout = JSON.parse(
              JSON.stringify(old),
            ) as NonNullable<GQLFitspaceGetWorkoutQuery>
            if (!newWorkout.getWorkout?.plan) return newWorkout

            // Find and remove the set from the workout data
            newWorkout.getWorkout.plan.weeks.forEach((week) => {
              week.days.forEach((day) => {
                day.exercises.forEach((exercise) => {
                  const setsToUpdate =
                    exercise.substitutedBy?.sets || exercise.sets
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
          },
        )
      },
      onSettled: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        })
      },
    })

  const handleRemoveSet = async () => {
    await removeSet({
      setId: set.id,
    })
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
    set.reps || set.minReps || set.maxReps || set.weight || set.rpe

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
              {set.weight}
            </div>
            <div className="" />
          </div>
          {hasExtraSets && <div className="w-8 shrink-0" />}
        </div>
      )}

      <div className="flex items-start gap-1 pb-2 ">
        <div>
          <div
            className={cn(
              sharedLayoutStyles,
              'rounded-md bg-card  dark:bg-secondary text-primary border-l border-r border-b border-border dark:border-none',
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
            <Input
              id={`set-${set.id}-weight`}
              value={weight}
              onChange={(e) => handleInputChange(e, 'weight')}
              variant="secondary"
              inputMode="decimal"
              placeholder={thisSet?.log?.weight?.toString() || ''}
              className="min-w-[96px] text-center"
            />
            <div className="text-sm text-muted-foreground text-center">
              {set.rpe}
            </div>
          </div>
        </div>
        {hasExtraSets && (
          <div className="w-8 shrink-0 flex justify-center">
            {set.isExtra && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    iconOnly={<MoreHorizontalIcon />}
                    loading={isRemovingSet}
                    className="self-center"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={handleRemoveSet}>
                      <TrashIcon /> Remove set
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenuPortal>
              </DropdownMenu>
            )}
          </div>
        )}
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
