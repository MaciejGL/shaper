'use client'

import { UserRoundCogIcon } from 'lucide-react'
import { use } from 'react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import '@/components/ui/card'
import { useGetClientByIdQuery } from '@/generated/graphql-client'

import { DashboardHeader } from '../../components/dashboard-header'

import { ClientDetails } from './components/client-details'
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

  const activePlan = data?.getClientTrainingPlans.find((plan) => plan.active)
  const clientName = `${client.firstName} ${client.lastName}`
  const hasAssignedPlans = data?.getClientTrainingPlans.length > 0

  return (
    <div className="container @container/client-detail-page mx-auto">
      <DashboardHeader
        title="Client Profile"
        prevSegment={{ label: 'Clients', href: '/trainer/clients' }}
      />

      <AnimatedPageTransition id="client-detail-page">
        <div className="grid grid-cols-1 @3xl/client-detail-page:grid-cols-[3fr_4fr] gap-6">
          <ClientInfo
            client={client}
            clientName={clientName}
            activePlan={activePlan}
          />

          <ClientDetails
            client={client}
            clientName={clientName}
            activePlan={activePlan}
            hasAssignedPlans={hasAssignedPlans}
          />

          <ClientNotes clientId={client.id} />
          <SharedPlansWithClient
            plans={data?.getClientTrainingPlans}
            clientName={clientName}
            clientId={client.id}
            activePlan={activePlan}
          />
        </div>
      </AnimatedPageTransition>
    </div>
  )
}
