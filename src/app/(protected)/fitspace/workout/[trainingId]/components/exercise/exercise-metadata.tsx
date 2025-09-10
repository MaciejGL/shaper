import {
  ArrowLeftRight,
  CheckIcon,
  FlameIcon,
  GaugeIcon,
  InfoIcon,
  MoreHorizontalIcon,
  Replace,
  TimerIcon,
  TrashIcon,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatSecondsToMMSS } from '@/components/ui/countdown-timer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  GQLExerciseType,
  useFitspaceGetWorkoutQuery,
  useFitspaceSwapExerciseMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { SwapExerciseDrawer } from '../swap-exercise-drawer'

import { ExerciseDetailDrawer } from './exercise-detail-drawer'
import { ExerciseNotebook } from './exercise-notebook'
import { ExerciseMetadataProps } from './types'

export function ExerciseMetadata({
  exercise,
  handleMarkAsCompleted,
  isCompleted,
  handleRemoveExercise,
  isRemoving,
}: ExerciseMetadataProps) {
  const [isSwapExerciseOpen, setIsSwapExerciseOpen] = useState(false)
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<
    string | null
  >(null)

  const { trainingId } = useParams<{ trainingId: string }>()
  const invalidateQuery = useInvalidateQuery()

  const { mutateAsync: swapExercise, isPending: isSwapping } =
    useFitspaceSwapExerciseMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutQuery.getKey({ trainingId }),
        })
      },
    })

  const handleSwapExercise = async () => {
    if (!selectedSubstituteId) return

    await swapExercise({
      exerciseId: exercise.id,
      substituteId: selectedSubstituteId,
    })
    setIsSwapExerciseOpen(false)
    setSelectedSubstituteId(null)
  }

  const isSuperset =
    exercise.type === GQLExerciseType.Superset_1A ||
    exercise.type === GQLExerciseType.Superset_1B

  return (
    <div>
      <div className="flex gap-2 items-start pl-1">
        <p className="text-lg font-medium self-center line-clamp-2">
          {exercise.name}
        </p>

        <div className="flex gap-2 ml-auto">
          <ExerciseDetailDrawer exercise={exercise} />
          <ExerciseNotebook exercise={exercise} />
          <DropdownMenu>
            <DropdownMenuTrigger
              asChild
              className={cn(
                exercise.substitutes.length === 0 && !exercise.isExtra
                  ? 'hidden'
                  : '',
              )}
            >
              <Button
                variant="tertiary"
                size="icon-sm"
                iconOnly={<MoreHorizontalIcon />}
              />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
          <Button
            variant="tertiary"
            size="sm"
            iconOnly={
              <CheckIcon className={cn(isCompleted && 'text-green-600')} />
            }
            onClick={() => handleMarkAsCompleted(!isCompleted)}
            className="self-start"
          />
        </div>
      </div>

      <div className={cn('flex flex-wrap gap-2 mt-8 empty:hidden')}>
        {isSuperset && (
          <Badge variant="secondary" size="md">
            <ArrowLeftRight className="text-red-500" />
            Superset A/B
          </Badge>
        )}
        {exercise.restSeconds && (
          <Badge variant="secondary" size="md">
            <TimerIcon className="text-amber-500" />
            {formatSecondsToMMSS(exercise.restSeconds, {
              hideEmptyMinutes: true,
            })}{' '}
            rest
          </Badge>
        )}
        {exercise.warmupSets && (
          <Badge variant="secondary" size="md">
            <FlameIcon className="text-amber-600" />
            {exercise.warmupSets} warmup{exercise.warmupSets > 1 ? 's' : ''}
          </Badge>
        )}

        {exercise.tempo && (
          <Badge variant="secondary" size="md">
            <GaugeIcon className="text-green-500" />
            {exercise.tempo}
          </Badge>
        )}
      </div>

      {exercise.additionalInstructions && (
        <div className="text-xs dark:text-muted-foreground bg-muted/50 p-2 rounded mt-2 flex items-center gap-2">
          <InfoIcon className="size-3 text-blue-500 flex-shrink-0" />
          <p className="whitespace-pre-wrap">
            {exercise.additionalInstructions}
          </p>
        </div>
      )}

      <SwapExerciseDrawer
        exercise={exercise}
        isOpen={isSwapExerciseOpen}
        onOpenChange={setIsSwapExerciseOpen}
        selectedSubstituteId={selectedSubstituteId}
        onSelectedSubstituteIdChange={setSelectedSubstituteId}
        onSwap={handleSwapExercise}
        isSwapping={isSwapping}
      />
    </div>
  )
}
