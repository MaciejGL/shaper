import { redirect } from 'next/navigation'

import {
  FitspaceGetActivePlanIdDocument,
  GQLFitspaceGetActivePlanIdQuery,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

export default async function SessionPage() {
  const { data } = await gqlServerFetch<GQLFitspaceGetActivePlanIdQuery>(
    FitspaceGetActivePlanIdDocument,
  )

  if (data?.getActivePlanId) {
    return redirect(`/fitspace/workout/${data.getActivePlanId}`)
  } else {
    return redirect('/fitspace/workout/quick-workout')
  }
}
