'use client'

import { redirect, useParams } from 'next/navigation'
import { useQueryState } from 'nuqs'
import { useEffect, useMemo } from 'react'

import { Loader } from '@/components/loader'
import {
  GQLFitspaceGetMealPlanQuery,
  useFitspaceGetMealPlanQuery,
} from '@/generated/graphql-client'

import { MealPlanProvider } from './components/meal-plan-context'
import { MealView } from './components/meal-view'
import { Navigation } from './components/navigation'

export type MealPlan = NonNullable<
  GQLFitspaceGetMealPlanQuery['clientGetMealPlan']
>['plan']

export type MealWeek = NonNullable<MealPlan>['weeks'][number]

export type MealDay = NonNullable<MealWeek>['days'][number]

export type Meal = NonNullable<MealDay>['meals'][number]

export default function MealPlanPage() {
  const now = useMemo(() => new Date().toISOString(), [])
  const [date, setDate] = useQueryState('date')
  useEffect(() => {
    if (!date) {
      setDate(now)
    }
  }, [date, now, setDate])

  const { mealPlanId } = useParams<{ mealPlanId: string }>()
  const { data, isLoading } = useFitspaceGetMealPlanQuery({
    mealPlanId,
    date: date ? date : now,
  })

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    )
  }

  if (!data?.clientGetMealPlan) {
    return redirect('/fitspace/meal-plans')
  }

  return (
    <MealPlanProvider plan={data?.clientGetMealPlan?.plan}>
      <Navigation />
      <div className="max-w-sm mx-auto pb-24 pt-4">
        <MealView />
      </div>
    </MealPlanProvider>
  )
}
