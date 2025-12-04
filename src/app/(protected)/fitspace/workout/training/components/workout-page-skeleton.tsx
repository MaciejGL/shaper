import { formatDate } from 'date-fns'

import { ExtendHeader } from '@/components/extend-header'
import { Button } from '@/components/ui/button'
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
            displayGroup: 'chest',
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
            displayGroup: 'triceps',
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
      {
        id: `skeleton-exercise-${i}-3`,
        name: 'Third Loading Exercise',
        restSeconds: 60,
        tempo: '2-0-2-0',
        warmupSets: 0,
        description: 'Loading third exercise...',
        tips: ['Loading tips...'],
        difficulty: 'beginner',
        instructions: ['Loading instructions...'],
        additionalInstructions: null,
        order: 3,
        videoUrl: null,
        images: [],
        completedAt: null,
        isExtra: false,
        substitutedBy: null,
        substitutes: [],
        muscleGroups: [
          {
            id: 'skeleton-muscle-3',
            alias: 'Biceps',
            displayGroup: 'biceps',
          },
        ],
        sets: Array.from({ length: 2 }, (_, setIndex) => ({
          id: `skeleton-set-${i}-3-${setIndex}`,
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
    <ExtendHeader
      headerChildren={<SkeletonNavigation />}
      classNameHeader="pt-2 px-4"
      classNameContent="p-0"
    >
      <SkeletonExercises />
    </ExtendHeader>
  )
}

export function SkeletonNavigation() {
  return (
    <div className={cn('pb-2')}>
      <SkeletonWeekSelector />
      <SkeletonDaySelector />
    </div>
  )
}

function SkeletonWeekSelector() {
  return (
    <div className="dark flex justify-between gap-2">
      <Button variant="tertiary" size="md" className="masked-placeholder-text">
        Week 1 Loading...
      </Button>
      <Skeleton className="size-[36px]" />
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
          'dark size-12 shrink-0 rounded-xl flex-center flex-col text-primary transition-all dark:bg-secondary dark:text-primary cursor-pointer hover:bg-secondary/80',
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

  return (
    <div id={activeDay.id}>
      <div className="space-y-6 mt-4 px-4">
        {activeDay.exercises.map((exercise) => (
          <div key={exercise.id} className="space-y-3">
            <Skeleton className="h-7 w-1/3" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-12 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-12 w-1/2" />
              <Skeleton className="h-12 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
