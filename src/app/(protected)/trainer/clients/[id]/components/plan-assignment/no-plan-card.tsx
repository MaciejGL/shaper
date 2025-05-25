import { Target } from 'lucide-react'

import { GQLGetClientByIdQuery } from '@/generated/graphql-client'

import { AssignPlanDialog } from './assignment-dialog'

type NoPlanCardProps = {
  clientName: string
  clientId: string
  activePlan?: GQLGetClientByIdQuery['getClientTrainingPlans'][number] | null
  hasAssignedPlans: boolean
}

export function NoPlanCard({
  clientName,
  clientId,
  activePlan,
  hasAssignedPlans,
}: NoPlanCardProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 h-full">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto">
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">No Active Plan</h3>
          <p className="text-muted-foreground text-sm">
            {clientName} doesn't have an active plan yet.
          </p>
        </div>
        {!hasAssignedPlans && (
          <AssignPlanDialog
            clientName={clientName}
            clientId={clientId}
            activePlan={activePlan}
          />
        )}
      </div>
    </div>
  )
}
