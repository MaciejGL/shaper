import { Edit } from 'lucide-react'
import { parseAsInteger, parseAsString, useQueryState } from 'nuqs'

import { ButtonLink } from '@/components/ui/button-link'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'

import { ClientHeader } from './header'
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
  // Read deep-link query params directly
  const [week] = useQueryState('week', parseAsInteger)
  const [day] = useQueryState('day', parseAsInteger)
  const [exercise] = useQueryState('exercise', parseAsString)

  const hasDeepLink = week !== null && day !== null && exercise !== null
  return (
    <div>
      <ClientHeader
        title="Active Plan"
        action={
          activePlan && (
            <ButtonLink
              href={`/trainer/trainings/creator/${activePlan.id}`}
              size="sm"
              iconStart={<Edit />}
            >
              Edit Plan
            </ButtonLink>
          )
        }
      />

      {activePlan ? (
        <Tabs defaultValue={hasDeepLink ? 'progress' : 'active-plan'}>
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
