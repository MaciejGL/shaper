import { formatDate } from 'date-fns'
import { BadgeCheckIcon, ChevronLeft } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { useQueryState } from 'nuqs'

import { getDayName } from '@/app/(protected)/trainer/trainings/creator/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUserPreferences } from '@/context/user-preferences-context'
import { useWorkout } from '@/context/workout-context/workout-context'
import { useTrackWorkoutSession } from '@/hooks/use-track-workout-session'
import { isThisWeek, sortDaysForDisplay } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

import { WorkoutDay } from './workout-page.client'

export function Navigation() {
  const { activeDay } = useWorkout()
  const dayId = activeDay?.id
  const isActive = activeDay?.exercises.some((ex) =>
    ex.sets.some((set) => set.log?.reps || set.log?.weight),
  )
  const isCompleted = activeDay?.completedAt ? true : false
  useTrackWorkoutSession(dayId, isActive, isCompleted)

  return (
    <div
      className={cn(
        'bg-sidebar rounded-b-xl',
        // Counter Main padding
        '-mx-2 md:-mx-4 lg:-mx-8 -mt-2 md:-mt-4 lg:-mt-8',
        'px-2 py-4 md:px-4 lg:p-8',
      )}
    >
      <div className="mx-auto max-w-sm">
        <WeekSelector />
        <DaySelector />
      </div>
    </div>
  )
}

function Day({ day }: { day: WorkoutDay }) {
  const { activeDay } = useWorkout()
  const [, setActiveDayId] = useQueryState('day')
  const [, setActiveExerciseId] = useQueryState('exercise')

  const isSelected = activeDay?.id === day.id

  const handleClick = () => {
    setActiveExerciseId(day.exercises.at(0)?.id ?? '')
    setActiveDayId(day.id)
  }

  const isDayCompleted = day.completedAt
  const completionRate =
    day.exercises.filter((exercise) => exercise.completedAt).length /
    day.exercises.length

  return (
    <div>
      <button
        data-selected={isSelected}
        className={cn(
          'size-12 shrink-0 rounded-md flex-center flex-col text-primary transition-all bg-primary/5 dark:bg-secondary dark:text-primary cursor-pointer hover:bg-secondary/80',
          'data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground dark:data-[selected=true]:bg-primary dark:data-[selected=true]:text-primary-foreground shadow-xs',
        )}
        onClick={handleClick}
      >
        <span className="text-xs">
          {getDayName(day.dayOfWeek, { short: true })}
        </span>
        <span className="text-md">
          {day.scheduledAt && <p>{formatDate(day.scheduledAt, 'd')}</p>}
        </span>
      </button>
      {!day.isRestDay && (
        <div className="relative h-1 my-1 mx-auto w-[66%] bg-secondary rounded-full">
          <div
            className={cn(
              'absolute inset-0',
              'h-1 rounded-full transition-all',
              isDayCompleted && 'bg-green-500',
              !day.completedAt && 'bg-amber-500',
              completionRate > 0 && completionRate < 1 && `bg-green-500`,
            )}
            style={{
              width:
                completionRate > 0 && completionRate < 1
                  ? `${completionRate * 100}%`
                  : undefined,
            }}
          />
        </div>
      )}
    </div>
  )
}

function DaySelector() {
  const { activeWeek } = useWorkout()
  const { preferences } = useUserPreferences()

  if (!activeWeek) return null

  // Sort days according to user's week start preference
  const sortedDays = sortDaysForDisplay(
    activeWeek.days,
    preferences.weekStartsOn,
  )

  return (
    <div className="flex gap-[4px] w-full justify-between mt-2">
      {sortedDays.map((day) => (
        <Day key={day.id} day={day} />
      ))}
    </div>
  )
}

function WeekSelector() {
  const {
    plan,
    activeWeek,
    activeDay,
    setActiveWeekId: setActiveWeekIdContext,
  } = useWorkout()
  const { preferences } = useUserPreferences()
  const [activeWeekId, setActiveWeekId] = useQueryState('week')
  const [, setActiveDayId] = useQueryState('day')
  if (!plan || !activeWeek) return null
  const weeks = plan.weeks

  const handleWeekChange = (type: 'prev' | 'next') => {
    const currentWeekIndex = weeks.findIndex(
      (week) => week.id === activeWeek.id,
    )
    const activeDayOfWeek = activeDay?.dayOfWeek ?? 0

    if (type === 'prev') {
      setActiveWeekId(weeks[currentWeekIndex - 1].id)
      setActiveDayId(weeks[currentWeekIndex - 1].days[activeDayOfWeek].id)
    } else if (type === 'next') {
      setActiveWeekId(weeks[currentWeekIndex + 1].id)
      setActiveDayId(weeks[currentWeekIndex + 1].days[activeDayOfWeek].id)
    }
  }

  const currentWeekIndex = weeks.findIndex((week) => week.id === activeWeek.id)
  const hasPrevWeek = currentWeekIndex > 0
  const hasNextWeek = currentWeekIndex < weeks.length - 1

  return (
    <div className="flex justify-between gap-2">
      <Button
        iconOnly={<ChevronLeft />}
        disabled={!hasPrevWeek}
        size="icon-sm"
        variant="tertiary"
        onClick={() => handleWeekChange('prev')}
      />
      <Select
        onValueChange={(value) => setActiveWeekIdContext(value)}
        defaultValue={activeWeekId ?? undefined}
        value={activeWeekId ?? undefined}
      >
        <SelectTrigger
          size="sm"
          variant="tertiary"
          className="[&_svg]:data-[icon=mark]:size-3.5 truncate"
        >
          <SelectValue
            defaultValue={activeWeek?.id}
            placeholder="Select a workout"
            className=""
          />
        </SelectTrigger>
        <SelectContent>
          {weeks.map((week) => (
            <SelectItem key={week.id} value={week.id}>
              {week.name}
              {week.completedAt ? (
                <BadgeCheckIcon
                  data-icon="mark"
                  className="text-green-500 size-3"
                />
              ) : week.scheduledAt &&
                isThisWeek(week.scheduledAt, preferences.weekStartsOn) ? (
                '(current)'
              ) : (
                ''
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        iconOnly={<ChevronRight />}
        size="icon-sm"
        variant="tertiary"
        onClick={() => handleWeekChange('next')}
        disabled={!hasNextWeek}
      />
    </div>
  )
}
