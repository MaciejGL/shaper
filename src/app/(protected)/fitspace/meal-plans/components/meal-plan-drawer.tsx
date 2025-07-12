import { ChefHat } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  SimpleDrawerContent,
} from '@/components/ui/drawer'

import { ActiveMealPlan, AvailableMealPlan, MealPlanAction } from '../types'

import { MealPlanOverview } from './meal-plan-overview'

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

          {/* Simplified message for meal schedule */}
          <div className="text-center py-8 text-muted-foreground">
            <ChefHat className="size-12 mx-auto mb-4 opacity-50" />
            <p>Activate this plan to view detailed meal schedule</p>
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
