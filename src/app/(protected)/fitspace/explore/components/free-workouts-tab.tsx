'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, Dumbbell, Users } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { startTransition, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { BiggyIcon } from '@/components/biggy-icon'
import { Loader } from '@/components/loader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  GQLDifficulty,
  GQLWorkoutType,
  useStartFreeWorkoutDayMutation,
} from '@/generated/graphql-client'
import { queryInvalidation } from '@/lib/query-invalidation'
import { cn } from '@/lib/utils'
import { estimateWorkoutTime } from '@/lib/workout/estimate-workout-time'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'
import { formatUserCount, getFakeUserCount } from '@/utils/format-user-count'

import { FreeWorkoutDay, PublicTrainingPlan } from './explore.client'
import { UnifiedPreviewDrawer } from './workout-day-preview/unified-preview-drawer'

interface FreeWorkoutsTabProps {
  initialWorkouts: FreeWorkoutDay[]
  initialWorkoutId?: string | null
  availablePlans: PublicTrainingPlan[]
}

const difficultyVariantMap = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  EXPERT: 'expert',
} satisfies Partial<
  Record<GQLDifficulty, 'beginner' | 'intermediate' | 'advanced' | 'expert'>
>

export function FreeWorkoutsTab({
  initialWorkouts,
  initialWorkoutId,
  availablePlans,
}: FreeWorkoutsTabProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const { mutateAsync: startWorkoutDay, isPending: isStarting } =
    useStartFreeWorkoutDayMutation({
      onSuccess: (data) => {
        if (!data.startFreeWorkoutDay) return

        const { weekId, dayId } = data.startFreeWorkoutDay

        // Close drawer and navigate immediately - don't block on query invalidation
        // setIsPreviewOpen(false)

        startTransition(() => {
          router.refresh()
          router.push(`/fitspace/workout?week=${weekId}&day=${dayId}`)
        })

        // Invalidate queries in background (no await)
        queryInvalidation.favouriteWorkoutStart(queryClient)
      },
    })

  const freeWorkoutDays = [...initialWorkouts].sort(
    (a, b) => getFakeUserCount(b.id) - getFakeUserCount(a.id),
  )

  const handleCardClick = (dayId: string) => {
    setSelectedDayId(dayId)
    setIsPreviewOpen(true)
  }

  const handleStartWorkout = async (trainingDayId: string) => {
    try {
      await startWorkoutDay({
        input: {
          trainingDayId,
          replaceExisting: true,
        },
      })
      startTransition(() => {
        router.refresh()
        router.push(`/fitspace/workout`)
      })
    } catch (error) {
      console.error('Failed to start workout:', error)
      toast.error('Failed to start workout')
    }
  }

  useEffect(() => {
    if (initialWorkoutId && freeWorkoutDays.length > 0) {
      const workout = freeWorkoutDays.find(
        (w) => w.trainingDayId === initialWorkoutId,
      )
      if (workout) {
        setSelectedDayId(workout.id)
        setIsPreviewOpen(true)
      }
    }
  }, [initialWorkoutId, freeWorkoutDays])

  const selectedWorkout = selectedDayId
    ? freeWorkoutDays.find((d) => d.id === selectedDayId)
    : null

  if (freeWorkoutDays.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center flex-center flex-col">
          <BiggyIcon icon={Dumbbell} variant="default" />
          <p className="text-muted-foreground mt-4">
            No free workouts available yet
          </p>
          <p className="text-sm text-muted-foreground">
            Check back soon for new workout demos!
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-1 -mx-4">
      <AnimatePresence mode="popLayout" initial={false}>
        {freeWorkoutDays.map((day) => (
          <motion.div
            key={day.id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <FreeWorkoutDayCard
              day={day}
              onClick={() => handleCardClick(day.id)}
            />
          </motion.div>
        ))}
      </AnimatePresence>
      <UnifiedPreviewDrawer
        initialView={
          selectedWorkout ? { type: 'workout', data: selectedWorkout } : null
        }
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false)
        }}
        onAnimationComplete={() => {
          setSelectedDayId(null)
        }}
        onStartWorkout={handleStartWorkout}
        isStarting={isStarting}
        availablePlans={availablePlans}
      />
    </div>
  )
}

interface FreeWorkoutDayCardProps {
  day: FreeWorkoutDay
  onClick: () => void
}

function FreeWorkoutDayCard({ day, onClick }: FreeWorkoutDayCardProps) {
  const workoutType = day.trainingDay?.workoutType
  const planTitle = day.plan?.title || 'Training Plan'
  const exerciseCount = day.trainingDay?.exercisesCount || 0

  // Calculate estimated duration from exercises
  const estimatedDuration = useMemo(() => {
    if (!day.trainingDay?.exercises) return null
    return estimateWorkoutTime(day.trainingDay.exercises)
  }, [day])

  return (
    <Card
      className={cn(
        'cursor-pointer hover:border-primary/50 transition-all overflow-hidden group relative dark',
        'rounded-none shadow-none border-y-0 border-x-0',
        'bg-cover bg-center',
      )}
      onClick={onClick}
    >
      {day.heroImageUrl ? (
        <Image
          src={day.heroImageUrl}
          alt={`${formatWorkoutType(workoutType) || 'Workout'} cover`}
          fill
          className="object-cover"
          quality={100}
          sizes="(max-width: 768px) 100vw, 50vw"
        />
      ) : null}
      {day.heroImageUrl && (
        <div className="absolute -inset-[0.5px] bg-linear-to-r from-black via-black/60 to-transparent" />
      )}

      <CardHeader className="relative dark">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl text-foreground">
              {formatWorkoutType(workoutType) || 'Workout'}
            </CardTitle>
            <p className="text-sm text-muted-foreground font-medium">
              from <span className="text-foreground">{planTitle}</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative dark">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <p className="flex items-center gap-1">
              <Dumbbell className="size-4" />
              {exerciseCount} exercises
            </p>
          </div>

          <div className="flex items-center justify-between text-xs">
            {estimatedDuration && (
              <p className="flex items-center gap-1">
                <Clock className="size-4" />~{estimatedDuration} min
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 mt-2 empty:hidden">
            {day.plan?.difficulty && (
              <Badge
                variant={difficultyVariantMap[day.plan.difficulty]}
                className="capitalize"
                size="md-lg"
              >
                {day.plan.difficulty.toLowerCase()}
              </Badge>
            )}
            <Badge
              variant="glass"
              className="flex items-center gap-1 ml-auto border-transparent"
              size="md-lg"
            >
              <Users className="h-3 w-3" />
              <span>{formatUserCount(getFakeUserCount(day.id))}</span>
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Compact version for onboarding - uses pre-calculated values instead of fetching
 */
export interface CompactWorkoutCardData {
  id: string
  heroImageUrl: string
  workoutType: GQLWorkoutType
  planTitle: string
  exercisesCount: number
  estimatedMinutes: number
  difficulty: GQLDifficulty
}

interface CompactWorkoutCardProps {
  workout: CompactWorkoutCardData
  onClick: () => void
  isLoading?: boolean
}

export function CompactWorkoutCard({
  workout,
  onClick,
  isLoading,
}: CompactWorkoutCardProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      animate={
        isLoading ? { scale: 0.98, opacity: 0.8 } : { scale: 1, opacity: 1 }
      }
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Card
        className={cn(
          'cursor-pointer hover:border-primary/50 transition-all overflow-hidden group relative dark',
          'rounded-lg shadow-none',
          'bg-cover bg-center',
          'relative',
          isLoading && 'pointer-events-none',
        )}
        onClick={onClick}
      >
        {workout.heroImageUrl && (
          <Image
            src={workout.heroImageUrl}
            alt={`${formatWorkoutType(workout.workoutType) || 'Workout'} cover`}
            fill
            className="object-cover"
            quality={80}
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        )}
        {workout.heroImageUrl && (
          <div className="absolute -inset-[0.5px] bg-linear-to-r from-black via-black/60 to-transparent" />
        )}

        <CardHeader className="relative dark py-2 px-3">
          <div className="space-y-0.5">
            <CardTitle className="text-lg text-foreground">
              {formatWorkoutType(workout.workoutType) || 'Workout'}
            </CardTitle>
            <p className="text-xs text-muted-foreground font-medium">
              from <span className="text-foreground">{workout.planTitle}</span>
            </p>
          </div>
        </CardHeader>
        <CardContent className="relative dark py-2 px-3 pt-0">
          <div className="flex items-center gap-3 text-xs text-foreground">
            <span className="flex items-center gap-1">
              <Dumbbell className="size-3.5" />
              {workout.exercisesCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />~{workout.estimatedMinutes}m
            </span>
            <Badge
              variant={difficultyVariantMap[workout.difficulty]}
              className="capitalize ml-auto"
              size="sm"
            >
              {workout.difficulty.toLowerCase()}
            </Badge>
          </div>
        </CardContent>
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            {' '}
            <Loader size="md" />{' '}
          </div>
        ) : null}
      </Card>
    </motion.div>
  )
}
