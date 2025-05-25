import { PlusCircle } from 'lucide-react'

import { ButtonLink } from '@/components/ui/button-link'
import {
  GQLGetTemplatesQuery,
  GetTemplatesDocument,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { TrainingPlansList } from './components/training-plans-list'

export default async function Page() {
  const { data } =
    await gqlServerFetch<GQLGetTemplatesQuery>(GetTemplatesDocument)

  return (
    <div className="container py-6 h-full space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Training Plans</h1>
        <div className="flex gap-2">
          <ButtonLink
            href="/trainer/trainings/creator/new"
            iconStart={<PlusCircle className="mr-2 h-4 w-4" />}
          >
            Create New Plan
          </ButtonLink>
        </div>
      </div>

      <TrainingPlansList plans={data?.getTemplates || []} />
    </div>
  )
}
