import { RulerIcon, WeightIcon } from 'lucide-react'
import { Calendar } from 'lucide-react'

import { Card, CardContent, CardDescription } from '@/components/ui/card'
import { HeightDisplay } from '@/components/ui/height-display'
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
  const age = client.birthday
    ? new Date().getFullYear() - new Date(client.birthday).getFullYear()
    : null

  return (
    <Card borderless variant="tertiary">
      <CardContent className="grid grid-cols-1 @3xl/client-detail-page:grid-cols-[3fr_4fr] gap-6 items-center">
        <ClientCardHeader client={client} clientName={clientName} />

        <div className="flex flex-col gap-2 space-y-2">
          <div className="">
            <h4 className="font-medium mb-2">Personal Info</h4>
            <CardDescription className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center gap-2">
                <WeightIcon className="h-4 w-4" />
                {client.currentWeight} kg
              </div>
              <div className="flex items-center gap-2">
                <RulerIcon className="h-4 w-4" />
                <HeightDisplay heightInCm={client.height} />
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {age ? `${age} years old` : ''}
              </div>
            </CardDescription>
          </div>
          <div className="">
            <ClientGoals goals={client.goals} />
          </div>
          <div className="">
            <ClientAllergies allergies={client.allergies} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
