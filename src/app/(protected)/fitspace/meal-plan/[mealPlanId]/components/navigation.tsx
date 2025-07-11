import { format, formatDate, parseISO, startOfWeek } from 'date-fns'
import { useQueryState } from 'nuqs'
import { useMemo } from 'react'

import { getDayName } from '@/app/(protected)/trainer/trainings/creator/utils'
import { MealDayPickerDrawer } from '@/components/meal-day-picker-drawer'
import { Progress } from '@/components/ui/progress'
import { getDayOfWeek, getWeekDays, isDayMatch } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

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
        'bg-sidebar rounded-b-lg sticky -top-[120px] z-10',
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

function Day({ day }: { day: string }) {
  const { plan } = useMealPlan()
  const [date, setDate] = useQueryState('date')

  const planDay = useMemo(() => {
    if (!plan) return null
    return plan.weeks.at(0)?.days.find((planDay) => {
      return isDayMatch(day, planDay.dayOfWeek)
    })
  }, [plan, day])

  const isSelected = date === day

  const dailyTargets = {
    calories: planDay?.targetCalories || plan?.dailyCalories || 0,
    protein: planDay?.targetProtein || plan?.dailyProtein || 0,
    carbs: planDay?.targetCarbs || plan?.dailyCarbs || 0,
    fat: planDay?.targetFat || plan?.dailyFat || 0,
  }

  // Use the logged values if available, otherwise use planned values
  const dailyActual = {
    calories: planDay?.meals.reduce(
      (sum, meal) => sum + meal.plannedCalories,
      0,
    ),
    protein: planDay?.meals.reduce((sum, meal) => sum + meal.plannedProtein, 0),
    carbs: planDay?.meals.reduce((sum, meal) => sum + meal.plannedCarbs, 0),
    fat: planDay?.meals.reduce((sum, meal) => sum + meal.plannedFat, 0),
  }

  const calorieCompletionPercentage =
    dailyTargets.calories > 0
      ? ((dailyActual.calories || 0) * 100) / dailyTargets.calories
      : 0

  const handleClick = () => {
    setDate(day)
  }

  const dayOfWeek = getDayOfWeek(day)
  const dayName = getDayName(dayOfWeek, { short: true })

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
        <span className="text-xs">{dayName}</span>
        <span className="text-md">{formatDate(day, 'd')}</span>
      </button>
      <div className="my-1 mx-auto w-[76%]">
        <Progress value={calorieCompletionPercentage} />
      </div>
    </div>
  )
}

function DaySelector() {
  const [date] = useQueryState('date')

  const days = useMemo(() => {
    if (!date) return []
    return getWeekDays(date)
  }, [date])

  return (
    <div className="flex gap-[4px] w-full justify-between mt-2">
      {days.map((day) => (
        <Day key={day} day={day} />
      ))}
    </div>
  )
}

function WeekSelector() {
  const [date, setDate] = useQueryState('date')

  const selectedWeek = useMemo(() => {
    if (!date) return new Date()
    // Always return the Monday of the week for the selected date
    const selectedDate = parseISO(date)
    return startOfWeek(selectedDate, { weekStartsOn: 1 })
  }, [date])

  const handleWeekChange = (newWeekStart: Date) => {
    // newWeekStart is already the Monday of the selected week from WeekPicker
    const dateString = format(newWeekStart, 'yyyy-MM-dd')
    setDate(dateString)
  }

  return (
    <MealDayPickerDrawer
      value={selectedWeek}
      onChange={handleWeekChange}
      placeholder="Select week"
    />
  )
}
