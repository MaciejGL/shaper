'use client'

import { startOfWeek } from 'date-fns'
import { useQueryState } from 'nuqs'
import { createContext, useContext, useMemo } from 'react'

import {
  GQLGetActiveMealPlanQuery,
  GQLGetDefaultMealPlanQuery,
} from '@/generated/graphql-client'
import { isDayMatch } from '@/lib/date-utils'

// Type definitions for the meal plan data
export type MealPlan = NonNullable<
  | GQLGetActiveMealPlanQuery['getActiveMealPlan']
  | GQLGetDefaultMealPlanQuery['getDefaultMealPlan']
>

export type MealWeek = NonNullable<MealPlan>['weeks'][number]

export type MealDay = NonNullable<MealWeek>['days'][number]

export type Meal = NonNullable<MealDay>['meals'][number]

interface MealPlanContextType {
  activePlan: MealPlan | null
  defaultPlan: MealPlan | null
  currentPlan: MealPlan | null // The plan currently being shown based on date logic
  activeDay: MealDay | null
  isShowingActivePlan: boolean
}

const MealPlanContext = createContext<MealPlanContextType | null>(null)

export function useMealPlan() {
  const context = useContext(MealPlanContext)
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider')
  }
  return context
}

interface MealPlanProviderProps {
  children: React.ReactNode
  activePlan: MealPlan | null | undefined
  defaultPlan: MealPlan | null | undefined
}

export function MealPlanProvider({
  children,
  activePlan,
  defaultPlan,
}: MealPlanProviderProps) {
  const [date] = useQueryState('date')

  // Determine which plan to show based on date vs active plan start date
  const { currentPlan, isShowingActivePlan } = useMemo(() => {
    if (!activePlan || !date) {
      return {
        currentPlan: defaultPlan || null,
        isShowingActivePlan: false,
      }
    }

    // Check if current date is on or after the active plan start date
    if (activePlan.startDate) {
      const currentDate = startOfWeek(new Date(date), { weekStartsOn: 1 })
      const planStartDate = startOfWeek(new Date(activePlan.startDate), {
        weekStartsOn: 1,
      })

      if (currentDate >= planStartDate) {
        return {
          currentPlan: activePlan,
          isShowingActivePlan: true,
        }
      }
    }

    // Fall back to default plan
    return {
      currentPlan: defaultPlan || null,
      isShowingActivePlan: false,
    }
  }, [activePlan, defaultPlan, date])

  const activeWeek = useMemo(() => {
    if (!currentPlan) return null
    return currentPlan.weeks.at(0)
  }, [currentPlan])

  const activeDay = useMemo(() => {
    if (!activeWeek || !date) return null
    return (
      activeWeek.days.find((day) => isDayMatch(date, day.dayOfWeek)) || null
    )
  }, [activeWeek, date])

  const value = useMemo(
    () => ({
      activePlan: activePlan || null,
      defaultPlan: defaultPlan || null,
      currentPlan,
      activeDay,
      isShowingActivePlan,
    }),
    [activePlan, defaultPlan, currentPlan, activeDay, isShowingActivePlan],
  )

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  )
}
