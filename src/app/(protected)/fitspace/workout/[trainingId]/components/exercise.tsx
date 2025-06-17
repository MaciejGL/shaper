import { useQueryClient } from '@tanstack/react-query'
import { debounce } from 'lodash'
import {
  ArrowLeftRight,
  BadgeCheckIcon,
  Check,
  ChevronDown,
  FlameIcon,
  GaugeIcon,
  ListCollapseIcon,
  NotebookTextIcon,
  TimerIcon,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import React, { useEffect, useMemo, useRef, useState } from 'react'

import { AnimateChangeInHeight } from '@/components/animations/animated-height-change'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VideoPreview } from '@/components/video-preview'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  GQLExerciseType,
  GQLFitspaceGetWorkoutQuery,
  useFitspaceGetWorkoutQuery,
  useFitspaceMarkExerciseAsCompletedMutation,
  useFitspaceMarkSetAsCompletedMutation,
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
  const [isExpanded, setIsExpanded] = useState(false)
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

  return (
    <div>
      <ExerciseHeader
        exercise={exercise}
        exercises={exercises}
        setIsExpanded={setIsExpanded}
        hasLogs={previousLogs.length > 0}
        isCompleted={isExerciseCompleted}
        handleMarkAsCompleted={handleMarkAsCompleted}
        onPaginationClick={onPaginationClick}
      />
      <ExerciseSets
        exercise={exercise}
        isExpanded={isExpanded}
        previousLogs={previousLogs}
        isExerciseCompleted={isExerciseCompleted}
      />
    </div>
  )
}

function ExerciseHeader({
  exercise,
  exercises,
  setIsExpanded,
  hasLogs,
  isCompleted,
  handleMarkAsCompleted,
  onPaginationClick,
}: {
  exercise: WorkoutExercise
  exercises: WorkoutExercise[]
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>
  hasLogs: boolean
  isCompleted: boolean
  handleMarkAsCompleted: (checked: boolean) => void
  onPaginationClick: (exerciseId: string, type: 'prev' | 'next') => void
}) {
  const [activeExerciseId, setActiveExerciseId] = useQueryState('exercise')

  const restDuration = exercise.restSeconds
    ? convertSecondsToTimeString(exercise.restSeconds)
    : null

  const isSuperset =
    exercise.type === GQLExerciseType.Superset_1A ||
    exercise.type === GQLExerciseType.Superset_1B

  return (
    <div>
      <ExerciseSelector
        exercise={exercise}
        activeExerciseId={activeExerciseId}
        setActiveExerciseId={setActiveExerciseId}
      />
      <div className="mt-2">
        <SupersetsNavigation
          exercise={exercise}
          exercises={exercises}
          onPaginationClick={onPaginationClick}
        />
      </div>
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
          {exercise.videoUrl && (
            <VideoPreview variant="secondary" url={exercise.videoUrl} />
          )}
          {hasLogs && (
            <Button
              variant="secondary"
              iconOnly={<ListCollapseIcon />}
              onClick={() => setIsExpanded((prev) => !prev)}
            />
          )}
          {exercise.instructions && (
            <ExerciseInstructions exercise={exercise} />
          )}
          <Button
            variant="secondary"
            iconOnly={
              <Check
                className={cn(
                  'transition-all duration-200',
                  isCompleted ? 'text-green-500' : 'text-muted-foreground',
                )}
              />
            }
            onClick={() => handleMarkAsCompleted(!isCompleted)}
          />
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

function ExerciseSelector({
  exercise,
  activeExerciseId,
  setActiveExerciseId,
}: {
  exercise: WorkoutExercise
  activeExerciseId?: string | null
  setActiveExerciseId: (exerciseId: string) => void
}) {
  const { activeDay } = useWorkout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group/dropdown" asChild>
        <Button
          variant="secondary"
          className="w-full justify-between"
          iconEnd={
            <ChevronDown
              className={cn(
                'text-muted-foreground size-4 group-hover/dropdown:text-primary transition-all duration-200 shrink-0',
              )}
            />
          }
        >
          {exercise.order}. {exercise.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {activeDay?.exercises.map((exercise, index) => (
          <React.Fragment key={exercise.id}>
            <DropdownMenuItem
              key={exercise.id}
              disabled={exercise.id === activeExerciseId}
              onClick={() => setActiveExerciseId(exercise.id)}
            >
              <div className="text-sm flex justify-between w-full gap-4">
                {index + 1}. {exercise.name}
                {exercise.completedAt ? (
                  <BadgeCheckIcon className="self-start ml-auto mt-0.5 text-green-500" />
                ) : null}
              </div>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="last:hidden mx-2" />
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ExerciseInstructions({ exercise }: { exercise: WorkoutExercise }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary" iconOnly={<NotebookTextIcon />} />
      </DialogTrigger>
      <DialogContent dialogTitle={exercise.name}>
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="whitespace-pre-wrap">
          {exercise.instructions}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}

const sharedLayoutStyles = cn(
  'w-full py-1 px-2.5 grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-3 items-center',
)

function ExerciseSets({
  exercise,
  isExpanded,
  previousLogs,
  isExerciseCompleted,
}: {
  exercise: WorkoutExercise
  isExpanded: boolean
  previousLogs: (WorkoutExercise & {
    performedOnWeekNumber: number
    performedOnDayNumber: number
  })[]
  isExerciseCompleted: boolean
}) {
  return (
    <div className="flex flex-col mt-4 py-4">
      <div className={cn(sharedLayoutStyles, 'text-xs text-muted-foreground')}>
        <div className="min-w-2.5"></div>
        <div className="text-center">Reps</div>
        <div className="text-center">Weight</div>
        <div className="text-center">RPE</div>

        <div className="w-4" />
      </div>
      <div className="flex flex-col gap-2">
        {exercise.sets.map((set) => (
          <ExerciseSet
            key={set.id}
            set={set}
            previousLogs={previousLogs}
            isExpanded={isExpanded}
            isExerciseCompleted={isExerciseCompleted}
          />
        ))}
      </div>
    </div>
  )
}

function ExerciseSet({
  set,
  previousLogs,
  isExpanded,
  isExerciseCompleted,
}: {
  set: WorkoutExercise['sets'][number]
  previousLogs: (WorkoutExercise & {
    performedOnWeekNumber: number
    performedOnDayNumber: number
  })[]
  isExpanded: boolean
  isExerciseCompleted: boolean
}) {
  const { trainingId } = useParams<{ trainingId: string }>()
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')
  const hasUserEdited = useRef(false)
  const [isCompleted, setIsCompleted] = useState(Boolean(set.completedAt))
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
            .flatMap((exercise) => exercise.sets)
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
      invalidateQuery({ queryKey: ['FitspaceGetWorkout'] })
    },
  })

  const { mutateAsync: markSetAsCompleted, isPending: isMarkingSet } =
    useFitspaceMarkSetAsCompletedMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({
            trainingId: trainingId,
          }),
        })
      },
      onError: () => {
        setIsCompleted(false)
      },
    })

  useEffect(() => {
    if (set.log && !hasUserEdited.current) {
      setReps(set.log.reps?.toString() ?? '')
      setWeight(set.log.weight?.toString() ?? '')
    }
  }, [set.log])

  useEffect(() => {
    setIsCompleted(Boolean(set.completedAt))
  }, [set.completedAt])

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

  const handleMarkAsCompleted = async (checked: boolean) => {
    setIsCompleted(checked)
    try {
      await markSetAsCompleted({ setId: set.id, completed: checked })
    } catch (error) {
      setIsCompleted(!checked)
    }
  }

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
      if (sanitizedValue.length > 0 && weight.length > 0) {
        setIsCompleted(true)
      } else {
        setIsCompleted(false)
      }
    } else {
      setWeight(sanitizedValue)
      if (reps.length > 0 && sanitizedValue.length > 0) {
        setIsCompleted(true)
      } else {
        setIsCompleted(false)
      }
    }
  }

  return (
    <AnimateChangeInHeight>
      <div
        className={cn(
          sharedLayoutStyles,
          'rounded-t-md bg-muted dark:bg-card/50 pb-2 -mb-2',
        )}
      >
        <div className="min-w-2.5"></div>
        <div className="text-xs text-muted-foreground text-center">
          {repRange}
        </div>
        <div className="text-xs text-muted-foreground text-center">
          {set.weight}
        </div>
        <div />
        <div className="w-4" />
      </div>

      <div
        className={cn(
          sharedLayoutStyles,
          'rounded-md border dark:border-0 border-border bg-background dark:bg-card text-primary',
        )}
      >
        <div className="min-w-2.5">{set.order}.</div>

        <Input
          id={`set-${set.id}-reps`}
          value={reps}
          onChange={(e) => handleInputChange(e, 'reps')}
          variant="ghost"
          inputMode="decimal"
        />

        <Input
          id={`set-${set.id}-weight`}
          value={weight}
          onChange={(e) => handleInputChange(e, 'weight')}
          variant="ghost"
          inputMode="decimal"
        />

        <div className="text-sm text-muted-foreground text-center">
          {set.rpe}
        </div>

        <Label>
          <Checkbox
            key={isCompleted.toString()}
            checked={isExerciseCompleted || isCompleted}
            onCheckedChange={handleMarkAsCompleted}
            className="cursor-pointer"
            disabled={isMarkingSet}
          />
        </Label>
      </div>

      {isExpanded &&
        previousLogs.map((exercise) => {
          const thisSet = exercise.sets[set.order - 1]
          return (
            <div
              key={thisSet.id}
              className="w-full bg-muted/50 p-2 -mt-2 rounded-b-md grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-3 items-center"
            >
              <div className="min-w-2.5 text-xs">
                Week {exercise.performedOnWeekNumber}
              </div>
              <div className="text-sm text-muted-foreground">
                {thisSet.log?.reps || '-'}
              </div>
              <div className="text-sm text-muted-foreground">
                {thisSet.log?.weight || '-'}
              </div>
              <div className="text-sm text-muted-foreground"></div>
              <div className="w-4"></div>
            </div>
          )
        })}
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
          <div className="flex items-center gap-2">
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
