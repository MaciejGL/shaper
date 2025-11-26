'use client'

import { parseAsStringEnum, useQueryState } from 'nuqs'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'

import { ClientActivePlan } from '../client-active-plan'
import { ClientNutrition } from '../client-nutrition/client-nutrition'
import { SharedPlansWithClient } from '../shared-plans'

type SubTab = 'training' | 'active' | 'nutrition'

interface ClientProgramsProps {
  client: NonNullable<GQLGetClientByIdQuery['userPublic']>
  clientName: string
  plans: GQLGetClientByIdQuery['getClientTrainingPlans']
  activePlan: GQLGetClientByIdQuery['getClientActivePlan']
}

export function ClientPrograms({
  client,
  clientName,
  plans,
  activePlan,
}: ClientProgramsProps) {
  const hasAssignedPlans = plans && plans.length > 0

  const [subTab, setSubTab] = useQueryState(
    'subtab',
    parseAsStringEnum<SubTab>(['training', 'active', 'nutrition'])
      .withDefault('training')
      .withOptions({ clearOnDefault: true }),
  )

  return (
    <div className="space-y-4">
      <Tabs
        value={subTab}
        onValueChange={(value) => setSubTab(value as SubTab)}
      >
        <TabsList>
          <TabsTrigger value="training">Training Plans</TabsTrigger>
          <TabsTrigger value="active" disabled={!hasAssignedPlans}>
            Active Plan
          </TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
        </TabsList>

        <TabsContent value="training" className="mt-4">
          <SharedPlansWithClient
            plans={plans}
            clientName={clientName}
            clientId={client.id}
            activePlan={activePlan}
          />
        </TabsContent>

        <TabsContent value="active" className="mt-4">
          <ClientActivePlan
            client={client}
            clientName={clientName}
            activePlan={activePlan}
            hasAssignedPlans={hasAssignedPlans}
          />
        </TabsContent>

        <TabsContent value="nutrition" className="mt-4">
          <ClientNutrition clientId={client.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

