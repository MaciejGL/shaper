'use client'

import { notFound } from 'next/navigation'
import { use } from 'react'

import {
  GQLGetNutritionPlanQuery,
  useGetNutritionPlanQuery,
} from '@/generated/graphql-client'

import { NutritionPlanEditor } from './nutrition-plan-editor'

interface NutritionPlanEditorClientProps {
  planId: string
  nutritionPlanPromise: Promise<
    | {
        data: GQLGetNutritionPlanQuery
        error: null
      }
    | {
        data: null
        error: string
      }
  >
}

export function NutritionPlanEditorClient({
  planId,
  nutritionPlanPromise,
}: NutritionPlanEditorClientProps) {
  // Unwrap server-side data
  const { data: serverData, error } = use(nutritionPlanPromise)

  if (error || !serverData?.nutritionPlan) {
    notFound()
  }

  // Use client query with server data as initial data
  const { data: clientData } = useGetNutritionPlanQuery(
    { id: planId },
    {
      initialData: serverData,
      initialDataUpdatedAt: Date.now(),
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  )

  // Use client data if available, fall back to server data
  const nutritionPlan = clientData?.nutritionPlan || serverData.nutritionPlan

  return <NutritionPlanEditor nutritionPlan={nutritionPlan} />
}
