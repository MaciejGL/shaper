import { Card, CardContent } from '@/components/ui/card'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'

import { ClientAllergies } from './client-allergies'
import { ClientCardHeader } from './client-card-header'
import { ClientGoals } from './client-goals'

type ClientInfoProps = {
  client: NonNullable<GQLGetClientByIdQuery['userPublic']>
  clientName: string
  activePlan?: GQLGetClientByIdQuery['getClientActivePlan'] | null
}

export function ClientInfo({ client, clientName }: ClientInfoProps) {
  return (
    <Card className="lg:col-spans-1">
      <ClientCardHeader client={client} clientName={clientName} />

      <CardContent className="space-y-4">
        <ClientGoals goals={client.goals} />
        <ClientAllergies allergies={client.allergies} />
      </CardContent>
    </Card>
  )
}
