'use client'

import { use } from 'react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import '@/components/ui/card'
import { useGetClientByIdQuery } from '@/generated/graphql-client'

import { DashboardHeader } from '../../components/dashboard-header'

import { ClientActivePlan } from './components/client-active-plan'
import { ClientInfo } from './components/client-info/client-info'
import { ClientNotes } from './components/client-notes/client-notes'
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
        prevSegment={{ label: 'Clients', href: '/trainer/clients' }}
      />

      <AnimatedPageTransition id="client-detail-page">
        <div className="grid grid-cols-1 @3xl/client-detail-page:grid-cols-[3fr_4fr] gap-10">
          <ClientInfo
            client={client}
            clientName={clientName}
            activePlan={activePlan}
          />

          <SharedPlansWithClient
            plans={data?.getClientTrainingPlans}
            clientName={clientName}
            clientId={client.id}
            activePlan={activePlan}
          />
          <div className="@3xl/client-detail-page:col-span-2">
            <ClientActivePlan
              client={client}
              clientName={clientName}
              activePlan={activePlan}
              hasAssignedPlans={hasAssignedPlans}
            />
          </div>

          <ClientNotes clientId={client.id} />
        </div>
      </AnimatedPageTransition>
    </div>
  )
}
