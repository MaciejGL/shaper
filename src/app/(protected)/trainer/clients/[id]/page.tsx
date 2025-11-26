'use client'

import { User } from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { use } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetClientByIdQuery } from '@/generated/graphql-client'

import { DashboardHeader } from '../../components/dashboard-header'

import { ClientAssessment } from './components/client-assessment'
import { ClientInfo } from './components/client-info/client-info'
import { ClientMeasurements } from './components/client-measurements'
import { ClientMeetingsDashboard } from './components/client-meetings-dashboard/client-meetings-dashboard'
import { ClientNotes } from './components/client-notes/client-notes'
import { ClientProgramsDashboard } from './components/client-programs-dashboard/client-programs-dashboard'
import { ClientServicesDashboard } from './components/client-services-dashboard/client-services-dashboard'

type Tab = 'info' | 'programs' | 'measurements' | 'services' | 'meetings'

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { data } = useGetClientByIdQuery({
    id,
  })

  const [activeTab, setActiveTab] = useQueryState(
    'tab',
    parseAsStringEnum<Tab>([
      'info',
      'programs',
      'measurements',
      'services',
      'meetings',
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

  return (
    <div className="container @container/client-detail-page mx-auto">
      <DashboardHeader
        title={clientName}
        icon={User}
        prevSegment={{ label: 'Clients', href: '/trainer/clients' }}
      />

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as Tab)}
      >
        <div className="overflow-x-auto hide-scrollbar -mx-2 px-2 mb-4">
          <TabsList size="lg" className="w-max min-w-full">
            <TabsTrigger size="lg" value="info">
              Overview
            </TabsTrigger>
            <TabsTrigger size="lg" value="programs">
              Programs
            </TabsTrigger>
            <TabsTrigger size="lg" value="measurements">
              Measurements
            </TabsTrigger>
            <TabsTrigger size="lg" value="services">
              Services
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
            <Card>
              <CardContent>
                <ClientAssessment clientId={client.id} />
              </CardContent>
            </Card>
            <ClientNotes clientId={client.id} />
          </div>
        </TabsContent>

        <TabsContent value="programs">
          <ClientProgramsDashboard
            client={client}
            clientName={clientName}
            plans={data?.getClientTrainingPlans}
            activePlan={activePlan}
          />
        </TabsContent>

        <TabsContent value="measurements">
          <ClientMeasurements client={client} clientName={clientName} />
        </TabsContent>

        <TabsContent value="services">
          <ClientServicesDashboard
            clientId={client.id}
            clientName={clientName}
            clientEmail={client.email}
          />
        </TabsContent>

        <TabsContent value="meetings">
          <ClientMeetingsDashboard
            clientId={client.id}
            clientName={clientName}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
