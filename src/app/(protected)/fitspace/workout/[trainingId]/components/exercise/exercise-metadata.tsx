import {
  ArrowLeftRight,
  CheckCircle,
  CheckIcon,
  FlameIcon,
  GaugeIcon,
  InfoIcon,
  Lightbulb,
  MoreHorizontalIcon,
  Replace,
  Target,
  TimerIcon,
  TrashIcon,
  VideoIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatSecondsToMMSS } from '@/components/ui/countdown-timer'
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
  useFitspaceSwapExerciseMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { SwapExerciseDrawer } from '../swap-exercise-drawer'

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
          <Drawer>
            <DrawerTrigger asChild>
              <Button
                variant="tertiary"
                size="icon-sm"
                iconOnly={<VideoIcon />}
              />
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
                    <p className="text-sm dark:text-muted-foreground leading-relaxed p-4 rounded-lg bg-card-on-card">
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
                      <p className="text-sm dark:text-muted-foreground leading-relaxed p-4 rounded-lg bg-card-on-card">
                        {exercise.instructions[0]}
                      </p>
                    </div>

                    {/* Execution */}
                    <div className="flex items-start gap-3 flex-col">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="size-4 text-green-600 flex-shrink-0" />
                        <h3 className="font-medium">Execution</h3>
                      </div>
                      <p className="text-sm dark:text-muted-foreground leading-relaxed p-4 rounded-lg bg-card-on-card">
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
                          <p className="text-sm dark:text-muted-foreground leading-relaxed p-4 rounded-lg bg-card-on-card">
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
