import { debounce } from 'lodash'
import { ListCollapseIcon, NotebookTextIcon } from 'lucide-react'
import { useParams } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'

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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VideoPreview } from '@/components/video-preview'
import { useWorkout } from '@/context/workout-context/workout-context'
import {
  useFitspaceGetWorkoutQuery,
  useFitspaceMarkSetAsCompletedMutation,
  useFitspaceUpdateSetLogMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

// import { formatNumberInput } from '@/lib/format-tempo'

import { WorkoutExercise } from './workout-page.client'

interface ExerciseProps {
  exercise: WorkoutExercise
}

export function Exercise({ exercise }: ExerciseProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { getPastLogs } = useWorkout()
  const previousLogs = getPastLogs(exercise)
  return (
    <div>
      <ExerciseHeader
        exercise={exercise}
        setIsExpanded={setIsExpanded}
        hasLogs={previousLogs.length > 0}
      />
      <ExerciseSets
        exercise={exercise}
        isExpanded={isExpanded}
        previousLogs={previousLogs}
      />
    </div>
  )
}

function ExerciseHeader({
  exercise,
  setIsExpanded,
  hasLogs,
}: {
  exercise: WorkoutExercise
  setIsExpanded: React.Dispatch<React.SetStateAction<boolean>>
  hasLogs: boolean
}) {
  return (
    <div>
      <h3 className={`text-md font-medium`}>{exercise.name}</h3>
      <div className="flex items-start justify-between gap-4 mt-2">
        <div>
          <Badge variant="outline" size="sm">
            {exercise.warmupSets ?? 0} warmup sets
          </Badge>
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
          )}
          {/* <Button variant="secondary" iconOnly={<MoreHorizontal />} /> */}
        </div>
      </div>
    </div>
  )
}

const sharedLayoutStyles = cn(
  'w-full py-1 px-2.5 grid grid-cols-[auto_1fr_1fr_1fr_auto] gap-3 items-center',
)

function ExerciseSets({
  exercise,
  isExpanded,
  previousLogs,
}: {
  exercise: WorkoutExercise
  isExpanded: boolean
  previousLogs: (WorkoutExercise & {
    performedOnWeekNumber: number
    performedOnDayNumber: number
  })[]
}) {
  return (
    <div className="flex flex-col mt-4">
      <div className={cn(sharedLayoutStyles, 'text-xs text-muted-foreground')}>
        <div className="min-w-2.5"></div>
        <div className="text-center">Reps</div>
        <div className="text-center">Weight</div>
        <div className="text-center">RPE</div>

        <div className="w-4"></div>
      </div>
      <div className="flex flex-col gap-2">
        {exercise.sets.map((set) => (
          <ExerciseSet
            key={set.id}
            set={set}
            previousLogs={previousLogs}
            isExpanded={isExpanded}
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
}: {
  set: WorkoutExercise['sets'][number]
  previousLogs: (WorkoutExercise & {
    performedOnWeekNumber: number
    performedOnDayNumber: number
  })[]
  isExpanded: boolean
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

  const debouncedUpdate = useMemo(
    () =>
      debounce(async (repsValue: string, weightValue: string) => {
        if (!hasUserEdited.current) return
        await updateSetLog({
          input: {
            setId: set.id,
            loggedReps: repsValue ? +repsValue : undefined,
            loggedWeight: weightValue ? +weightValue : undefined,
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
    hasUserEdited.current = true
    if (key === 'reps') {
      setReps(e.target.value.replace(/[^0-9]/g, ''))
    } else {
      setWeight(e.target.value.replace(/[^0-9.]/g, ''))
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
        />

        <Input
          id={`set-${set.id}-weight`}
          value={weight}
          onChange={(e) => handleInputChange(e, 'weight')}
          variant="ghost"
        />

        <div className="text-sm text-muted-foreground text-center">
          {set.rpe}
        </div>

        <Label>
          <Checkbox
            checked={isCompleted}
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
