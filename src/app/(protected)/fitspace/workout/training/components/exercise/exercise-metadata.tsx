'use client'

import {
  ArrowLeftRight,
  CheckIcon,
  FlameIcon,
  GaugeIcon,
  InfoIcon,
  MoreHorizontalIcon,
  Replace,
  TrashIcon,
} from 'lucide-react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CountdownTimer } from '@/components/ui/countdown-timer'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  GQLExerciseType,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceGetWorkoutNavigationQuery,
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
  activeTimerSetId,
  onTimerComplete,
}: ExerciseMetadataProps) {
  const [isSwapExerciseOpen, setIsSwapExerciseOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [selectedSubstituteId, setSelectedSubstituteId] = useState<
    string | null
  >(null)

  const { trainingId } = useParams<{ trainingId: string }>()
  const [dayId] = useQueryState('day')
  const invalidateQuery = useInvalidateQuery()

  const { mutateAsync: swapExercise, isPending: isSwapping } =
    useFitspaceSwapExerciseMutation({
      onSuccess: () => {
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutDayQuery.getKey({
            dayId: dayId ?? '',
          }),
        })
        invalidateQuery({
          queryKey: useFitspaceGetWorkoutNavigationQuery.getKey({ trainingId }),
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

  const handleRemoveClick = async (e: React.MouseEvent) => {
    e.preventDefault() // Prevent dropdown from closing
    await handleRemoveExercise()
    setIsDropdownOpen(false) // Close dropdown after successful removal
  }

  const isSuperset =
    exercise.type === GQLExerciseType.Superset_1A ||
    exercise.type === GQLExerciseType.Superset_1B

  return (
    <div>
      {exercise.images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 bg-black p-2">
          {exercise.images.map((image) => (
            <div
              key={image.id}
              className="relative overflow-hidden aspect-square rounded-md"
            >
              <Image
                src={image.url || image.medium || image.thumbnail || ''}
                alt={exercise.name}
                width={500}
                height={500}
                className="object-cover"
                quality={100}
                priority={true}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-2 items-start mt-4 px-2">
        <p className="text-2xl font-medium self-center">
          <span className="text-muted-foreground">{exercise.order}.</span>{' '}
          {exercise.name}
        </p>
        <div className="flex gap-2 ml-auto">
          <ExerciseDetailDrawer exercise={exercise} />
          <ExerciseNotebook exercise={exercise} />
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
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
                size="icon-md"
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
                  onClick={handleRemoveClick}
                  loading={isRemoving}
                  disabled={isRemoving}
                >
                  <TrashIcon /> Remove exercise
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="tertiary"
            size="icon-md"
            iconOnly={
              <CheckIcon className={cn(isCompleted && 'text-green-600')} />
            }
            onClick={() => handleMarkAsCompleted(!isCompleted)}
            className={cn(
              'self-start',
              isCompleted &&
                'bg-green-500/20 dark:bg-green-500/20 hover:bg-green-500/20 dark:hover:bg-green-500/20',
            )}
          />
        </div>
      </div>

      {exercise.additionalInstructions && (
        <div className="text-sm dark:text-muted-foreground  flex items-center gap-2 my-4 mx-2">
          <InfoIcon className="size-3 text-blue-500 flex-shrink-0 self-start mt-0.5" />
          <p className="whitespace-pre-wrap">
            {exercise.additionalInstructions}
          </p>
        </div>
      )}

      <div className={cn('flex flex-wrap gap-2 mt-8 mb-4 empty:hidden px-2')}>
        {isSuperset && (
          <Badge variant="secondary" size="md">
            <ArrowLeftRight className="text-red-500" />
            Superset A/B
          </Badge>
        )}
        {exercise.warmupSets && (
          <Badge variant="secondary" size="md">
            <FlameIcon className="text-amber-600" />
            {exercise.warmupSets} warmup
            {exercise.warmupSets > 1 ? 's' : ''}
          </Badge>
        )}

        {exercise.tempo && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge
                variant="secondary"
                size="md"
                className="cursor-pointer h-full"
              >
                <GaugeIcon className="text-green-500" />
                Tempo {exercise.tempo}
              </Badge>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <div className="space-y-2">
                <p className="font-medium mb-1 text-sm">Exercise Tempo</p>
                <div className="text-sm">
                  <p className="mb-1">
                    <strong>4-digit format:</strong> 3-1-2-1
                  </p>
                  <ul className="space-y-1 text-xs leading-relaxed list-disc list-outside pl-4">
                    <li>3 sec down (eccentric)</li>
                    <li>1 sec pause at bottom</li>
                    <li>2 sec up (concentric)</li>
                    <li>1 sec pause at top</li>
                  </ul>
                  <p className="mt-2 mb-1 text-sm">
                    <strong>Examples:</strong>
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 list-disc list-outside pl-4 leading-relaxed">
                    <li>
                      <strong>Squat:</strong> 3 sec down, 1 sec pause at bottom,
                      2 sec stand up, 1 sec pause at top
                    </li>
                    <li>
                      <strong>Bicep curl:</strong> 3 sec lower weight, 1 sec
                      pause at bottom, 2 sec curl up, 1 sec pause at top
                    </li>
                    <li>
                      <strong>Bench press:</strong> 3 sec lower to chest, 1 sec
                      pause, 2 sec press up, 1 sec pause at top
                    </li>
                  </ul>
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        )}
        {exercise.restSeconds && (
          <div className="ml-auto">
            <CountdownTimer
              key={activeTimerSetId}
              restDuration={exercise.restSeconds}
              autoStart={activeTimerSetId !== null}
              onComplete={onTimerComplete}
              onPause={onTimerComplete}
              size="sm"
              className="w-auto"
            />
          </div>
        )}
      </div>

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
