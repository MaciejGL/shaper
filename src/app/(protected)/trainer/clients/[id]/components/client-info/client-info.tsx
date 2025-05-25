import { Card, CardContent } from '@/components/ui/card'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'

import { ClientCardHeader } from './client-card-header'
import { ClientCurrentPlan } from './client-current-plan'
import { ClientGoals } from './client-goals'

type ClientInfoProps = {
  client: NonNullable<GQLGetClientByIdQuery['userPublic']>
  clientName: string
  activePlan?: GQLGetClientByIdQuery['getClientTrainingPlans'][number] | null
}

export function ClientInfo({
  client,
  clientName,
  activePlan,
}: ClientInfoProps) {
  return (
    <Card className="lg:col-spans-1">
      <ClientCardHeader client={client} clientName={clientName} />

      <CardContent className="space-y-4">
        <ClientCurrentPlan activePlan={activePlan} />
        <ClientGoals goals={client.goals} />
      </CardContent>
    </Card>
  )
}
