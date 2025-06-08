import { formatDate } from 'date-fns'
import { BadgeCheckIcon, BicepsFlexedIcon, ChevronLeft } from 'lucide-react'
import { ChevronRight } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useMemo } from 'react'

import { getDayName } from '@/app/(protected)/trainer/trainings/creator/components/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useWorkout } from '@/context/workout-context/workout-context'
import { cn } from '@/lib/utils'

import { getExpectedDayDate } from '../../utils'

import { WorkoutDay } from './workout-page.client'

export function Navigation() {
  return (
    <div
      className={cn(
        'bg-sidebar',
        // Counter Main padding
        '-mx-2 md:-mx-4 lg:-mx-8 -mt-2 md:-mt-4 lg:-mt-8',
        'p-2 md:p-4 lg:p-8',
      )}
    >
      <div className="mx-auto max-w-max">
        <WeekSelector />
        <DaySelector />
      </div>
    </div>
  )
}

function Day({ day }: { day: WorkoutDay }) {
  const { setActiveDay, plan, activeWeek, activeDay } = useWorkout()
  const [, setActiveExerciseId] = useQueryState('exercise')

  const expectedDate = useMemo(
    () => getExpectedDayDate(day, plan, activeWeek),
    [plan, activeWeek, day],
  )

  const isSelected = activeDay?.id === day.id

  const handleClick = () => {
    setActiveExerciseId(day.exercises.at(0)?.id ?? '')
    setActiveDay(day)
  }

  return (
    <div>
      <button
        data-selected={isSelected}
        className={cn(
          'size-12 shrink-0 rounded-md flex-center flex-col text-primary transition-all bg-secondary dark:bg-secondary dark:text-primary cursor-pointer shadow-sm hover:bg-secondary/80',
          'data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground dark:data-[selected=true]:bg-primary dark:data-[selected=true]:text-primary-foreground',
        )}
        onClick={handleClick}
      >
        <span className="text-xs">
          {getDayName(day.dayOfWeek, { short: true })}
        </span>
        <span className="text-md">
          {expectedDate && <p>{formatDate(expectedDate, 'd')}</p>}
        </span>
      </button>
      {!day.isRestDay && (
        <div
          className={cn(
            'h-1 w-[66%] bg-primary rounded-full mt-1 mx-auto',
            day.completedAt && 'bg-green-500',
            !day.completedAt && 'bg-amber-500',
          )}
        />
      )}
    </div>
  )
}

function DaySelector() {
  const { activeWeek } = useWorkout()
  if (!activeWeek) return null
  const days = activeWeek.days
  return (
    <div className="flex gap-[4px] w-full justify-center mt-2">
      {days.map((day) => (
        <Day key={day.id} day={day} />
      ))}
    </div>
  )
}

function WeekSelector() {
  const { plan, activeWeek, setActiveWeek, activeDay, setActiveDay } =
    useWorkout()
  if (!plan || !activeWeek) return null
  const weeks = plan.weeks

  const handleWeekChange = (type: 'prev' | 'next') => {
    const currentWeekIndex = weeks.findIndex(
      (week) => week.id === activeWeek.id,
    )
    const activeDayOfWeek = activeDay?.dayOfWeek ?? 0

    if (type === 'prev') {
      setActiveWeek(weeks[currentWeekIndex - 1].id)
      setActiveDay(weeks[currentWeekIndex - 1].days[activeDayOfWeek])
    } else {
      setActiveWeek(weeks[currentWeekIndex + 1].id)
      setActiveDay(weeks[currentWeekIndex + 1].days[activeDayOfWeek])
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
        variant="outline"
        onClick={() => handleWeekChange('prev')}
      />
      <Select
        onValueChange={setActiveWeek}
        defaultValue={activeWeek?.id}
        value={activeWeek?.id}
      >
        <SelectTrigger
          size="sm"
          variant="ghost"
          className="[&_svg]:data-[icon=mark]:size-3.5"
        >
          <SelectValue
            defaultValue={activeWeek?.id}
            placeholder="Select a workout"
          />
        </SelectTrigger>
        <SelectContent>
          {weeks.map((week, index) => (
            <SelectItem key={week.id} value={week.id}>
              {week.name}
              {week.completedAt ? (
                <BadgeCheckIcon
                  data-icon="mark"
                  className="text-green-500 size-3"
                />
              ) : index === currentWeekIndex ? (
                <BicepsFlexedIcon
                  data-icon="mark"
                  className="text-primary/80 size-3"
                />
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
        variant="outline"
        onClick={() => handleWeekChange('next')}
        disabled={!hasNextWeek}
      />
    </div>
  )
}
