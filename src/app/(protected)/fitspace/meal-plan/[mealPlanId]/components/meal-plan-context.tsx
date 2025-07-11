'use client'

import { createContext, useContext, useMemo, useState } from 'react'

import { MealDay, MealPlan, MealWeek } from './meal-plan-page.client'

interface MealPlanContextType {
  plan: MealPlan | null
  activeWeek: MealWeek | null
  activeDay: MealDay | null
  setActiveWeekId: (weekId: string) => void
  setActiveDayId: (dayId: string) => void
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
  const [activeWeekId, setActiveWeekId] = useState<string | null>(null)
  const [activeDayId, setActiveDayId] = useState<string | null>(null)

  const activeWeek = useMemo(() => {
    if (!plan || !activeWeekId) return plan?.weeks[0] || null
    return plan.weeks.find((week) => week.id === activeWeekId) || null
  }, [plan, activeWeekId])

  const activeDay = useMemo(() => {
    if (!activeWeek || !activeDayId) return activeWeek?.days[0] || null
    return activeWeek.days.find((day) => day.id === activeDayId) || null
  }, [activeWeek, activeDayId])

  const value = useMemo(
    () => ({
      plan: plan || null,
      activeWeek,
      activeDay,
      setActiveWeekId,
      setActiveDayId,
    }),
    [plan, activeWeek, activeDay],
  )

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  )
}
