import {
  ArrowLeftRight,
  Check,
  CheckCircle,
  FlameIcon,
  GaugeIcon,
  InfoIcon,
  Lightbulb,
  ListVideoIcon,
  MoreHorizontalIcon,
  Replace,
  Target,
  TrashIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
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
          <Drawer>
            <DrawerTrigger asChild>
              <Button variant="tertiary" iconOnly={<ListVideoIcon />} />
            </DrawerTrigger>
            <DrawerContent dialogTitle="Exercise Metadata">
              <DrawerHeader className="pb-4">
                <div className="flex items-center justify-between gap-2">
                  <DrawerTitle className="text-xl font-semibold">
                    {exercise.name}
                  </DrawerTitle>
                  {(exercise.substitutedBy?.videoUrl || exercise.videoUrl) && (
                    <VideoPreview
                      variant="tertiary"
                      url={
                        exercise.substitutedBy?.videoUrl ||
                        exercise.videoUrl ||
                        ''
                      }
                    />
                  )}
                </div>
                {exercise.difficulty && (
                  <Badge variant="secondary" className="w-fit">
                    {exercise.difficulty}
                  </Badge>
                )}
              </DrawerHeader>

              <div className="px-4 pb-6 space-y-4 overflow-y-auto">
                {/* Exercise Images */}
                {exercise.images && exercise.images.length > 0 && (
                  <div className="grid grid-cols-2 gap-3">
                    {exercise.images.slice(0, 2).map((image, index) => (
                      <div
                        key={index}
                        className="relative aspect-square overflow-hidden rounded-lg border bg-muted/20"
                      >
                        <Image
                          src={image.url || '/placeholder.svg'}
                          alt={`${exercise.name} - Step ${index + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Description */}
                {exercise.description && (
                  <div className="flex items-start gap-3 flex-col">
                    <div className="flex items-center gap-2">
                      <InfoIcon className="size-4 text-blue-600 flex-shrink-0" />
                      <h3 className="font-medium">Description</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed p-4 rounded-lg bg-card-on-card">
                      {exercise.description}
                    </p>
                  </div>
                )}

                {/* Instructions */}
                {exercise.instructions && exercise.instructions.length >= 2 && (
                  <div className="space-y-4">
                    {/* Starting Position */}
                    <div className="flex items-start gap-3 flex-col">
                      <div className="flex items-center gap-2">
                        <Target className="size-4 text-amber-600 flex-shrink-0" />
                        <h3 className="font-medium">Starting Position</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed p-4 rounded-lg bg-card-on-card">
                        {exercise.instructions[0]}
                      </p>
                    </div>

                    {/* Execution */}
                    <div className="flex items-start gap-3 flex-col">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-600 flex-shrink-0" />
                        <h3 className="font-medium">Execution</h3>
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed p-4 rounded-lg bg-card-on-card">
                        {exercise.instructions[1]}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tips */}
                {exercise.tips && exercise.tips.length > 0 && (
                  <div className="flex items-start gap-3 flex-col">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="size-4 text-yellow-500 flex-shrink-0" />
                      <h3 className="font-medium">Tips</h3>
                    </div>
                    <ul className="space-y-2">
                      {exercise.tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <p className="text-sm text-muted-foreground leading-relaxed p-4 rounded-lg bg-card-on-card">
                            {tip}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DrawerContent>
          </Drawer>
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
