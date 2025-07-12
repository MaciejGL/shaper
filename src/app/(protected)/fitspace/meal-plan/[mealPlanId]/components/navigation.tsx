import { format, formatDate, isSameDay, parseISO, startOfWeek } from 'date-fns'
import { AnimatePresence, motion } from 'framer-motion'
import { Calendar1 } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useMemo } from 'react'

import { getDayName } from '@/app/(protected)/trainer/trainings/creator/utils'
import { MealDayPickerDrawer } from '@/components/meal-day-picker-drawer'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { getDayOfWeek, getWeekDays, isDayMatch } from '@/lib/date-utils'
import { cn } from '@/lib/utils'

import { DailyProgressCard } from './daily-progress-card'
import { Meal, MealPlan, useMealPlan } from './meal-plan-context'

function calculateLoggedTotals(meals: Meal[]) {
  let calories = 0
  let protein = 0
  let carbs = 0
  let fat = 0

  meals.forEach((meal) => {
    meal.foods.forEach((food) => {
      const log = food.log

      if (food.isCustomAddition) {
        // For custom additions, use the food's total values directly
        calories += food.totalCalories
        protein += food.totalProtein
        carbs += food.totalCarbs
        fat += food.totalFat
      } else {
        // For regular foods, use logged values if available, otherwise fall back to planned values
        calories += log?.calories || food.totalCalories
        protein += log?.protein || food.totalProtein
        carbs += log?.carbs || food.totalCarbs
        fat += log?.fat || food.totalFat
      }
    })
  })

  return {
    calories: Math.round(calories * 100) / 100,
    protein: Math.round(protein * 100) / 100,
    carbs: Math.round(carbs * 100) / 100,
    fat: Math.round(fat * 100) / 100,
  }
}

// Helper function to combine meals from both plans for a given date
function getCombinedDailyTotals(
  date: string,
  activePlan: MealPlan | null,
  defaultPlan: MealPlan | null,
) {
  if (!date) return { calories: 0, protein: 0, carbs: 0, fat: 0 }

  let combinedMeals: Meal[] = []

  // Add meals from active plan if available
  if (activePlan) {
    const activePlanDay = activePlan.weeks.at(0)?.days.find((planDay) => {
      return isDayMatch(date, planDay.dayOfWeek)
    })
    if (activePlanDay?.meals) {
      combinedMeals = [...combinedMeals, ...activePlanDay.meals]
    }
  }

  // Add meals from default plan if available
  if (defaultPlan) {
    const defaultPlanDay = defaultPlan.weeks.at(0)?.days.find((planDay) => {
      return isDayMatch(date, planDay.dayOfWeek)
    })
    if (defaultPlanDay?.meals) {
      combinedMeals = [...combinedMeals, ...defaultPlanDay.meals]
    }
  }

  return calculateLoggedTotals(combinedMeals)
}

export function Navigation() {
  const { activeDay, currentPlan, activePlan, defaultPlan } = useMealPlan()
  const [date] = useQueryState('date')

  const dailyTargets = {
    calories: activeDay?.targetCalories || currentPlan?.dailyCalories || 0,
    protein: activeDay?.targetProtein || currentPlan?.dailyProtein || 0,
    carbs: activeDay?.targetCarbs || currentPlan?.dailyCarbs || 0,
    fat: activeDay?.targetFat || currentPlan?.dailyFat || 0,
  }

  // Calculate combined totals from both plans for the current date
  const dailyActual = useMemo(() => {
    return getCombinedDailyTotals(date || '', activePlan, defaultPlan)
  }, [activePlan, defaultPlan, date])

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
        <DailyProgressCard
          dailyTargets={dailyTargets}
          dailyActual={dailyActual}
        />
      </div>
    </div>
  )
}

function Day({ day }: { day: string }) {
  const { currentPlan, activePlan, defaultPlan } = useMealPlan()
  const [date, setDate] = useQueryState('date')

  const planDay = useMemo(() => {
    if (!currentPlan) return null
    return currentPlan.weeks.at(0)?.days.find((planDay) => {
      return isDayMatch(day, planDay.dayOfWeek)
    })
  }, [currentPlan, day])

  const isSelected = date === day

  const dailyTargets = {
    calories: planDay?.targetCalories || currentPlan?.dailyCalories || 0,
    protein: planDay?.targetProtein || currentPlan?.dailyProtein || 0,
    carbs: planDay?.targetCarbs || currentPlan?.dailyCarbs || 0,
    fat: planDay?.targetFat || currentPlan?.dailyFat || 0,
  }

  // Calculate combined totals from both plans
  const dailyActual = useMemo(() => {
    return getCombinedDailyTotals(day, activePlan, defaultPlan)
  }, [activePlan, defaultPlan, day])

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

  const isOnAnotherDay = useMemo(() => {
    if (!date) return false
    const today = new Date()
    return !isSameDay(parseISO(date), today)
  }, [date])

  const handleTodayClick = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'))
  }

  return (
    <div className="flex items-center gap-2">
      <MealDayPickerDrawer
        value={selectedWeek}
        onChange={handleWeekChange}
        placeholder="Select week"
      />
      <AnimatePresence>
        {isOnAnotherDay && (
          <motion.div
            key="today-button" // Add this key prop
            initial={{ opacity: 0, x: 4, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 4, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Button
              variant="secondary"
              iconOnly={<Calendar1 />}
              onClick={handleTodayClick}
            >
              Today
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
