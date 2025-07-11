import { useQueryState } from 'nuqs'
import { startTransition, useMemo, useState } from 'react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { SwipeableWrapper } from '@/components/swipeable-wrapper'
import { useDateSwipeNavigation } from '@/hooks/use-swipe-navigation'
import { getWeekDays } from '@/lib/date-utils'

import { useMealPlan } from './meal-plan-context'
import { MealsList } from './meals-list'

export function MealView() {
  const { activeDay } = useMealPlan()
  const [date, setDate] = useQueryState('date')
  const [animationVariant, setAnimationVariant] = useState<
    'slideFromLeft' | 'slideFromRight'
  >('slideFromLeft')

  // Get available days for the current week
  const availableDays = useMemo(() => {
    if (!date) return []
    return getWeekDays(date)
  }, [date])

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
        variant={animationVariant}
        mode="wait"
        className="w-full"
      >
        <MealsList meals={activeDay.meals} />
      </AnimatedPageTransition>
    </SwipeableWrapper>
  )
}
