import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'

import PlanAssignment from './plan-assignment/plan-assignment'

export function ClientDetails({
  client,
  clientName,
  activePlan,
  hasAssignedPlans,
}: {
  client: NonNullable<GQLGetClientByIdQuery['userPublic']>
  clientName: string
  activePlan?: GQLGetClientByIdQuery['getClientTrainingPlans'][number] | null
  hasAssignedPlans: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Current Plan</CardTitle>
      </CardHeader>
      <CardContent className="h-full">
        <Tabs defaultValue="active-plan" className="h-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active-plan">Active Plan</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <TabsContent value="active-plan" className="mt-6 gap-6 grow">
            <PlanAssignment
              clientId={client.id}
              clientName={clientName}
              activePlan={activePlan ?? null}
              hasAssignedPlans={hasAssignedPlans}
            />
          </TabsContent>

          <TabsContent value="progress" className="mt-6">
            <div className="space-y-4">
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Progress tracking will be available once a plan is assigned.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
