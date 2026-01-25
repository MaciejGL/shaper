'use client'

import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

import { ExerciseMediaPreview } from '@/components/exercise-media-preview'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { DrawerFooter, DrawerGoBackButton } from '@/components/ui/drawer'
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
  hidePreviewPlan?: boolean
}

export function WorkoutDayPreviewContent({
  day,
  onStartWorkout,
  isStarting,
  onNavigateToPlan,
  onClose,
  hidePreviewPlan = false,
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
            hidePreviewPlan={hidePreviewPlan}
          />
        )}

        <div className="px-4 py-6 space-y-6">
          <ExercisesList exercises={exercises} />
          {day.plan && !hidePreviewPlan && (
            <PlanPromotion
              planTitle={planTitle}
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
  hidePreviewPlan?: boolean
}

function HeroImage({
  imageUrl,
  workoutType,
  planTitle,
  trainerName,
  onViewPlan,
  hidePreviewPlan = false,
}: HeroImageProps) {
  return (
    <div className="relative h-64 w-full overflow-hidden rounded-b-3xl">
      <Image
        src={imageUrl}
        alt={`${workoutType} workout`}
        fill
        className="object-cover"
        quality={100}
        sizes="(max-width: 768px) 100vw, 50vw"
      />
      <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-transparent" />
      {hidePreviewPlan && <DrawerGoBackButton />}

      <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
        <h2 className="text-2xl font-semibold mb-2">
          {formatWorkoutType(workoutType as GQLWorkoutType)}
        </h2>
        <div className="flex justify-between gap-1 text-white/80">
          {planTitle && (
            <button
              onClick={!hidePreviewPlan ? onViewPlan : undefined}
              className="font-medium text-white hover:text-primary underline-offset-2 hover:underline flex items-center gap-1 text-sm cursor-pointer"
            >
              <span className="text-muted-foreground">From</span> {planTitle}
              {!hidePreviewPlan && <ChevronRight className="size-4" />}
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
  onViewPlan: () => void
}

function PlanPromotion({ planTitle, onViewPlan }: PlanPromotionProps) {
  return (
    <Card variant="highlighted" className="dark" onClick={onViewPlan}>
      <CardContent>
        <div className="flex items-start gap-3">
          <div className="space-y-2 flex-1">
            <p className="font-semibold">Want to check full plan?</p>
            <p className="text-sm text-muted-foreground">
              {planTitle} is a structured training plan to help you reach your
              goals.
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="w-full mt-4">
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
    <DrawerFooter className="border-t flex flex-row gap-2">
      <Button
        variant="outline"
        onClick={onClose}
        disabled={isStarting}
        size="lg"
      >
        Close
      </Button>
      <Button
        onClick={onStart}
        disabled={isStarting}
        loading={isStarting}
        className="flex-1"
        size="lg"
      >
        Start Now
      </Button>
    </DrawerFooter>
  )
}
