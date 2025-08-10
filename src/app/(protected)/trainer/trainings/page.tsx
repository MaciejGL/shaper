import { FilesIcon, PlusCircle } from 'lucide-react'

import { ButtonLink } from '@/components/ui/button-link'
import {
  GQLGetCollaborationTemplatesQuery,
  GQLGetTemplatesQuery,
  GetCollaborationTemplatesDocument,
  GetTemplatesDocument,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { DashboardHeader } from '../components/dashboard-header'

import { TrainingPlansList } from './components/training-plans-list'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [{ data: templatesData }, { data: collaborationData }] =
    await Promise.all([
      gqlServerFetch<GQLGetTemplatesQuery>(GetTemplatesDocument),
      gqlServerFetch<GQLGetCollaborationTemplatesQuery>(
        GetCollaborationTemplatesDocument,
      ),
    ])

  return (
    <div className="container h-full">
      <div className="flex items-baseline justify-between">
        <DashboardHeader
          title="Training Plans"
          description="Manage your training plans"
          icon={FilesIcon}
        />
        <ButtonLink
          href="/trainer/trainings/creator/new"
          iconStart={<PlusCircle />}
          className="self-baseline"
        >
          Create New Plan
        </ButtonLink>
      </div>

      <TrainingPlansList
        plans={templatesData?.getTemplates || []}
        collaborationPlans={collaborationData?.getCollaborationTemplates || []}
      />
    </div>
  )
}
