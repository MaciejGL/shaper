import { debounce } from 'lodash'
import {
  ListCollapseIcon,
  MoreHorizontal,
  NotebookTextIcon,
} from 'lucide-react'
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
import { VideoPreview } from '@/components/video-preview'
import {
  useFitspaceGetWorkoutQuery,
  useFitspaceMarkSetAsCompletedMutation,
  useFitspaceUpdateSetLogMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'

// import { formatNumberInput } from '@/lib/format-tempo'

import { WorkoutExercise } from './workout-page.client'

interface ExerciseProps {
  exercise: WorkoutExercise
}

export function Exercise({ exercise }: ExerciseProps) {
  return (
    <div>
      <ExerciseHeader exercise={exercise} />
      <ExerciseSets sets={exercise.sets} />
    </div>
  )
}

function ExerciseHeader({ exercise }: { exercise: WorkoutExercise }) {
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
          {exercise.instructions && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="secondary" iconOnly={<NotebookTextIcon />} />
              </DialogTrigger>
              <DialogContent dialogTitle={exercise.name}>
                <DialogHeader>
                  <DialogTitle>{exercise.name}</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  <div className="whitespace-pre-wrap">
                    {exercise.instructions}
                  </div>
                </DialogDescription>
              </DialogContent>
            </Dialog>
          )}
          <Button variant="secondary" iconOnly={<MoreHorizontal />} />
        </div>
      </div>
    </div>
  )
}

function ExerciseSets({ sets }: { sets: WorkoutExercise['sets'] }) {
  return (
    <div className="flex flex-col mt-4">
      <div className="w-full py-1 px-2.5 grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-3 items-center text-xs text-muted-foreground">
        <div className="min-w-2.5"></div>
        <div>Reps</div>
        <div>Weight</div>
        <div>RPE</div>

        <div className="w-9"></div>
        <div className="w-9"></div>
      </div>
      <div className="flex flex-col gap-2">
        {sets.map((set) => (
          <ExerciseSet key={set.id} set={set} />
        ))}
      </div>
    </div>
  )
}

function ExerciseSet({ set }: { set: WorkoutExercise['sets'][number] }) {
  const [isExpanded, setIsExpanded] = useState(false)
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
      <div className="relative z-0 w-full py-1 px-2.5 rounded-t-md bg-muted dark:bg-card/50 pb-2 -mb-2 grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-3 items-center">
        <div className="min-w-2.5"></div>
        <div className="text-xs text-muted-foreground">{repRange}</div>
      </div>

      <div
        className={`relative z-10 w-full py-1 px-2.5 rounded-md border dark:border-0 border-border bg-background dark:bg-card text-primary grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-3 items-center`}
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

        <div className="text-sm text-muted-foreground">{set.rpe}</div>

        <Button
          variant="ghost"
          iconOnly={<ListCollapseIcon />}
          onClick={() => setIsExpanded((prev) => !prev)}
        />

        {/* <Button
          variant={isCompleted ? 'outline' : 'ghost'}
          iconOnly=}
          onClick={handleMarkAsCompleted}
          loading={isMarkingSet}
          disabled={isCompleted}
        /> */}
        {
          <Checkbox
            checked={isCompleted}
            onCheckedChange={handleMarkAsCompleted}
          />
        }
      </div>

      {isExpanded && (
        <div className="w-full bg-muted/50 p-2 -mt-2 rounded-b-md grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] gap-3 items-center">
          <div className="min-w-2.5"></div>
          <div className="text-sm text-muted-foreground">Logged</div>
          <div className="text-sm text-muted-foreground">{weight || '-'}</div>
          <div className="text-sm text-muted-foreground">{reps || '-'}</div>
          <div className="w-9"></div>
          <div className="w-9"></div>
        </div>
      )}
    </AnimateChangeInHeight>
  )
}
