import { redirect } from 'next/navigation'

import {
  FitspaceGetCurrentMealPlanIdDocument,
  GQLFitspaceGetCurrentMealPlanIdQuery,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

export default async function MealPlanPage() {
  const { data } = await gqlServerFetch<GQLFitspaceGetCurrentMealPlanIdQuery>(
    FitspaceGetCurrentMealPlanIdDocument,
  )

  if (data?.getMyMealPlansOverview?.activePlan?.id) {
    return redirect(
      `/fitspace/meal-plan/${data.getMyMealPlansOverview.activePlan.id}`,
    )
  } else {
    return redirect('/fitspace/meal-plans')
  }
}
