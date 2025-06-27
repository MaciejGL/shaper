import { notFound } from 'next/navigation'

import {
  GQLGetTrainingPlanPreviewByIdQuery,
  GetTrainingPlanPreviewByIdDocument,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { TrainingOverview } from './components/training-preview'

export default async function TrainingPreviewPage({
  params,
}: {
  params: Promise<{ trainingId: string }>
}) {
  const { trainingId } = await params
  const { data } = await gqlServerFetch<GQLGetTrainingPlanPreviewByIdQuery>(
    GetTrainingPlanPreviewByIdDocument,
    { id: trainingId },
  )

  if (!data?.getTrainingPlanById) {
    return notFound()
  }

  return <TrainingOverview plan={data.getTrainingPlanById} />
}
