'use client'

import {
  ArrowLeftRight,
  CheckIcon,
  GaugeIcon,
  MoreHorizontalIcon,
  Replace,
  TrashIcon,
} from 'lucide-react'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import React, { useMemo, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Carousel,
  CarouselContent,
  CarouselDots,
  CarouselItem,
} from '@/components/ui/carousel'
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
import { useUserPreferences } from '@/context/user-preferences-context'
import {
  GQLExerciseType,
  useFitspaceGetWorkoutDayQuery,
  useFitspaceGetWorkoutNavigationQuery,
  useFitspaceSwapExerciseMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { ExerciseMetadataProps } from './types'

const SwapExerciseDrawer = dynamic(
  () => import('../swap-exercise-drawer').then((m) => m.SwapExerciseDrawer),
  { ssr: false },
)

const ExerciseDetailDrawer = dynamic(
  () => import('./exercise-detail-drawer').then((m) => m.ExerciseDetailDrawer),
  { ssr: false },
)

const ExerciseNotebook = dynamic(
  () => import('./exercise-notebook').then((m) => m.ExerciseNotebook),
  { ssr: false },
)

export function ExerciseMetadata({
  exercise,
  exercises,
  handleMarkAsCompleted,
  isCompleted,
  handleRemoveExercise,
  isRemoving,
  activeTimerSetId,
  onTimerComplete,
}: ExerciseMetadataProps) {
  const { preferences } = useUserPreferences()
  const showImages = preferences.showImages ?? true

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

  const supersetInfo = useMemo(() => {
    if (!isSuperset) return null

    if (!exercises) {
      return {
        type: exercise.type === GQLExerciseType.Superset_1A ? 'A' : 'B',
        group: 1,
      }
    }

    const supersetExercises = exercises
      .filter(
        (e) =>
          e.type === GQLExerciseType.Superset_1A ||
          e.type === GQLExerciseType.Superset_1B,
      )
      .sort((a, b) => a.order - b.order)

    let currentGroupIndex = 1
    let lastType: GQLExerciseType | null | undefined = null
    const map = new Map<string, { type: 'A' | 'B'; group: number }>()

    for (const ex of supersetExercises) {
      if (
        ex.type === GQLExerciseType.Superset_1A &&
        lastType === GQLExerciseType.Superset_1B
      ) {
        currentGroupIndex++
      }

      map.set(ex.id, {
        type: ex.type === GQLExerciseType.Superset_1A ? 'A' : 'B',
        group: currentGroupIndex,
      })
      lastType = ex.type
    }

    return map.get(exercise.id)
  }, [exercise.id, exercise.type, exercises, isSuperset])

  return (
    <div className="border-t border-border">
      {showImages && exercise.images.length > 0 && (
        <Carousel
          opts={{
            align: 'center',
            dragFree: true,
            active: exercise.images.length > 2,
          }}
          className="max-w-md md:w-[calc(100%+2rem)] bg-black py-2 space-y-3"
        >
          <CarouselContent className="ml-0 pr-2">
            {exercise.images.map((image, imageIndex) => {
              const src = image.medium || image.url
              if (!src) return null

              const isPriority = exercise.order === 1 && imageIndex < 2

              return (
                <CarouselItem key={image.id} className="basis-1/2 px-0">
                  <div className="relative overflow-hidden aspect-square rounded-md ml-2">
                    <Image
                      src={src}
                      alt={exercise.name}
                      width={384}
                      height={384}
                      className="object-cover"
                      priority={isPriority}
                      sizes="(max-width: 768px) 50vw, 33vw"
                    />
                  </div>
                </CarouselItem>
              )
            })}
            <div className="w-2 shrink-0" />
          </CarouselContent>

          {exercise.images.length > 2 && (
            <CarouselDots count={exercise.images.length} className="px-4" />
          )}
        </Carousel>
      )}
      <div className="flex gap-2 items-start mt-4 px-3">
        <p className="text-2xl font-medium">
          <span className="text-muted-foreground">{exercise.order}.</span>{' '}
          {exercise.name}
        </p>
      </div>

      {exercise.additionalInstructions && (
        <div className="text-sm font-medium dark:text-muted-foreground flex items-center gap-2 my-4 mx-4">
          <p className="whitespace-pre-wrap">
            {exercise.additionalInstructions.replaceAll(' .', '.')}
          </p>
        </div>
      )}
      <div className="px-3 empty:hidden mt-12 mb-3">
        <div className="flex flex-wrap gap-2 mb-3 empty:hidden">
          {supersetInfo && (
            <Badge
              variant="secondary"
              size="lg"
              className="bg-card dark:bg-card-on-card shadow-xs"
            >
              <ArrowLeftRight
                className={cn(
                  'mr-1',
                  supersetInfo.type === 'A' ? 'text-red-500' : 'text-blue-500',
                )}
              />
              Superset {supersetInfo.group > 1 ? `${supersetInfo.group}` : ''}
              {supersetInfo.type}
            </Badge>
          )}

          {exercise.tempo && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="secondary"
                  size="lg"
                  className="cursor-pointer h-full bg-card dark:bg-card-on-card shadow-xs"
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
                        <strong>Squat:</strong> 3 sec down, 1 sec pause at
                        bottom, 2 sec stand up, 1 sec pause at top
                      </li>
                      <li>
                        <strong>Bicep curl:</strong> 3 sec lower weight, 1 sec
                        pause at bottom, 2 sec curl up, 1 sec pause at top
                      </li>
                      <li>
                        <strong>Bench press:</strong> 3 sec lower to chest, 1
                        sec pause, 2 sec press up, 1 sec pause at top
                      </li>
                    </ul>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
        <div className={cn('flex flex-wrap gap-2 empty:hidden')}>
          {exercise.restSeconds && (
            <CountdownTimer
              key={activeTimerSetId}
              restDuration={exercise.restSeconds}
              autoStart={activeTimerSetId !== null}
              onComplete={onTimerComplete}
              onPause={onTimerComplete}
              size="md"
              variant="secondary"
              className="w-auto"
            />
          )}
          <div className="flex gap-2 ml-auto">
            <ExerciseDetailDrawer exercise={exercise} />
            <ExerciseNotebook exercise={exercise} />
            <DropdownMenu
              open={isDropdownOpen}
              onOpenChange={setIsDropdownOpen}
            >
              <DropdownMenuTrigger
                asChild
                className={cn(
                  exercise.substitutes.length === 0 && !exercise.isExtra
                    ? 'hidden'
                    : '',
                )}
              >
                <Button
                  variant="secondary"
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
              variant="secondary"
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
