import { Dumbbell, MoreHorizontal, Star, TrendingUp } from 'lucide-react'
import { notFound } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { GQLGetTrainingPlanPreviewByIdQuery } from '@/generated/graphql-client'

import { PlanActionDialog } from '../../../my-plans/components/plan-action-dialog/plan-action-dialog'
import { usePlanAction } from '../../../my-plans/components/plan-action-dialog/use-plan-action'

type HeaderProps = {
  plan: Pick<
    GQLGetTrainingPlanPreviewByIdQuery['getTrainingPlanById'],
    | 'title'
    | 'rating'
    | 'totalReviews'
    | 'difficulty'
    | 'id'
    | 'weekCount'
    | 'totalWorkouts'
    | 'startDate'
    | 'assignedTo'
    | 'active'
  > | null
  isDemo: boolean
}

export function Header({ plan, isDemo }: HeaderProps) {
  const {
    dialogState,
    handlePlanAction,
    handleConfirmAction,
    isActivatingPlan,
    isPausingPlan,
    isClosingPlan,
    isDeletingPlan,
    handleCloseDialog,
  } = usePlanAction()

  if (!plan) return notFound()

  const isMyPlan = plan.assignedTo?.id

  return (
    <div className="border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-row gap-4 justify-between">
          <div className="flex items-start gap-4">
            <div className="max-md:hidden size-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
              <Dumbbell className="size-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{plan.title}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="font-medium">{plan.rating}</span>
                  <span className="text-muted-foreground">
                    ({plan.totalReviews} reviews)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary">{plan.difficulty}</Badge>
                  {isMyPlan && (
                    <Badge variant="secondary">
                      {plan.active ? 'Active' : 'Assigned To Account'}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
          {isDemo && (
            <Button size="lg" className="gap-2" iconStart={<TrendingUp />}>
              Get Program
            </Button>
          )}
          {!isDemo && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon-lg"
                  className="gap-2"
                  iconOnly={<MoreHorizontal />}
                ></Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {!plan.startDate && (
                  <DropdownMenuItem
                    onClick={() => handlePlanAction('activate', plan)}
                  >
                    Activate
                  </DropdownMenuItem>
                )}
                {plan.startDate && (
                  <DropdownMenuItem
                    onClick={() => handlePlanAction('pause', plan)}
                  >
                    Pause
                  </DropdownMenuItem>
                )}
                {plan.startDate && (
                  <DropdownMenuItem
                    onClick={() => handlePlanAction('close', plan)}
                  >
                    Close
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => handlePlanAction('delete', plan)}
                >
                  Remove from my plans
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {dialogState.plan && (
        <PlanActionDialog
          isOpen={dialogState.isOpen}
          onClose={handleCloseDialog}
          action={dialogState.action}
          plan={dialogState.plan}
          onConfirm={handleConfirmAction}
          isLoading={
            isActivatingPlan || isPausingPlan || isClosingPlan || isDeletingPlan
          }
        />
      )}
    </div>
  )
}
