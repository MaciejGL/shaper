import { Dumbbell } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'

export function ClientCurrentPlan({
  activePlan,
}: {
  activePlan?: GQLGetClientByIdQuery['getClientTrainingPlans'][number] | null
}) {
  return (
    <div className="pt-4 space-y-2">
      <div className="flex items-center text-sm">
        <Dumbbell className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="font-medium">Current Plan:</span>

        {activePlan?.title ? (
          <span className="ml-1">{activePlan?.title}</span>
        ) : (
          <span className="ml-1">No active plan</span>
        )}
      </div>
      <div className="space-y-1 pt-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Progress</span>
          <span>{activePlan?.progress}%</span>
        </div>
        <Progress value={activePlan?.progress ?? 0} className="h-2" />
      </div>
      {/* {activePlan && (
        <div className="flex items-center text-sm">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-medium">Start Date:</span>
          <span className="ml-1">{formatDate(client.startDate)}</span>
        </div>
      )} */}
    </div>
  )
}
