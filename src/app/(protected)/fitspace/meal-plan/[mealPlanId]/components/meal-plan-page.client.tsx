'use client'

import { useParams } from 'next/navigation'

import {
  GQLFitspaceGetMealPlanQuery,
  useFitspaceGetMealPlanQuery,
} from '@/generated/graphql-client'

import { MealPlanProvider } from './meal-plan-context'
import { MealView } from './meal-view'
import { Navigation } from './navigation'

export type MealPlan = NonNullable<
  GQLFitspaceGetMealPlanQuery['clientGetMealPlan']
>['plan']

export type MealWeek = NonNullable<MealPlan>['weeks'][number]

export type MealDay = NonNullable<MealWeek>['days'][number]

export type Meal = NonNullable<MealDay>['meals'][number]

interface MealPlanPageClientProps {
  plan: MealPlan
}

export function MealPlanPageClient({ plan }: MealPlanPageClientProps) {
  const { mealPlanId } = useParams<{ mealPlanId: string }>()
  const { data, isLoading } = useFitspaceGetMealPlanQuery(
    {
      mealPlanId,
    },
    {
      initialData: {
        clientGetMealPlan: {
          plan,
        },
      },
    },
  )

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!data?.clientGetMealPlan && !isLoading) {
    return <div>Error</div>
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
