import { formatDate } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { ExtendHeader } from '@/components/extend-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { GQLWorkoutType } from '@/generated/graphql-client'
import { getDayName } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

const DUMMY_WEEK = {
  id: 'skeleton-week-1',
  weekNumber: 1,
  name: 'Week 1',
  description: 'Loading week...',
  completedAt: null,
  scheduledAt: new Date().toISOString(),
  days: Array.from({ length: 7 }, (_, i) => ({
    id: `skeleton-day-${i}`,
    dayOfWeek: i,
    isRestDay: i === 6, // Sunday as rest day
    workoutType: i === 6 ? null : GQLWorkoutType.Push,
    startedAt: null,
    completedAt: null,
    scheduledAt: new Date(Date.now() + i * 24 * 60 * 60 * 1000).toISOString(),
    duration: null,
    exercises: [
      {
        id: `skeleton-exercise-${i}-1`,
        name: 'Loading Exercise Name',
        restSeconds: 90,
        tempo: '3-1-2-1',
        warmupSets: 1,
        description: 'Loading exercise description...',
        tips: ['Loading tips...'],
        difficulty: 'intermediate',
        instructions: ['Loading instructions...'],
        additionalInstructions: null,
        order: 1,
        videoUrl: null,
        images: [],
        completedAt: null,
        isExtra: false,
        substitutedBy: null,
        substitutes: [],
        muscleGroups: [
          {
            id: 'skeleton-muscle-1',
            alias: 'Chest',
            groupSlug: 'chest',
          },
        ],
        sets: Array.from({ length: 3 }, (_, setIndex) => ({
          id: `skeleton-set-${i}-1-${setIndex}`,
          order: setIndex + 1,
          reps: 10,
          minReps: 8,
          maxReps: 12,
          weight: 50,
          rpe: 7,
          isExtra: false,
          completedAt: null,
          log: null,
        })),
      },
      {
        id: `skeleton-exercise-${i}-2`,
        name: 'Second Loading Exercise',
        restSeconds: 60,
        tempo: '2-0-2-0',
        warmupSets: 0,
        description: 'Loading second exercise...',
        tips: ['Loading tips...'],
        difficulty: 'beginner',
        instructions: ['Loading instructions...'],
        additionalInstructions: null,
        order: 2,
        videoUrl: null,
        images: [],
        completedAt: null,
        isExtra: false,
        substitutedBy: null,
        substitutes: [],
        muscleGroups: [
          {
            id: 'skeleton-muscle-2',
            alias: 'Triceps',
            groupSlug: 'triceps',
          },
        ],
        sets: Array.from({ length: 2 }, (_, setIndex) => ({
          id: `skeleton-set-${i}-2-${setIndex}`,
          order: setIndex + 1,
          reps: 15,
          minReps: 12,
          maxReps: 18,
          weight: 20,
          rpe: 8,
          isExtra: false,
          completedAt: null,
          log: null,
        })),
      },
    ],
  })),
}

export function WorkoutPageSkeleton() {
  return (
    <ExtendHeader headerChildren={<SkeletonNavigation />}>
      <SkeletonExercises />
    </ExtendHeader>
  )
}

export function SkeletonNavigation() {
  return (
    <div className={cn('px-2 pb-2')}>
      <SkeletonWeekSelector />
      <SkeletonDaySelector />
    </div>
  )
}

function SkeletonWeekSelector() {
  return (
    <div className="flex justify-between gap-2">
      <Select disabled>
        <SelectTrigger
          suppressHydrationWarning
          size="sm"
          variant="tertiary"
          className={cn(
            'dark [&_svg]:data-[icon=mark]:size-3.5 truncate text-sm font-medium flex items-center gap-2',
            'masked-placeholder-text',
          )}
        >
          <SelectValue placeholder="Loading workout..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="skeleton">Week 1</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}

function SkeletonDaySelector() {
  const activeWeek = DUMMY_WEEK

  return (
    <div className="flex gap-[4px] w-full justify-between mt-2">
      {activeWeek.days.map((day) => (
        <SkeletonDay key={day.id} />
      ))}
    </div>
  )
}

function SkeletonDay() {
  const day = DUMMY_WEEK.days[0]
  return (
    <div>
      <div
        className={cn(
          'dark size-12 shrink-0 rounded-md flex-center flex-col text-primary transition-all dark:bg-secondary dark:text-primary cursor-pointer hover:bg-secondary/80',
          'masked-placeholder-text',
        )}
      >
        <span className="text-xs">
          {getDayName(day.dayOfWeek, { short: true })}
        </span>
        <span className="text-md">
          {day.scheduledAt && <p>{formatDate(day.scheduledAt, 'd')}</p>}
        </span>
      </div>

      <div className="dark relative h-1 my-1 mx-auto w-[66%] masked-placeholder-text rounded-full">
        <div
          className={cn(
            'h-1 rounded-full transition-all bg-amber-500',
            'masked-placeholder-text',
          )}
          style={{ width: '0%' }}
        />
      </div>
    </div>
  )
}

export function SkeletonExercises() {
  const activeDay = DUMMY_WEEK.days[0]

  const completedExercises = 0
  const progressPercentage = 0 // Show some progress for skeleton

  return (
    <div id={activeDay.id}>
      {!activeDay.isRestDay && (
        <div className="flex flex-col pb-4 space-y-3 w-full">
          <Skeleton className="h-7 w-1/3 mx-auto" />
          <div className="grid grid-cols-2 gap-2">
            <Label className="flex items-center justify-center gap-2 whitespace-nowrap p-1.5 bg-card-on-card w-full rounded-2xl masked-placeholder-text">
              Loading
            </Label>

            <SkeletonExercisesCompleted
              completedExercises={completedExercises}
              totalExercises={activeDay.exercises.length}
            />
          </div>
          <Progress
            value={progressPercentage}
            className={cn('masked-placeholder-text')}
          />
        </div>
      )}
      <div className="space-y-6">
        {activeDay.exercises.map((exercise) => (
          <SkeletonExercise key={exercise.id} />
        ))}
      </div>
    </div>
  )
}

function SkeletonExercisesCompleted({
  completedExercises,
  totalExercises,
}: {
  completedExercises: number
  totalExercises: number
}) {
  return (
    <Badge
      variant="secondary"
      size="lg"
      className={cn(
        'w-full bg-card-on-card dark:bg-card-on-card',
        'masked-placeholder-text',
      )}
    >
      {completedExercises}/{totalExercises} completed
    </Badge>
  )
}

function SkeletonExercise() {
  const exercise = DUMMY_WEEK.days[0].exercises[0]
  return (
    <div className="space-y-3 p-4 rounded-lg bg-card">
      <div className="space-y-2">
        <h3
          className={cn(
            'text-lg font-semibold bg-muted-foreground/30 dark:bg-muted-foreground/10',
            'masked-placeholder-text',
          )}
        >
          {exercise.name}
        </h3>
        <p
          className={cn(
            'text-sm text-muted-foreground w-max bg-muted-foreground/30 dark:bg-muted-foreground/10',
            'masked-placeholder-text',
          )}
        >
          {exercise.description}
        </p>
        <div className="flex gap-2">
          {exercise.muscleGroups.map((muscle) => (
            <Badge
              key={muscle.id}
              variant="secondary"
              size="sm"
              className={cn('masked-placeholder-text')}
            >
              {muscle.alias}
            </Badge>
          ))}
        </div>
      </div>
      <div className="space-y-2">
        {exercise.sets.map((_, index: number) => (
          <SkeletonSet key={index} />
        ))}
      </div>
    </div>
  )
}

function SkeletonSet() {
  return (
    <div className="flex items-center gap-3 p-3 rounded bg-muted-foreground/30 dark:bg-muted-foreground/10 animate-pulse h-12" />
  )
}
