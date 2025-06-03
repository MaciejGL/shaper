'use client'

import type { GQLGetClientByIdQuery } from '@/generated/graphql-client'
import { useRemoveTrainingPlanFromClientMutation } from '@/generated/graphql-client'

import { ActivePlanCard } from './active-plan-card'
import { NoPlanCard } from './no-plan-card'

type PlanAssignmentProps = {
  clientId: string
  clientName: string
  activePlan?: GQLGetClientByIdQuery['getClientTrainingPlans'][number] | null
  hasAssignedPlans: boolean
}

export default function PlanAssignment({
  clientId,
  clientName,
  activePlan,
  hasAssignedPlans,
}: PlanAssignmentProps) {
  const { mutateAsync: removePlan } = useRemoveTrainingPlanFromClientMutation(
    {},
  )

  return (
    <div className="flex flex-col h-full">
      {activePlan ? (
        <ActivePlanCard
          activePlan={activePlan}
          onRemove={() => removePlan({ planId: activePlan.id, clientId })}
        />
      ) : (
        <NoPlanCard
          clientName={clientName}
          clientId={clientId}
          activePlan={activePlan}
          hasAssignedPlans={hasAssignedPlans}
        />
      )}
    </div>
  )
}
