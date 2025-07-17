import { Calendar, Plus } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { startTransition, useMemo, useState } from 'react'

import { useIsFirstRender } from '@/components/animated-grid'
import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { SwipeableWrapper } from '@/components/swipeable-wrapper'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useWeekStartPreference } from '@/context/user-preferences-context'
import { useDateSwipeNavigation } from '@/hooks/use-swipe-navigation'
import { getExtendedWeekDays } from '@/lib/date-utils'

import { useMealPlan } from './meal-plan-context'
import { MealsList } from './meals-list'

export function MealView() {
  const { activeDay, activePlan, defaultPlan, isShowingActivePlan } =
    useMealPlan()
  const [date, setDate] = useQueryState('date')
  const [animationVariant, setAnimationVariant] = useState<
    'slideFromLeft' | 'slideFromRight'
  >('slideFromLeft')
  const isFirstRender = useIsFirstRender()

  const weekStartsOn = useWeekStartPreference()

  // Get corresponding day from default plan for custom logs tab
  const defaultPlanDay = useMemo(() => {
    if (!defaultPlan || !date) return null
    const defaultWeek = defaultPlan.weeks.at(0)
    if (!defaultWeek) return null
    return defaultWeek.days.find((day) => {
      // Match by day of week
      return activeDay ? day.dayOfWeek === activeDay.dayOfWeek : false
    })
  }, [defaultPlan, date, activeDay])

  // Get available days for the current week and adjacent days for cross-week navigation
  const availableDays = useMemo(() => {
    if (!date) return []
    return getExtendedWeekDays(date, weekStartsOn)
  }, [date, weekStartsOn])

  // Use the swipe navigation hook
  const { handleSwipeLeft, handleSwipeRight } = useDateSwipeNavigation({
    dates: availableDays,
    currentDate: date,
    onDateChange: (newDate, direction) => {
      if (newDate) {
        startTransition(() => {
          setAnimationVariant(
            direction === 'prev' ? 'slideFromRight' : 'slideFromLeft',
          )
          setTimeout(() => {
            setDate(newDate)
          }, 50)
        })
      }
    },
  })

  if (!activeDay) return null

  return (
    <SwipeableWrapper
      onSwipeLeft={handleSwipeLeft}
      onSwipeRight={handleSwipeRight}
      disabled={availableDays.length <= 1}
    >
      <AnimatedPageTransition
        id={activeDay.id}
        variant={isFirstRender ? 'fade' : animationVariant}
        mode="wait"
        className="w-full pr-1"
      >
        {isShowingActivePlan && activePlan && defaultPlan ? (
          // Show tabs when user has active plan
          <Tabs defaultValue="plan" className="w-full pb-32">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="plan" className="flex items-center gap-2">
                <Calendar className="size-4" />
                <span>Plan</span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="flex items-center gap-2">
                <Plus className="size-4" />
                <span>Food Logs</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="plan" className="mt-6">
              {/* Show structured meal plan - no custom food additions */}
              <MealsList
                planMeals={activeDay.meals || []}
                allowCustomFood={false}
              />
            </TabsContent>

            <TabsContent value="custom" className="mt-6">
              {/* Show default plan meals where user can add custom foods */}
              <MealsList
                planMeals={defaultPlanDay?.meals || []}
                allowCustomFood={true}
              />
            </TabsContent>
          </Tabs>
        ) : (
          // Show single plan (default plan) when no active plan
          <div className="pr-1">
            {/* Show meals from current plan based on date logic */}
            <MealsList
              planMeals={activeDay.meals || []}
              allowCustomFood={true}
            />
          </div>
        )}
      </AnimatedPageTransition>
    </SwipeableWrapper>
  )
}
