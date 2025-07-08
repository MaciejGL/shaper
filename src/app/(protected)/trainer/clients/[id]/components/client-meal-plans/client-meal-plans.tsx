import { GQLGetClientByIdQuery } from '@/generated/graphql-client'

import { AssignMealPlanDialog } from './assign-meal-plan-dialog'
import { MealPlansList } from './meal-plans-list'

type ClientMealPlansProps = {
  client: NonNullable<GQLGetClientByIdQuery['userPublic']>
  clientName: string
}

export function ClientMealPlans({ client, clientName }: ClientMealPlansProps) {
  return (
    <div className="@container/client-meal-plans">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Meal Plans</h2>
        <AssignMealPlanDialog clientName={clientName} clientId={client.id} />
      </div>
      <MealPlansList clientId={client.id} />
    </div>
  )
}
