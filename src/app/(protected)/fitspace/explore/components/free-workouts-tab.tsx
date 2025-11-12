'use client'

import { useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Dumbbell, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { startTransition, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { BiggyIcon } from '@/components/biggy-icon'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useStartFreeWorkoutDayMutation } from '@/generated/graphql-client'
import { queryInvalidation } from '@/lib/query-invalidation'
import { cn } from '@/lib/utils'
import { estimateWorkoutTime } from '@/lib/workout/esimate-workout-time'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'
import { formatUserCount } from '@/utils/format-user-count'

import { FreeWorkoutDay, PublicTrainingPlan } from './explore.client'
import { UnifiedPreviewDrawer } from './workout-day-preview/unified-preview-drawer'

interface FreeWorkoutsTabProps {
  initialWorkouts: FreeWorkoutDay[]
  initialWorkoutId?: string | null
  onAssignTemplate: (planId: string) => void
  isAssigning: boolean
  availablePlans: PublicTrainingPlan[]
}

export function FreeWorkoutsTab({
  initialWorkouts,
  initialWorkoutId,
  onAssignTemplate,
  isAssigning,
  availablePlans,
}: FreeWorkoutsTabProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [selectedDayId, setSelectedDayId] = useState<string | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  const { mutateAsync: startWorkoutDay, isPending: isStarting } =
    useStartFreeWorkoutDayMutation({
      onSuccess: async (data) => {
        if (!data.startFreeWorkoutDay) return

        const { weekId, dayId } = data.startFreeWorkoutDay

        await queryInvalidation.favouriteWorkoutStart(queryClient)

        setIsPreviewOpen(false)

        startTransition(() => {
          router.push(
            `/fitspace/workout/quick-workout?week=${weekId}&day=${dayId}`,
          )
          router.refresh()
        })
      },
    })

  const freeWorkoutDays = initialWorkouts

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
    <div className="space-y-4">
      <div className="space-y-3">
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
      </div>

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
        onAssignTemplate={onAssignTemplate}
        isAssigning={isAssigning}
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
  const timesStarted = day.trainingDay?.timesStarted || 0

  // Calculate estimated duration from exercises
  const estimatedDuration = useMemo(() => {
    if (!day.trainingDay?.exercises) return null
    return estimateWorkoutTime(day.trainingDay.exercises)
  }, [day.trainingDay?.exercises])

  return (
    <Card
      className={cn(
        'cursor-pointer hover:border-primary/50 transition-all overflow-hidden',
        'group relative dark border-none',
      )}
      onClick={onClick}
    >
      {day.heroImageUrl && (
        <div className="absolute inset-0 opacity-100 group-hover:opacity-30 transition-opacity overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${day.heroImageUrl})`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
        </div>
      )}

      <CardHeader className="relative">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl text-foreground">
              {formatWorkoutType(workoutType) || 'Workout'}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{planTitle}</span>
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="relative">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <span>{exerciseCount} exercises</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            {estimatedDuration && (
              <div className="flex items-center gap-2 text-sm text-foreground">
                <span>{estimatedDuration} mins workout</span>
              </div>
            )}
            {timesStarted > 0 && (
              <Badge className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{formatUserCount(timesStarted)}</span>
              </Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
