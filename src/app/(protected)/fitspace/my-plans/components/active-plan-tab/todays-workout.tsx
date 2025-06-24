'use client'

import { format } from 'date-fns'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  CheckIcon,
  ChevronsDownIcon,
  ClockIcon,
  DumbbellIcon,
  HamIcon,
} from 'lucide-react'
import { Fragment, useState } from 'react'

import { BiggyIcon } from '@/components/biggy-icon'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { estimateWorkoutTime } from '@/lib/workout/esimate-workout-time'
import { formatWorkoutType } from '@/lib/workout/workout-type-to-label'

import { ActivePlan } from '../../types'

export function TodaysWorkout({
  todaysWorkout,
  planId,
  isNextWorkout,
}: {
  todaysWorkout: NonNullable<ActivePlan>['weeks'][number]['days'][number]
  planId: string
  isNextWorkout?: boolean
}) {
  if (!todaysWorkout || !planId) {
    return null
  }

  const getTitle = () => {
    if (isNextWorkout) {
      return "Next's workout"
    }

    if (todaysWorkout.completedAt) {
      return 'Completed'
    }

    if (todaysWorkout.isRestDay) {
      return 'Rest day'
    }

    return "Today's workout"
  }

  return (
    <div>
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <p className="text-lg font-semibold">{getTitle()}</p>
          {isNextWorkout && todaysWorkout.scheduledAt && (
            <p className="text-sm text-muted-foreground">
              {format(todaysWorkout.scheduledAt, 'EEEE, d. MMMM')}
            </p>
          )}
        </div>
        {!todaysWorkout.isRestDay && (
          <ButtonLink
            href={`/fitspace/workout/${planId}`}
            iconEnd={<ArrowRight />}
          >
            {todaysWorkout.completedAt ? 'View' : 'Start'}
          </ButtonLink>
        )}
      </div>
      {todaysWorkout.isRestDay ? (
        <RestDay />
      ) : (
        <WorkoutDay day={todaysWorkout} />
      )}
    </div>
  )
}

function WorkoutDay({
  day,
}: {
  day: NonNullable<ActivePlan>['weeks'][number]['days'][number]
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="w-full space-y-6">
      <WorkoutDayHeader day={day} />

      <motion.div
        key={day.id}
        initial={false}
        animate={{
          height: expanded ? 'max-content' : 0,
          opacity: expanded ? 1 : 0,
        }}
        transition={{ type: 'spring', stiffness: 100, damping: 20 }}
        style={{ overflow: 'hidden' }}
      >
        <WorkoutDayExercises day={day} />
      </motion.div>
      <div className="flex justify-center">
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          aria-label={expanded ? 'Collapse exercises' : 'Expand exercises'}
        >
          <ChevronsDownIcon
            className={cn(
              'size-5 transition-transform',
              expanded && 'rotate-180',
            )}
          />
        </button>
      </div>
    </div>
  )
}

function WorkoutDayHeader({
  day,
}: {
  day: NonNullable<ActivePlan>['weeks'][number]['days'][number]
}) {
  const estimatedTime = estimateWorkoutTime(day.exercises)

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        {day.completedAt && <BadgeCheck className="size-5 text-green-500" />}
        <h2 className="text-2xl font-semibold text-foreground">
          {formatWorkoutType(day.workoutType)}
        </h2>
      </div>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Badge variant="secondary" className="flex items-center gap-1">
          <DumbbellIcon />
          <span>{day.exercises.length} exercises</span>
        </Badge>
        <Badge variant="secondary" className="flex items-center gap-1">
          <ClockIcon />
          <span>~{estimatedTime}min</span>
        </Badge>
      </div>
    </div>
  )
}

function WorkoutDayExercises({
  day,
}: {
  day: NonNullable<ActivePlan>['weeks'][number]['days'][number]
}) {
  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium">Exercises</h2>
      <div className="space-y-2 bg-muted/50 rounded-lg p-4  dark:shadow-neuro-dark">
        <div className="space-y-3">
          {day.exercises.map((exercise, index) => (
            <Fragment key={index}>
              <div key={index} className="flex items-center gap-4">
                <div className="grow">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{exercise.name}</p>
                    {!exercise.completedAt && (
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {exercise.sets?.length || 0} sets
                      </p>
                    )}
                  </div>

                  {!exercise.completedAt && (
                    <div className="text-xs text-muted-foreground">
                      {exercise?.muscleGroups
                        ?.map((group) => group.alias)
                        .join(', ')}
                    </div>
                  )}
                </div>
                {exercise.completedAt && (
                  <CheckIcon className="size-4 text-green-500 mr-2" />
                )}
              </div>
              {day.exercises.length - 1 !== index && <Separator />}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

function RestDay() {
  return (
    <div className="px-4 py-8 flex flex-col gap-4 items-center">
      <BiggyIcon icon={HamIcon} size="md" />
      <span className="text-muted-foreground text-sm text-center max-w-[25ch]">
        Rest and recover for next workout!
      </span>
    </div>
  )
}
