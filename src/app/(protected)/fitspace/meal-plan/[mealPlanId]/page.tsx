'use client'

import { redirect, useParams } from 'next/navigation'

import { Loader } from '@/components/loader'
import { useFitspaceGetMealPlanQuery } from '@/generated/graphql-client'

import { MealPlanPageClient } from './components/meal-plan-page.client'

export default function MealPlanPage() {
  const params = useParams<{ mealPlanId: string }>()
  const mealPlanId = params.mealPlanId
  const { data, isLoading } = useFitspaceGetMealPlanQuery(
    {
      mealPlanId,
    },
    {
      enabled: !!mealPlanId,
    },
  )

  if (isLoading) {
    return <Loader />
  }

  if (!data?.clientGetMealPlan) {
    return redirect('/fitspace/meal-plans')
  }

  return data?.clientGetMealPlan ? (
    <MealPlanPageClient plan={data.clientGetMealPlan.plan} />
  ) : null
}
