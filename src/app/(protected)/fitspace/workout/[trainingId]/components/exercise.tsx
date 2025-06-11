import { debounce } from 'lodash'
import {
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
}

export function Exercise({ exercise }: ExerciseProps) {
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
    <div className="pt-4">
      <ExerciseHeader
        exercise={exercise}
        setIsExpanded={setIsExpanded}
        hasLogs={previousLogs.length > 0}
        isCompleted={isExerciseCompleted}
        handleMarkAsCompleted={handleMarkAsCompleted}
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
  setIsExpanded,
  hasLogs,
  isCompleted,
  handleMarkAsCompleted,
}: {
  exercise: WorkoutExercise
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>
  hasLogs: boolean
  isCompleted: boolean
  handleMarkAsCompleted: (checked: boolean) => void
}) {
  const [activeExerciseId, setActiveExerciseId] = useQueryState('exercise')

  const restDuration = exercise.restSeconds
    ? convertSecondsToTimeString(exercise.restSeconds)
    : null
  return (
    <div>
      <ExerciseSelector
        exercise={exercise}
        activeExerciseId={activeExerciseId}
        setActiveExerciseId={setActiveExerciseId}
      />
      <div className="flex items-start justify-between gap-4 mt-2">
        <div className="flex flex-wrap gap-2">
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
      <DropdownMenuTrigger className="group/dropdown">
        <div className="text-sm flex items-start gap-2 pr-2">
          <h3 className={`text-lg font-medium text-left pb-1`}>
            {exercise.name}
          </h3>
          <ChevronDown
            className={cn(
              'text-muted-foreground size-4 mt-2 group-hover/dropdown:text-primary transition-all duration-200 shrink-0',
            )}
          />
        </div>
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
  const { mutateAsync: updateSetLog } = useFitspaceUpdateSetLogMutation({
    onSuccess: () => {
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
