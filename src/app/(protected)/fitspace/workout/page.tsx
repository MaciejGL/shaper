import { redirect } from 'next/navigation'

import {
  FitspaceGetActivePlanIdDocument,
  FitspaceGetUserQuickWorkoutPlanDocument,
  GQLFitspaceGetActivePlanIdQuery,
  GQLFitspaceGetUserQuickWorkoutPlanQuery,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

export default async function SessionPage() {
  const { data } = await gqlServerFetch<GQLFitspaceGetActivePlanIdQuery>(
    FitspaceGetActivePlanIdDocument,
  )

  const { data: quickWorkoutPlanData } =
    await gqlServerFetch<GQLFitspaceGetUserQuickWorkoutPlanQuery>(
      FitspaceGetUserQuickWorkoutPlanDocument,
    )

  if (data?.getActivePlanId) {
    return redirect(`/fitspace/workout/${data.getActivePlanId}`)
  } else if (quickWorkoutPlanData?.getQuickWorkoutPlan?.id) {
    return redirect(
      `/fitspace/workout/${quickWorkoutPlanData.getQuickWorkoutPlan.id}`,
    )
  } else {
    return redirect('/fitspace/my-plans')
  }
}
