'use client'

import {
  Calendar,
  Clock,
  Dumbbell,
  Edit,
  LucideFilePlus2,
  MoreVertical,
  Target,
  Trash2Icon,
  Utensils,
} from 'lucide-react'
import { parseAsStringEnum, useQueryState } from 'nuqs'
import { useState } from 'react'
import { toast } from 'sonner'

import { useConfirmationModalContext } from '@/components/confirmation-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  GQLGetClientByIdQuery,
  useGetClientByIdQuery,
  useRemoveTrainingPlanFromClientMutation,
} from '@/generated/graphql-client'
import { useInvalidateQuery } from '@/lib/invalidate-query'
import { cn } from '@/lib/utils'

import { ClientMacroTargets } from '../client-macro-targets'
import { NutritionPlansSection } from '../client-nutrition/nutrition-plans-section'
import { AssignPlanDialog } from '../plan-assignment/assignment-dialog'
import { NoPlanCard } from '../plan-assignment/no-plan-card'
import { PlanDetails } from '../plan-assignment/plan-details'
import { ProgressOverview } from '../plan-assignment/progress-overview'
import { WeeklyProgress } from '../plan-assignment/weekly-progress'

type ProgramSubTab = 'training' | 'active' | 'nutrition'

interface ClientProgramsDashboardProps {
  client: NonNullable<GQLGetClientByIdQuery['userPublic']>
  clientName: string
  plans: GQLGetClientByIdQuery['getClientTrainingPlans']
  activePlan: GQLGetClientByIdQuery['getClientActivePlan']
}

export function ClientProgramsDashboard({
  client,
  clientName,
  plans,
  activePlan,
}: ClientProgramsDashboardProps) {
  const [subTab, setSubTab] = useQueryState(
    'subtab',
    parseAsStringEnum<ProgramSubTab>(['training', 'active', 'nutrition'])
      .withDefault('training')
      .withOptions({ clearOnDefault: true }),
  )

  const hasAssignedPlans = plans && plans.length > 0

  return (
    <div className="grid grid-cols-1 @3xl/client-detail-page:grid-cols-[3fr_2fr] gap-6">
      {/* Left Column: Main Content */}
      <div className="space-y-6">
        <Tabs
          value={subTab}
          onValueChange={(value) => setSubTab(value as ProgramSubTab)}
        >
          <div className="overflow-x-auto hide-scrollbar -mx-2 px-2">
            <TabsList className="w-max min-w-full">
              <TabsTrigger value="training">
                <Dumbbell className="size-4 mr-2" />
                Training Plans
              </TabsTrigger>
              <TabsTrigger value="active" disabled={!hasAssignedPlans}>
                <Target className="size-4 mr-2" />
                Active Plan
              </TabsTrigger>
              <TabsTrigger value="nutrition">
                <Utensils className="size-4 mr-2" />
                Nutrition
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="training">
            <TrainingPlansSection
              plans={plans || []}
              clientName={clientName}
              clientId={client.id}
              activePlan={activePlan}
            />
          </TabsContent>

          <TabsContent value="active">
            <ActivePlanSection
              client={client}
              clientName={clientName}
              activePlan={activePlan}
              hasAssignedPlans={hasAssignedPlans}
            />
          </TabsContent>

          <TabsContent value="nutrition">
            <NutritionSection clientId={client.id} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column: Dynamic Stats based on active tab */}
      <div className="space-y-6">
        {subTab === 'training' && (
          <TrainingStatsCard plans={plans || []} activePlan={activePlan} />
        )}
        {subTab === 'active' && activePlan && (
          <ActivePlanStatsCard activePlan={activePlan} />
        )}
        {subTab === 'nutrition' && <NutritionStatsCard />}
      </div>
    </div>
  )
}

interface TrainingPlansSectionProps {
  plans: NonNullable<GQLGetClientByIdQuery['getClientTrainingPlans']>
  clientName: string
  clientId: string
  activePlan: GQLGetClientByIdQuery['getClientActivePlan']
}

function TrainingPlansSection({
  plans,
  clientName,
  clientId,
  activePlan,
}: TrainingPlansSectionProps) {
  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Dumbbell className="size-12 text-muted-foreground mb-4 opacity-50" />
          <CardTitle className="text-lg mb-2">No plans assigned</CardTitle>
          <CardDescription className="text-center mb-4">
            Assign a training plan to {clientName} to get started
          </CardDescription>
          <AssignPlanDialog
            clientName={clientName}
            clientId={clientId}
            activePlan={activePlan}
            trigger={
              <Button iconStart={<LucideFilePlus2 />}>Assign Plan</Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Assigned Plans</h3>
          <p className="text-sm text-muted-foreground">
            All plans assigned to {clientName}
          </p>
        </div>
        <AssignPlanDialog
          clientName={clientName}
          clientId={clientId}
          activePlan={activePlan}
          trigger={
            <Button size="sm" iconStart={<LucideFilePlus2 />}>
              Assign Plan
            </Button>
          }
        />
      </div>

      <div className="grid gap-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            clientName={clientName}
            clientId={clientId}
          />
        ))}
      </div>
    </div>
  )
}

interface PlanCardProps {
  plan: NonNullable<GQLGetClientByIdQuery['getClientTrainingPlans']>[number]
  clientName: string
  clientId: string
}

function PlanCard({ plan, clientName, clientId }: PlanCardProps) {
  const invalidateQuery = useInvalidateQuery()
  const { openModal } = useConfirmationModalContext()
  const [isUpdating, setIsUpdating] = useState(false)

  const { mutateAsync: removeTrainingPlanFromClient } =
    useRemoveTrainingPlanFromClientMutation({
      onSuccess: () => {
        toast.success('Training plan removed from client')
        invalidateQuery({
          queryKey: useGetClientByIdQuery.getKey({ id: clientId }),
        })
      },
    })

  const handleRemove = () => {
    openModal({
      title: 'Remove Training Plan',
      description: `Are you sure you want to remove ${plan.title} from ${clientName}?`,
      onConfirm: async () => {
        setIsUpdating(true)
        try {
          await removeTrainingPlanFromClient({
            clientId,
            planId: plan.id,
          })
        } finally {
          setIsUpdating(false)
        }
      },
    })
  }

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md overflow-hidden',
        plan.active && 'border-primary ring-1 ring-primary/10',
      )}
    >
      <CardContent>
        <div className="flex flex-col sm:flex-row">
          <div className="flex-1">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  'p-2.5 rounded-xl shrink-0',
                  plan.active
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground',
                )}
              >
                <Dumbbell className="size-5" />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-base leading-none truncate">
                    {plan.title}
                  </h4>
                  {plan.active && (
                    <Badge variant="primary" className="h-5 px-1.5 text-[10px]">
                      Active
                    </Badge>
                  )}
                </div>
                {plan.description && (
                  <p className="text-sm text-muted-foreground line-clamp-1">
                    {plan.description}
                  </p>
                )}
                <div className="flex items-center gap-3 pt-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded">
                    <Calendar className="size-3.5" />
                    <span>{plan.weekCount} weeks</span>
                  </div>
                  {plan.nextSession && (
                    <div className="flex items-center gap-1.5 bg-muted/40 px-2 py-1 rounded">
                      <Clock className="size-3.5" />
                      <span>Next: {plan.nextSession}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                disabled={isUpdating}
                title="Options"
                variant="ghost"
                size="icon-md"
              >
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  (window.location.href = `/trainer/trainings/creator/${plan.id}`)
                }
              >
                <Edit className="size-4 mr-2" /> Edit Plan
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleRemove}
                loading={isUpdating}
                className="text-destructive focus:text-destructive"
              >
                <Trash2Icon className="size-4 mr-2" /> Remove Plan
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

interface ActivePlanSectionProps {
  client: NonNullable<GQLGetClientByIdQuery['userPublic']>
  clientName: string
  activePlan: GQLGetClientByIdQuery['getClientActivePlan']
  hasAssignedPlans: boolean
}

function ActivePlanSection({
  client,
  clientName,
  activePlan,
  hasAssignedPlans,
}: ActivePlanSectionProps) {
  if (!activePlan) {
    return (
      <NoPlanCard
        clientName={clientName}
        clientId={client.id}
        activePlan={activePlan}
        hasAssignedPlans={hasAssignedPlans}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{activePlan.title}</h3>
          <p className="text-sm text-muted-foreground">
            Current active training plan
          </p>
        </div>
        <ButtonLink
          href={`/trainer/trainings/creator/${activePlan.id}`}
          size="sm"
          iconStart={<Edit />}
        >
          Edit Plan
        </ButtonLink>
      </div>

      <PlanDetails assignedPlan={activePlan} />

      <div className="space-y-6">
        <ProgressOverview plan={activePlan} />
        <WeeklyProgress plan={activePlan} clientId={client.id} />
      </div>
    </div>
  )
}

interface NutritionSectionProps {
  clientId: string
}

function NutritionSection({ clientId }: NutritionSectionProps) {
  return (
    <div className="space-y-6">
      <ClientMacroTargets clientId={clientId} />
      <NutritionPlansSection clientId={clientId} />
    </div>
  )
}

// Right sidebar stats cards

interface TrainingStatsCardProps {
  plans: NonNullable<GQLGetClientByIdQuery['getClientTrainingPlans']>
  activePlan: GQLGetClientByIdQuery['getClientActivePlan']
}

function TrainingStatsCard({ plans, activePlan }: TrainingStatsCardProps) {
  const totalWeeks = plans.reduce((sum, plan) => sum + plan.weekCount, 0)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Training Overview</CardTitle>
          <CardDescription>All assigned plans statistics</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Dumbbell className="size-4 text-muted-foreground" />
              Total Plans
            </div>
            <span className="text-2xl font-semibold">{plans.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="size-4 text-muted-foreground" />
              Total Weeks
            </div>
            <span className="text-2xl font-semibold">{totalWeeks}</span>
          </div>
        </CardContent>
      </Card>

      {activePlan && (
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
            <CardDescription className="line-clamp-1">
              {activePlan.title}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">Duration</p>
                <p className="text-lg font-semibold">{activePlan.weekCount}w</p>
              </div>
              {activePlan.weeks?.[0]?.days && (
                <div className="p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">
                    Days/Week
                  </p>
                  <p className="text-lg font-semibold">
                    {
                      activePlan.weeks[0].days.filter((d) => !d.isRestDay)
                        .length
                    }
                  </p>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Progress</span>
                <span className="text-sm font-semibold">
                  {activePlan.progress || 0}%
                </span>
              </div>
              <Progress value={activePlan.progress || 0} className="h-2" />
            </div>
            <ButtonLink
              href={`/trainer/trainings/creator/${activePlan.id}`}
              size="sm"
              variant="secondary"
              iconStart={<Edit />}
              className="w-full"
            >
              Edit Plan
            </ButtonLink>
          </CardContent>
        </Card>
      )}
    </>
  )
}

interface ActivePlanStatsCardProps {
  activePlan: NonNullable<GQLGetClientByIdQuery['getClientActivePlan']>
}

function ActivePlanStatsCard({ activePlan }: ActivePlanStatsCardProps) {
  const totalWorkouts = activePlan.totalWorkouts || 0
  const completedWorkouts = activePlan.completedWorkoutsDays || 0
  const currentWeek = activePlan.currentWeekNumber || 0
  const adherence = activePlan.adherence || 0

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Plan Statistics</CardTitle>
          <CardDescription>Overall performance metrics</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Target className="size-3.5 text-primary" />
                <p className="text-xs text-muted-foreground">Current Week</p>
              </div>
              <p className="text-2xl font-semibold text-primary">
                {currentWeek}
              </p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Total Weeks</p>
              <p className="text-2xl font-semibold">{activePlan.weekCount}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Workouts</span>
                <span className="text-sm text-muted-foreground">
                  {completedWorkouts}/{totalWorkouts}
                </span>
              </div>
              <Progress
                value={(completedWorkouts / totalWorkouts) * 100}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Adherence</span>
                <span className="text-sm font-semibold text-primary">
                  {adherence}%
                </span>
              </div>
              <Progress value={adherence} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {activePlan.nextSession && (
        <Card>
          <CardHeader>
            <CardTitle>Next Session</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
              <Clock className="size-5 text-muted-foreground" />
              <p className="text-sm font-medium">{activePlan.nextSession}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}

function NutritionStatsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nutrition Overview</CardTitle>
        <CardDescription>Macro targets and meal plans</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
          <Utensils className="size-6 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Macro Targets Set</p>
            <p className="text-xs text-muted-foreground">
              Track daily nutrition goals
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
