import { formatDate } from 'date-fns'
import { useMemo } from 'react'

import { getDayName } from '@/app/(protected)/trainer/trainings/creator/components/utils'
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

  const expectedDate = useMemo(
    () => getExpectedDayDate(day, plan, activeWeek),
    [plan, activeWeek, day],
  )

  const isSelected = activeDay.id === day.id

  return (
    <div>
      <button
        data-selected={isSelected}
        className={cn(
          'size-12 shrink-0 rounded-md flex-center flex-col text-primary-foreground transition-all bg-primary/50 dark:bg-primary/20 dark:text-primary cursor-pointer',
          'data-[selected=true]:bg-primary dark:data-[selected=true]:bg-primary dark:data-[selected=true]:text-primary-foreground',
        )}
        onClick={() => {
          setActiveDay(day)
        }}
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
  const { plan, activeWeek, setActiveWeek } = useWorkout()
  const weeks = plan.weeks
  return (
    <Select
      onValueChange={setActiveWeek}
      defaultValue={activeWeek?.id}
      value={activeWeek?.id}
    >
      <SelectTrigger size="sm" className="none">
        <SelectValue
          defaultValue={activeWeek?.id}
          placeholder="Select a workout"
        />
      </SelectTrigger>
      <SelectContent>
        {weeks.map((week) => (
          <SelectItem key={week.id} value={week.id}>
            {week.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
