'use client'

import { useQueryState } from 'nuqs'
import { createContext, useContext, useMemo } from 'react'

import { isDayMatch } from '@/lib/date-utils'

import { MealDay, MealPlan } from '../page'

interface MealPlanContextType {
  plan: MealPlan | null
  activeDay: MealDay | null
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
  plan: MealPlan | null | undefined
}

export function MealPlanProvider({ children, plan }: MealPlanProviderProps) {
  const [date] = useQueryState('date')
  const activeWeek = useMemo(() => {
    if (!plan) return null
    return plan.weeks.at(0)
  }, [plan])

  const activeDay = useMemo(() => {
    if (!activeWeek || !date) return null
    return (
      activeWeek.days.find((day) => isDayMatch(date, day.dayOfWeek)) || null
    )
  }, [activeWeek, date])

  const value = useMemo(
    () => ({
      plan: plan || null,
      activeDay,
    }),
    [plan, activeDay],
  )

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  )
}
