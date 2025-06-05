import { CardContent, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'

import { ExerciseLogs } from './plan-assignment/exercise-logs'
import { NoPlanCard } from './plan-assignment/no-plan-card'
import { PlanDetails } from './plan-assignment/plan-details'
import { ProgressOverview } from './plan-assignment/progress-overview'
import { WeeklyProgress } from './plan-assignment/weekly-progress'

export function ClientActivePlan({
  client,
  clientName,
  activePlan,
  hasAssignedPlans,
}: {
  client: NonNullable<GQLGetClientByIdQuery['userPublic']>
  clientName: string
  activePlan?: GQLGetClientByIdQuery['getClientActivePlan'] | null
  hasAssignedPlans: boolean
}) {
  return (
    <div>
      <CardTitle className="text-2xl font-semibold mb-4">Active Plan</CardTitle>

      <CardContent className="h-full p-0">
        {activePlan ? (
          <Tabs defaultValue="active-plan" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active-plan">Details</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="active-plan" className="mt-6 gap-6 grow">
              <PlanDetails assignedPlan={activePlan} />
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <div className="space-y-6">
                <ProgressOverview plan={activePlan} />
                <WeeklyProgress plan={activePlan} />
                <ExerciseLogs plan={activePlan} />
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <NoPlanCard
            clientName={clientName}
            clientId={client.id}
            activePlan={activePlan}
            hasAssignedPlans={hasAssignedPlans}
          />
        )}
      </CardContent>
    </div>
  )
}
