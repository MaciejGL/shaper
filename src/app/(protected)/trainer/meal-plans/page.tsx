import { PlusCircle, UtensilsIcon } from 'lucide-react'

import { ButtonLink } from '@/components/ui/button-link'
import {
  GQLGetMealPlanTemplatesQuery,
  GetMealPlanTemplatesDocument,
} from '@/generated/graphql-client'
import { gqlServerFetch } from '@/lib/gqlServerFetch'

import { DashboardHeader } from '../components/dashboard-header'

import { MealPlansList } from './components/meal-plans-list'

export const dynamic = 'force-dynamic'

export default async function MealPlansPage() {
  const { data } = await gqlServerFetch<GQLGetMealPlanTemplatesQuery>(
    GetMealPlanTemplatesDocument,
  )

  return (
    <div className="container h-full">
      <div className="flex items-baseline justify-between">
        <DashboardHeader
          title="Meal Plans"
          description="Manage your meal plans and nutrition templates"
          icon={<UtensilsIcon />}
        />
        <ButtonLink
          href="/trainer/meal-plans/creator/new"
          iconStart={<PlusCircle />}
          className="self-baseline"
        >
          Create New Plan
        </ButtonLink>
      </div>

      <MealPlansList plans={data?.getMealPlanTemplates || []} />
    </div>
  )
}
