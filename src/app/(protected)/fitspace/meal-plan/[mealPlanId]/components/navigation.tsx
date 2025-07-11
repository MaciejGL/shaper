import { formatDate, isThisISOWeek } from 'date-fns'
import { BadgeCheckIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { useQueryState } from 'nuqs'

import { getDayName } from '@/app/(protected)/trainer/trainings/creator/utils'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

import { MealDay } from '../page'

import { DailyProgressCard } from './daily-progress-card'
import { useMealPlan } from './meal-plan-context'

export function Navigation() {
  const { activeDay, plan } = useMealPlan()

  const dailyTargets = {
    calories: activeDay?.targetCalories || plan?.dailyCalories || 0,
    protein: activeDay?.targetProtein || plan?.dailyProtein || 0,
    carbs: activeDay?.targetCarbs || plan?.dailyCarbs || 0,
    fat: activeDay?.targetFat || plan?.dailyFat || 0,
  }

  // Use the logged values if available, otherwise use planned values
  const dailyActual = {
    calories: activeDay?.meals.reduce(
      (sum, meal) => sum + meal.plannedCalories,
      0,
    ),
    protein: activeDay?.meals.reduce(
      (sum, meal) => sum + meal.plannedProtein,
      0,
    ),
    carbs: activeDay?.meals.reduce((sum, meal) => sum + meal.plannedCarbs, 0),
    fat: activeDay?.meals.reduce((sum, meal) => sum + meal.plannedFat, 0),
  }

  return (
    <div
      className={cn(
        'bg-sidebar rounded-b-lg sticky -top-[116px] z-10',
        // Counter Main padding
        '-mx-2 md:-mx-4 lg:-mx-8 -mt-2 md:-mt-4 lg:-mt-8',
        'p-2 md:p-4 lg:p-8',
      )}
    >
      <div className="mx-auto max-w-sm">
        <WeekSelector />
        <DaySelector />
      </div>
      <DailyProgressCard
        dailyTargets={dailyTargets}
        dailyActual={dailyActual}
      />
    </div>
  )
}

function Day({ day }: { day: MealDay }) {
  const { activeDay, plan } = useMealPlan()

  const isSelected = activeDay?.id === day.id

  const handleClick = () => {
    setDate(day.scheduledAt)
  }

  const dailyTargets = {
    calories: day?.targetCalories || plan?.dailyCalories || 0,
    protein: day?.targetProtein || plan?.dailyProtein || 0,
    carbs: day?.targetCarbs || plan?.dailyCarbs || 0,
    fat: day?.targetFat || plan?.dailyFat || 0,
  }

  // Use the logged values if available, otherwise use planned values
  const dailyActual = {
    calories: day?.meals.reduce((sum, meal) => sum + meal.plannedCalories, 0),
    protein: day?.meals.reduce((sum, meal) => sum + meal.plannedProtein, 0),
    carbs: day?.meals.reduce((sum, meal) => sum + meal.plannedCarbs, 0),
    fat: day?.meals.reduce((sum, meal) => sum + meal.plannedFat, 0),
  }

  const calorieCompletionPercentage =
    ((dailyActual.calories || 0) * 100) / dailyTargets.calories

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
      <div className="my-1 mx-auto w-[76%]">
        <Progress value={calorieCompletionPercentage || 0} />
      </div>
    </div>
  )
}

function DaySelector() {
  const [date] = useQueryState('date')

  const { activeWeek } = useMealPlan()
  if (!activeWeek) return null

  return (
    <div className="flex gap-[4px] w-full justify-between mt-2">
      {days.map((day) => (
        <Day key={day.id} day={day} date={date} />
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
  } = useMealPlan()
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
        variant="secondary"
        onClick={() => handleWeekChange('prev')}
      />
      <Select
        onValueChange={(value) => setActiveWeekIdContext(value)}
        defaultValue={activeWeekId ?? undefined}
        value={activeWeekId ?? undefined}
      >
        <SelectTrigger
          size="sm"
          variant="ghost"
          className="[&_svg]:data-[icon=mark]:size-3.5"
        >
          <SelectValue
            defaultValue={activeWeek?.id}
            placeholder="Select a week"
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
              ) : week.weekNumber && isThisISOWeek(new Date()) ? (
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
        variant="secondary"
        onClick={() => handleWeekChange('next')}
        disabled={!hasNextWeek}
      />
    </div>
  )
}
