'use client'

import { User } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { use } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetClientByIdQuery } from '@/generated/graphql-client'

import { DashboardHeader } from '../../components/dashboard-header'

import { ClientActivePlan } from './components/client-active-plan'
import { ClientAssessment } from './components/client-assessment'
import { ClientInfo } from './components/client-info/client-info'
import { ClientMeasurements } from './components/client-measurements'
import { ClientMeetings } from './components/client-meetings/client-meetings'
import { ClientNotes } from './components/client-notes/client-notes'
import { ClientNutrition } from './components/client-nutrition/client-nutrition'
import { ClientServiceDeliveries } from './components/client-service-deliveries/client-service-deliveries'
import { ClientServices } from './components/client-services/client-services'
import { SharedPlansWithClient } from './components/shared-plans'

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data } = useGetClientByIdQuery({
    id,
  })

  // Controlled tab state with nuqs
  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsStringEnum<
      | 'info'
      | 'plans'
      | 'active-plan'
      | 'measurements'
      | 'nutrition'
      | 'services'
      | 'tasks'
    >([
      'info',
      'plans',
      'active-plan',
      'measurements',
      'nutrition',
      'services',
      'tasks',
    ])
      .withDefault('info')
      .withOptions({ clearOnDefault: true }),
  )

  const client = data?.userPublic

  if (!client) return null

  const activePlan = data?.getClientActivePlan
  const clientName =
    client.firstName && client.lastName
      ? `${client.firstName} ${client.lastName}`
      : client.email
  const hasAssignedPlans = data?.getClientTrainingPlans.length > 0

  return (
    <div className="container @container/client-detail-page mx-auto">
      <DashboardHeader
        title={clientName}
        icon={User}
        prevSegment={{ label: 'Clients', href: '/trainer/clients' }}
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as typeof activeTab)}
      >
        <div className="overflow-x-auto hide-scrollbar -mx-2 px-2 mb-4">
          <TabsList size="lg" className="w-max min-w-full">
            <TabsTrigger size="lg" value="info">
              Client Info
            </TabsTrigger>
            <TabsTrigger size="lg" value="plans">
              Assigned Plans
            </TabsTrigger>
            <TabsTrigger
              size="lg"
              value="active-plan"
              disabled={!hasAssignedPlans}
            >
              Active Plan
            </TabsTrigger>
            <TabsTrigger size="lg" value="measurements">
              Body Progress
            </TabsTrigger>
            <TabsTrigger size="lg" value="nutrition">
              Nutrition
            </TabsTrigger>
            <TabsTrigger size="lg" value="services">
              Send Offer
            </TabsTrigger>
            <TabsTrigger size="lg" value="tasks">
              Task Management
            </TabsTrigger>
            <TabsTrigger size="lg" value="meetings">
              Meetings
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="info">
          <div className="grid grid-cols-1 @3xl/client-detail-page:grid-cols-[3fr_4fr] gap-6">
            <div className="col-span-full">
              <ClientInfo
                client={client}
                clientName={clientName}
                activePlan={activePlan}
              />
            </div>
            <Card borderless>
              <CardContent>
                <ClientAssessment clientId={client.id} />
              </CardContent>
            </Card>
            <ClientNotes clientId={client.id} />
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <SharedPlansWithClient
            plans={data?.getClientTrainingPlans}
            clientName={clientName}
            clientId={client.id}
            activePlan={activePlan}
          />
        </TabsContent>

        <TabsContent value="active-plan">
          <ClientActivePlan
            client={client}
            clientName={clientName}
            activePlan={activePlan}
            hasAssignedPlans={hasAssignedPlans}
          />
        </TabsContent>

        <TabsContent value="measurements">
          <ClientMeasurements client={client} clientName={clientName} />
        </TabsContent>

        <TabsContent value="nutrition">
          <ClientNutrition clientId={client.id} />
        </TabsContent>

        <TabsContent value="services">
          <ClientServices
            clientId={client.id}
            clientName={clientName}
            clientEmail={client.email}
          />
        </TabsContent>

        <TabsContent value="tasks">
          <ClientServiceDeliveries
            clientId={client.id}
            clientName={clientName}
          />
        </TabsContent>

        <TabsContent value="meetings">
          <ClientMeetings clientId={client.id} clientName={clientName} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
