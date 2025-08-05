import {
  ArrowLeftRight,
  Check,
  FlameIcon,
  GaugeIcon,
  MoreHorizontalIcon,
  Replace,
  TrashIcon,
} from 'lucide-react'
import { useParams } from 'next/navigation'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { VideoPreview } from '@/components/video-preview'
import {
  GQLExerciseType,
  useFitspaceGetWorkoutQuery,
  useFitspaceMarkSetAsCompletedMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { ExerciseNotebook } from './exercise-notebook'
import { ExerciseMetadataProps } from './types'

export function ExerciseMetadata({
  exercise,
  handleMarkAsCompleted,
  isCompleted,
  handleRemoveExercise,
  isRemoving,
}: ExerciseMetadataProps) {
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
      <div className="flex gap-2 mb-6">
        {exercise.restSeconds && (
          <CountdownTimer
            variant="tertiary"
            restDuration={exercise.restSeconds}
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
              variant="tertiary"
              url={exercise.substitutedBy?.videoUrl || exercise.videoUrl || ''}
            />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="tertiary" iconOnly={<MoreHorizontalIcon />} />
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

      {exercise.additionalInstructions && (
        <div className="text-xs text-muted-foreground bg-muted/50 p-2 rounded mb-2">
          <p className="whitespace-pre-wrap">
            {exercise.additionalInstructions}
          </p>
        </div>
      )}

      <div className={cn('flex flex-wrap gap-2')}>
        {isSuperset && (
          <Badge variant="secondary" size="md">
            <ArrowLeftRight className="text-red-500" />
            Superset A/B
          </Badge>
        )}
        {exercise.warmupSets && (
          <Badge variant="secondary" size="md">
            <FlameIcon className="text-amber-500" />
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
    </div>
  )
}
