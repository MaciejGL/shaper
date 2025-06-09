import { redirect } from 'next/navigation'

import {
  FitspaceGetCurrentWorkoutIdDocument,
  GQLFitspaceGetCurrentWorkoutIdQuery,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

export default async function SessionPage() {
  const { data } = await gqlServerFetch<GQLFitspaceGetCurrentWorkoutIdQuery>(
    FitspaceGetCurrentWorkoutIdDocument,
  )

  if (data?.getMyPlansOverview?.activePlan?.id) {
    return redirect(
      `/fitspace/workout/${data.getMyPlansOverview.activePlan.id}`,
    )
  } else {
    return redirect('/fitspace/workout/quick-workout')
  }
}
