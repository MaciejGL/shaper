'use client'

import { ChevronRight, Crown } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

import { ExerciseMediaPreview } from '@/components/exercise-media-preview'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DrawerFooter } from '@/components/ui/drawer'
import {
  GQLWorkoutType,
  useFitspaceGetActivePlanIdQuery,
} from '@/generated/graphql-client'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

import { WorkoutDay } from './types'

interface WorkoutDayPreviewContentProps {
  day: WorkoutDay
  onStartWorkout: (dayId: string) => void
  isStarting: boolean
  onNavigateToPlan: (planId: string) => void
  onClose: () => void
}

export function WorkoutDayPreviewContent({
  day,
  onStartWorkout,
  isStarting,
  onNavigateToPlan,
  onClose,
}: WorkoutDayPreviewContentProps) {
  const { data: activePlanData } = useFitspaceGetActivePlanIdQuery()
  const hasActivePlan = !!activePlanData?.getActivePlanId

  const workoutType = day.trainingDay?.workoutType || 'Workout'
  const planTitle = day.plan?.title || 'Training Plan'
  const trainerName =
    day.plan?.createdBy?.firstName ||
    `${day.plan?.createdBy?.firstName || ''} ${day.plan?.createdBy?.lastName || ''}`.trim() ||
    'Unknown Trainer'
  const exercises = day.trainingDay?.exercises || []
  const isPlanPremium = day.plan?.premium || false

  const handleViewFullPlan = () => {
    if (!day.plan?.id) return
    onNavigateToPlan(day.plan.id)
  }

  const handleStartWorkoutClick = () => {
    if (hasActivePlan) {
      toast.error(
        "Can't add to Quick Workout while you have an active training plan",
      )
      return
    }
    onStartWorkout(day.trainingDayId)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="overflow-y-auto overflow-x-hidden flex-1">
        {day.heroImageUrl && (
          <HeroImage
            imageUrl={day.heroImageUrl}
            workoutType={workoutType}
            planTitle={planTitle}
            trainerName={trainerName}
            onViewPlan={handleViewFullPlan}
          />
        )}

        <div className="px-4 py-6 space-y-6">
          <ExercisesList exercises={exercises} />
          {day.plan && (
            <PlanPromotion
              planTitle={planTitle}
              isPremium={isPlanPremium}
              onViewPlan={handleViewFullPlan}
            />
          )}
        </div>
      </div>

      <WorkoutDayActions
        onStart={handleStartWorkoutClick}
        onClose={onClose}
        isStarting={isStarting}
      />
    </div>
  )
}

interface HeroImageProps {
  imageUrl: string
  workoutType: string
  planTitle?: string
  trainerName: string
  onViewPlan: () => void
}

function HeroImage({
  imageUrl,
  workoutType,
  planTitle,
  trainerName,
  onViewPlan,
}: HeroImageProps) {
  return (
    <div className="relative h-52 w-full overflow-hidden rounded-t-2xl">
      <Image
        src={imageUrl}
        alt={`${workoutType} workout`}
        fill
        className="object-cover"
        quality={100}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h2 className="text-2xl font-semibold mb-2">
          {formatWorkoutType(workoutType as GQLWorkoutType)}
        </h2>
        <div className="flex justify-between gap-1 text-white/80">
          {planTitle && (
            <button
              onClick={onViewPlan}
              className="font-medium text-white hover:text-primary underline-offset-2 hover:underline flex items-center gap-1 text-sm cursor-pointer"
            >
              <span className="text-muted-foreground">From</span> {planTitle}
              <ChevronRight className="size-4" />
            </button>
          )}
          <span className="text-sm">by {trainerName}</span>
        </div>
      </div>
    </div>
  )
}

interface ExercisesListProps {
  exercises: NonNullable<WorkoutDay['trainingDay']>['exercises']
}

function ExercisesList({ exercises }: ExercisesListProps) {
  return (
    <div className="space-y-2">
      {exercises.map((exercise) => (
        <div key={exercise.id} className="flex items-center gap-3">
          <ExerciseMediaPreview
            images={exercise.images}
            videoUrl={exercise.videoUrl}
            alt={exercise.name}
          />
          <div className="flex-1 min-w-0">
            <p className="font-medium">{exercise.name}</p>
            <p className="text-sm text-muted-foreground">
              {exercise.sets.length} sets
              {exercise.sets[0]?.reps && ` x ${exercise.sets[0].reps} reps`}
              {exercise.sets[0]?.minReps &&
                exercise.sets[0]?.maxReps &&
                ` x ${exercise.sets[0].minReps}-${exercise.sets[0].maxReps} reps`}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

interface PlanPromotionProps {
  planTitle: string
  isPremium: boolean
  onViewPlan: () => void
}

function PlanPromotion({
  planTitle,
  isPremium,
  onViewPlan,
}: PlanPromotionProps) {
  return (
    <Card variant="premium">
      <CardContent>
        <div className="flex items-start gap-3">
          {isPremium && (
            <Crown className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          )}
          <div className="space-y-2 flex-1">
            <p className="font-semibold">
              Love this workout? Get the full plan!
            </p>
            <p className="text-sm text-muted-foreground">
              {planTitle} includes structured training to help you reach your
              goals.
            </p>
          </div>
        </div>
        <Button
          variant="gradient"
          size="sm"
          onClick={onViewPlan}
          className="w-full mt-4"
        >
          View Full Plan
        </Button>
      </CardContent>
    </Card>
  )
}

interface WorkoutDayActionsProps {
  onStart: () => void
  onClose: () => void
  isStarting: boolean
}

function WorkoutDayActions({
  onStart,
  onClose,
  isStarting,
}: WorkoutDayActionsProps) {
  return (
    <DrawerFooter className="border-t">
      <Button
        onClick={onStart}
        disabled={isStarting}
        loading={isStarting}
        className="w-full"
      >
        Start Workout
      </Button>
      <Button variant="outline" onClick={onClose} disabled={isStarting}>
        Close
      </Button>
    </DrawerFooter>
  )
}
