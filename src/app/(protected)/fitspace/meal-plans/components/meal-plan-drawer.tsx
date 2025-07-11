import { ChefHat } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  SimpleDrawerContent,
} from '@/components/ui/drawer'
import { useFitspaceGetMealPlanQuery } from '@/generated/graphql-client'

import { ActiveMealPlan, AvailableMealPlan, MealPlanAction } from '../types'

import { MealPlanOverview } from './meal-plan-overview'
import { MealSchedule } from './meal-schedule'
import { MealScheduleSkeleton } from './meal-schedule-skeleton'

interface MealPlanDrawerProps {
  plan: ActiveMealPlan | AvailableMealPlan | null
  open: boolean
  onClose: () => void
  onAction: (
    action: MealPlanAction,
    plan: NonNullable<ActiveMealPlan | AvailableMealPlan>,
  ) => void
  isLoading?: boolean
}

export function MealPlanDrawer({
  plan,
  open,
  onClose,
  onAction,
  isLoading,
}: MealPlanDrawerProps) {
  // Fetch detailed meal plan data when drawer is open
  const { data: detailedData, isLoading: isFetchingDetails } =
    useFitspaceGetMealPlanQuery(
      { mealPlanId: plan?.id },
      { enabled: open && !!plan?.id },
    )

  const detailedPlan = detailedData?.clientGetMealPlan?.plan

  if (!plan) return null

  const isActive = plan.active
  const isButtonLoading = isLoading || false

  return (
    <Drawer open={open} onOpenChange={onClose}>
      <SimpleDrawerContent
        title={plan.title}
        headerIcon={<ChefHat className="size-5" />}
        footer={
          <div className="flex items-center justify-end gap-2">
            <DrawerClose asChild>
              <Button variant="secondary" disabled={isButtonLoading}>
                Close
              </Button>
            </DrawerClose>
            <Button
              onClick={() =>
                onAction(isActive ? 'deactivate' : 'activate', plan)
              }
              disabled={isButtonLoading}
              className="flex items-center gap-2"
            >
              {isActive ? 'Deactivate' : 'Activate'}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {/* Plan Overview */}
          <MealPlanOverview plan={plan} />

          {/* Meal Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Meal Schedule</h3>

            {isFetchingDetails ? (
              <MealScheduleSkeleton />
            ) : detailedPlan?.weeks && detailedPlan.weeks.length > 0 ? (
              <MealSchedule weeks={detailedPlan.weeks} />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <ChefHat className="size-12 mx-auto mb-4 opacity-50" />
                <p>No meal schedule available yet</p>
              </div>
            )}
          </div>

          {/* Plan Creator */}
          {plan.createdBy && (
            <div className="border-t pt-4">
              <div className="text-sm text-muted-foreground">
                Created by {plan.createdBy.firstName} {plan.createdBy.lastName}
              </div>
            </div>
          )}
        </div>
      </SimpleDrawerContent>
    </Drawer>
  )
}
