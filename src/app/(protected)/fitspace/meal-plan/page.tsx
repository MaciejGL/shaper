'use client'

import { format } from 'date-fns'
import { useQueryState } from 'nuqs'
import { useEffect, useMemo } from 'react'

import { Loader } from '@/components/loader'
import {
  useGetActiveMealPlanQuery,
  useGetDefaultMealPlanQuery,
} from '@/generated/graphql-client'
import { getStartOfWeekUTC, toISOString } from '@/lib/utc-date-utils'

import { MealPlanProvider } from './components/meal-plan-context'
import { MealView } from './components/meal-view'
import { Navigation } from './components/navigation'

export default function MealPlanPage() {
  const now = useMemo(() => format(new Date(), 'yyyy-MM-dd'), [])
  const [date, setDate] = useQueryState('date')
  useEffect(() => {
    if (!date) {
      setDate(now)
    }
  }, [date, now, setDate])

  const dateParam = date
    ? toISOString(getStartOfWeekUTC(date))
    : toISOString(getStartOfWeekUTC(new Date()))

  // Always fetch both plans - let UI decide which to show
  const { data: activePlanData, isLoading: isLoadingActive } =
    useGetActiveMealPlanQuery({
      date: dateParam,
    })

  const { data: defaultPlanData, isLoading: isLoadingDefault } =
    useGetDefaultMealPlanQuery({
      date: dateParam,
    })

  const isLoading = isLoadingActive || isLoadingDefault

  const activePlan = activePlanData?.getActiveMealPlan
  const defaultPlan = defaultPlanData?.getDefaultMealPlan

  return (
    <MealPlanProvider activePlan={activePlan} defaultPlan={defaultPlan}>
      <div className="flex flex-col h-full w-full">
        <Navigation />

        <div className="pb-24 pt-4 w-full max-w-sm mx-auto grow">
          {isLoading && (
            <div className="flex justify-center items-center h-[50vh]">
              <Loader />
            </div>
          )}
          <MealView />
        </div>
      </div>
    </MealPlanProvider>
  )
}
