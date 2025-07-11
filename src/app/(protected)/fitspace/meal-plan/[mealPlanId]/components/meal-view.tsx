import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'

import { useMealPlan } from './meal-plan-context'
import { MealsList } from './meals-list'

export function MealView() {
  const { activeDay } = useMealPlan()

  if (!activeDay) return null

  return (
    <AnimatedPageTransition id={activeDay.id} variant="reveal" mode="wait">
      <MealsList meals={activeDay.meals} />
    </AnimatedPageTransition>
  )
}
