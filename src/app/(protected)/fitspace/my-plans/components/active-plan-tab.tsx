import { formatDate } from 'date-fns'
import { BicepsFlexed, ListMinus, Target } from 'lucide-react'
import {
  Calendar,
  Clock,
  MessageCircle,
  MoreHorizontalIcon,
  X,
} from 'lucide-react'
import { Pause } from 'lucide-react'
import { useQueryState } from 'nuqs'
import { parseAsStringEnum } from 'nuqs'

import { CollapsibleText } from '@/components/collapsible-text'
import { Loader } from '@/components/loader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import {
  DropdownMenu,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import { PlanAction, PlanTab } from '../page'
import { ActivePlan } from '../page'

export function ActivePlanTab({
  plan,
  handlePlanAction,
  loading,
}: {
  plan: ActivePlan | null
  handlePlanAction: (action: PlanAction, plan: ActivePlan) => void
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex-center min-h-[500px]">
        <Loader />
      </div>
    )
  }

  return (
    <div>
      {plan ? (
        <Card key={plan.id} variant="gradient">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <PlanHeader title={plan.title} loading={loading} />
              <PlanActions handlePlanAction={handlePlanAction} plan={plan} />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ProgressOverview
              currentWeekNumber={plan.currentWeekNumber}
              completedWorkoutsDays={plan.completedWorkoutsDays}
              adherence={plan.adherence}
              totalWorkouts={plan.totalWorkouts}
              weekCount={plan.weekCount}
            />

            <ProgressBar
              completedWorkoutsDays={plan.completedWorkoutsDays}
              totalWorkouts={plan.totalWorkouts}
            />
            <ActionButtons />
            <PlanDetails startDate={plan.startDate} endDate={plan.endDate} />

            <CollapsibleText text={plan.description} />
          </CardContent>
        </Card>
      ) : (
        <NoActivePlans />
      )}
    </div>
  )
}

function PlanHeader({ title, loading }: { title: string; loading: boolean }) {
  return (
    <div className="flex-1">
      <div className="mb-2">
        <CardTitle
          className={cn('text-xl', loading && 'masked-placeholder-text')}
        >
          {title}
        </CardTitle>
        <Badge variant="primary" isLoading={loading}>
          Active
        </Badge>
      </div>
    </div>
  )
}

function PlanActions({
  handlePlanAction,
  plan,
}: {
  handlePlanAction: (action: PlanAction, plan: ActivePlan) => void
  plan: ActivePlan
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          iconOnly={<MoreHorizontalIcon />}
        />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handlePlanAction('pause', plan)}>
          <Pause className="h-4 w-4 mr-2" />
          Pause Plan
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handlePlanAction('close', plan)}
          className="text-red-600"
        >
          <X className="h-4 w-4 mr-2" />
          Close Plan
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function ProgressOverview({
  currentWeekNumber,
  completedWorkoutsDays,
  adherence,
  totalWorkouts,
  weekCount,
}: {
  currentWeekNumber?: number | null
  completedWorkoutsDays: number
  adherence: number
  totalWorkouts: number
  weekCount: number
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="text-center p-3 bg-secondary rounded-lg">
        <div className="text-lg font-bold text-primary">
          {currentWeekNumber ?? 1}
        </div>
        <div className="text-xs text-muted-foreground">Current Week</div>
      </div>
      <div className="text-center p-3 bg-secondary rounded-lg">
        <div className="text-lg font-bold text-primary">
          {completedWorkoutsDays}
        </div>
        <div className="text-xs text-muted-foreground">Workouts Done</div>
      </div>
      <div className="text-center p-3 bg-secondary rounded-lg">
        <div className="text-lg font-bold text-primary">{adherence}%</div>
        <div className="text-xs text-muted-foreground">Adherence</div>
      </div>
      <div className="text-center p-3 bg-secondary rounded-lg">
        <div className="text-lg font-bold text-primary">
          {Math.round(totalWorkouts / weekCount)}x
        </div>
        <div className="text-xs text-muted-foreground">Per Week</div>
      </div>
    </div>
  )
}

function ProgressBar({
  completedWorkoutsDays,
  totalWorkouts,
}: {
  completedWorkoutsDays: number
  totalWorkouts: number
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Overall Progress</span>
        <span className="font-medium">
          {Math.round((completedWorkoutsDays / totalWorkouts) * 100)}%
        </span>
      </div>
      <Progress value={33} className="w-full" />
    </div>
  )
}

function ActionButtons() {
  return (
    <div className="flex gap-2 pt-2">
      <Button className="flex-1" iconEnd={<BicepsFlexed />}>
        Continue Plan
      </Button>
      <Button variant="outline" size="icon-lg" iconOnly={<MessageCircle />} />
    </div>
  )
}

function PlanDetails({
  startDate,
  endDate,
}: {
  startDate?: string | null
  endDate?: string | null
}) {
  const startDateFormatted = startDate
    ? formatDate(startDate, 'MMM d, yyyy')
    : null
  const endDateFormatted = endDate ? formatDate(endDate, 'MMM d, yyyy') : null

  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t">
      <div className="flex items-center gap-1">
        <Calendar className="h-4 w-4" />
        {startDateFormatted && <span>Started {startDateFormatted}</span>}
      </div>
      <div className="flex items-center gap-1">
        <Clock className="h-4 w-4" />
        {endDateFormatted && <span>Ends {endDateFormatted}</span>}
      </div>
    </div>
  )
}

function NoActivePlans() {
  const [, setTab] = useQueryState(
    'tab',
    parseAsStringEnum<PlanTab>([
      PlanTab.Active,
      PlanTab.Available,
      PlanTab.Completed,
    ]),
  )
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No Active Plans</h3>
        <p className="text-muted-foreground mb-4">
          You don't have any active training plans
        </p>

        <div className="flex justify-center gap-2">
          <Button
            iconStart={<ListMinus />}
            onClick={() => setTab(PlanTab.Available)}
          >
            Check Your Plans
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
