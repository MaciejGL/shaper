import { Edit } from 'lucide-react'

import { ButtonLink } from '@/components/ui/button-link'
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
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl font-semibold">Active Plan</div>
        {activePlan && (
          <ButtonLink
            href={`/trainer/trainings/creator/${activePlan.id}`}
            variant="secondary"
            size="sm"
            iconStart={<Edit className="h-4 w-4" />}
          >
            Edit Plan
          </ButtonLink>
        )}
      </div>

      {activePlan ? (
        <Tabs defaultValue="active-plan">
          <TabsList>
            <TabsTrigger value="active-plan">Details</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="exercise-logs">Exercise Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="active-plan" className="mt-2 gap-6 grow">
            <PlanDetails assignedPlan={activePlan} />
          </TabsContent>

          <TabsContent value="progress" className="mt-2">
            <div className="space-y-6">
              <ProgressOverview plan={activePlan} />
              <WeeklyProgress plan={activePlan} clientId={client.id} />
            </div>
          </TabsContent>

          <TabsContent value="exercise-logs" className="mt-2">
            <ExerciseLogs plan={activePlan} clientId={client.id} />
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
    </div>
  )
}
