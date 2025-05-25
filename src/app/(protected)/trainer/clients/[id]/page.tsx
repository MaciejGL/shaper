'use client'

import { ArrowLeft } from 'lucide-react'
import { use } from 'react'

import { AnimatedPageTransition } from '@/components/animations/animated-page-transition'
import { ButtonLink } from '@/components/ui/button-link'
import '@/components/ui/card'
import { useGetClientByIdQuery } from '@/generated/graphql-client'

import { ClientDetails } from './components/client-details'
import { ClientInfo } from './components/client-info/client-info'
import { ClientNotes } from './components/client-notes'
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
    <div className="container @container/client-detail-page mx-auto py-6 space-y-6">
      <div>
        <ButtonLink
          variant="ghost"
          href="/trainer/clients"
          className="w-max"
          iconStart={<ArrowLeft className="h-4 w-4" />}
        >
          Clients
        </ButtonLink>
        <h1 className="text-2xl font-bold">Client Profile</h1>
      </div>

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
