import { FilesIcon } from 'lucide-react'

import {
  GQLGetTemplatesQuery,
  GetTemplatesDocument,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { DashboardHeader } from '../components/dashboard-header'

import { CreatePlanButton } from './components/create-plan-button'
import { TrainingPlansList } from './components/training-plans-list'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const [{ data: templatesData }] = await Promise.all([
    gqlServerFetch<GQLGetTemplatesQuery>(GetTemplatesDocument),
  ])

  return (
    <div className="container h-full">
      <div className="flex items-baseline justify-between">
        <DashboardHeader
          title="Training Plans"
          description="Manage your training plans"
          icon={FilesIcon}
        />
        <CreatePlanButton />
      </div>

      <TrainingPlansList plans={templatesData?.getTemplates || []} />
    </div>
  )
}
