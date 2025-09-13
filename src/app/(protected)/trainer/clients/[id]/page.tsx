'use client'

import { User } from 'lucide-react'
import { use } from 'react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useGetClientByIdQuery } from '@/generated/graphql-client'

import { DashboardHeader } from '../../components/dashboard-header'

import { ClientActivePlan } from './components/client-active-plan'
import { ClientInfo } from './components/client-info/client-info'
import { ClientMacroTargets } from './components/client-macro-targets'
import { ClientMeasurements } from './components/client-measurements'
import { ClientNotes } from './components/client-notes/client-notes'
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

  const client = data?.userPublic

  if (!client) return null

  const activePlan = data?.getClientActivePlan
  const clientName = `${client.firstName} ${client.lastName}`
  const hasAssignedPlans = data?.getClientTrainingPlans.length > 0

  return (
    <div className="container @container/client-detail-page mx-auto">
      <DashboardHeader
        title="Client Profile"
        icon={User}
        prevSegment={{ label: 'Clients', href: '/trainer/clients' }}
      />
      <Tabs defaultValue="info">
        <div className="overflow-x-auto hide-scrollbar -mx-2 px-2 mb-4">
          <TabsList size="lg" className="w-max min-w-full">
            <TabsTrigger size="lg" value="info">
              Client Info
            </TabsTrigger>
            <TabsTrigger size="lg" value="plans">
              Manage Plans
            </TabsTrigger>
            <TabsTrigger
              size="lg"
              value="active-plan"
              disabled={!hasAssignedPlans}
            >
              Active Plan
            </TabsTrigger>
            <TabsTrigger size="lg" value="measurements">
              Measurements Logs
            </TabsTrigger>
            <TabsTrigger size="lg" value="nutrition">
              Nutrition
            </TabsTrigger>
            <TabsTrigger size="lg" value="services">
              Services & Offers
            </TabsTrigger>
            <TabsTrigger size="lg" value="tasks">
              Task Management
            </TabsTrigger>
          </TabsList>
        </div>
        <AnimatedPageTransition id="info">
          <TabsContent value="info">
            <div className="grid grid-cols-1 @3xl/client-detail-page:grid-cols-[3fr_4fr] gap-6">
              <ClientInfo
                client={client}
                clientName={clientName}
                activePlan={activePlan}
              />
              <ClientNotes clientId={client.id} />
            </div>
          </TabsContent>
        </AnimatedPageTransition>
        <AnimatedPageTransition id="plans">
          <TabsContent value="plans">
            <SharedPlansWithClient
              plans={data?.getClientTrainingPlans}
              clientName={clientName}
              clientId={client.id}
              activePlan={activePlan}
            />
          </TabsContent>
        </AnimatedPageTransition>
        <AnimatedPageTransition id="active-plan">
          <TabsContent value="active-plan">
            <ClientActivePlan
              client={client}
              clientName={clientName}
              activePlan={activePlan}
              hasAssignedPlans={hasAssignedPlans}
            />
          </TabsContent>
        </AnimatedPageTransition>
        <AnimatedPageTransition id="measurements">
          <TabsContent value="measurements">
            <ClientMeasurements client={client} clientName={clientName} />
          </TabsContent>
        </AnimatedPageTransition>
        <AnimatedPageTransition id="nutrition">
          <TabsContent value="nutrition">
            <ClientMacroTargets clientId={client.id} clientName={clientName} />
          </TabsContent>
        </AnimatedPageTransition>
        <AnimatedPageTransition id="services">
          <TabsContent value="services">
            <ClientServices
              clientId={client.id}
              clientName={clientName}
              clientEmail={client.email}
            />
          </TabsContent>
        </AnimatedPageTransition>
        <AnimatedPageTransition id="tasks">
          <TabsContent value="tasks">
            <ClientServiceDeliveries
              clientId={client.id}
              clientName={clientName}
            />
          </TabsContent>
        </AnimatedPageTransition>
      </Tabs>
    </div>
  )
}
