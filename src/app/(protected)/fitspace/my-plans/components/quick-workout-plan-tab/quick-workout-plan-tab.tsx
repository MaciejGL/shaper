import { format, formatDate, getWeek } from 'date-fns'
import {
  ArrowRightIcon,
  BadgeCheck,
  Calendar,
  CheckIcon,
  ClockIcon,
  DumbbellIcon,
  Zap,
} from 'lucide-react'
import { Fragment, useEffect, useState } from 'react'

import { dayNames } from '@/app/(protected)/trainer/trainings/creator/utils'
import { StatsItem } from '@/components/stats-item'
import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { estimateWorkoutTime } from '@/lib/workout/esimate-workout-time'

import { QuickWorkoutPlan } from '../../types'

export function QuickWorkoutPlanTab({
  plan,
  loading,
}: {
  plan: QuickWorkoutPlan
  loading: boolean
}) {
  const [selectedWeek, setSelectedWeek] = useState<
    NonNullable<QuickWorkoutPlan>['weeks'][number]['id'] | null
  >()

  useEffect(() => {
    if (plan?.weeks?.[0] && !selectedWeek) {
      setSelectedWeek(plan.weeks[0].id)
    }
  }, [plan?.weeks, loading, selectedWeek])

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatsItem
            value={10}
            label="Workouts Completed"
            icon={<DumbbellIcon className="w-5 h-5 text-primary" />}
            variant="secondary"
            loading={loading}
          />
          <StatsItem
            value={10}
            label="Weeks Active"
            icon={<Calendar className="w-5 h-5 text-primary" />}
            variant="secondary"
            loading={loading}
          />
        </div>

        <Select value={'1'} onValueChange={() => {}} disabled={loading}>
          <SelectTrigger variant="ghost" className="w-full animate-pulse">
            <SelectValue placeholder="Select a date" />
          </SelectTrigger>
        </Select>

        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className="h-64 w-full bg-card rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (!plan) {
    return (
      <Card variant="gradient">
        <CardContent className="p-8 flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <Zap className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No Quick Workouts Yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Start your first quick workout to see your progress here
          </p>
          <ButtonLink href="/fitspace/workout/quick-workout">
            Start Quick Workout
          </ButtonLink>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatsItem
          value={plan.completedWorkoutsDays}
          label="Workouts Completed"
          icon={<DumbbellIcon className="w-5 h-5 text-primary" />}
          variant="secondary"
        />
        <StatsItem
          value={plan.weekCount}
          label="Weeks Active"
          icon={<Calendar className="w-5 h-5 text-primary" />}
          variant="secondary"
        />
      </div>

      <Select
        value={selectedWeek ?? plan.weeks?.[0]?.id}
        onValueChange={(value) => setSelectedWeek(value)}
      >
        <SelectTrigger variant="ghost" className="w-full">
          <SelectValue placeholder="Select a date" />
        </SelectTrigger>
        <SelectContent>
          {plan.weeks?.map((week) => (
            <SelectItem key={week.id} value={week.id}>
              Week{' '}
              {week.scheduledAt
                ? getWeek(week.scheduledAt, { weekStartsOn: 1 })
                : ''}
              {week.scheduledAt ? (
                <span className="text-xs text-muted-foreground">
                  {format(week.scheduledAt, 'd. MMM yyyy')}
                </span>
              ) : (
                ''
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <WeekCard
        week={plan.weeks?.find((week) => week.id === selectedWeek)}
        planId={plan.id}
      />
    </div>
  )
}

function WeekCard({
  week,
  planId,
}: {
  week?: NonNullable<QuickWorkoutPlan>['weeks'][number]
  planId: string
}) {
  if (!week) {
    return null
  }

  const completedDays = week.days.filter((day) => day.completedAt).length
  const totalDays = week.days.filter((day) => day.exercises.length > 0).length
  const progress =
    totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0

  return (
    <div>
      <div>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">Week {week.weekNumber}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {week.scheduledAt &&
                formatDate(new Date(week.scheduledAt), 'MMM d, yyyy')}
            </p>
          </div>
          <Badge variant={progress === 100 ? 'primary' : 'secondary'}>
            {completedDays}/7 days
          </Badge>
        </div>
      </div>
      <div className="space-y-4">
        {/* Week Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Days */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Days</h4>
          <div className="space-y-2">
            {week.days.map((day) => (
              <DayCard
                key={day.id}
                day={day}
                planId={planId}
                weekId={week.id}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function DayCard({
  day,
  planId,
  weekId,
}: {
  day: NonNullable<QuickWorkoutPlan>['weeks'][number]['days'][number]
  planId: string
  weekId: string
}) {
  const dayName = dayNames[day.dayOfWeek]
  const estimatedTime = estimateWorkoutTime(day.exercises)

  return (
    <Card className={cn('p-0', day.exercises.length === 0 && 'opacity-40')}>
      <CardContent className="p-0">
        <div className="flex justify-between p-4">
          <div className="flex gap-2">
            <div>
              <p className="font-medium">{dayName}</p>
              {day.scheduledAt && (
                <span className="text-sm text-muted-foreground">
                  {formatDate(new Date(day.scheduledAt), 'MMM d')}
                </span>
              )}
            </div>
            {day.completedAt && (
              <BadgeCheck className="size-4 text-green-600 mt-1" />
            )}
          </div>

          {day.exercises.length > 0 && (
            <ButtonLink
              href={`/fitspace/workout/${planId}?week=${weekId}&day=${day.id}&exercise=${day.exercises.at(0)?.id}`}
            >
              <ArrowRightIcon className="size-4" />
            </ButtonLink>
          )}
        </div>
        {day.exercises.length > 0 && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground px-4">
            <Badge variant="secondary">
              <DumbbellIcon className="w-3 h-3" />
              <span>{day.exercises.length} exercises</span>
            </Badge>
            {estimatedTime > 0 && (
              <Badge variant="secondary">
                <ClockIcon className="w-3 h-3 ml-1" />
                <span>~{estimatedTime}min</span>
              </Badge>
            )}
          </div>
        )}

        {day.exercises.length > 0 && (
          <div className="mt-4 bg-card-on-card rounded-b-lg p-4">
            {day.exercises.map((exercise, index) => (
              <Fragment key={exercise.id}>
                <div className="flex items-center justify-between text-sm py-4">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="font-medium truncate">
                      {exercise.name}
                    </span>
                    {exercise.completedAt && (
                      <CheckIcon className="w-3 h-3 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground flex-shrink-0">
                    <span>{exercise.sets.length} sets</span>
                  </div>
                </div>
                {index < day.exercises.length - 1 && (
                  <Separator className="my-1" />
                )}
              </Fragment>
            ))}

            {day.completedAt && (
              <div className="pt-2 border-t">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <BadgeCheck className="w-3 h-3" />
                  <span>
                    Completed{' '}
                    {formatDate(new Date(day.completedAt), 'MMM d, HH:mm')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
