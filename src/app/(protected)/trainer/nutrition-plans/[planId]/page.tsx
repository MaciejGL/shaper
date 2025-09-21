import {
  GQLGetNutritionPlanQuery,
  GetNutritionPlanDocument,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { NutritionPlanEditorClient } from './components/nutrition-plan-editor-client'

interface PageProps {
  params: Promise<{ planId: string }>
}

export default async function NutritionPlanEditPage({ params }: PageProps) {
  const { planId } = await params

  // Create promise for server data that client can consume
  const nutritionPlanPromise = gqlServerFetch<GQLGetNutritionPlanQuery>(
    GetNutritionPlanDocument,
    {
      id: planId,
    },
  )

  return (
    <NutritionPlanEditorClient
      planId={planId}
      nutritionPlanPromise={nutritionPlanPromise}
    />
  )
}
