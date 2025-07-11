import { ChefHat } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { ActiveMealPlan, AvailableMealPlan, MealPlanAction } from '../types'

interface MealPlanActionDialogProps {
  isOpen: boolean
  onClose: () => void
  action: MealPlanAction | null
  plan: ActiveMealPlan | AvailableMealPlan | null
  onConfirm: () => void
  isLoading: boolean
}

export function MealPlanActionDialog({
  isOpen,
  onClose,
  action,
  plan,
  onConfirm,
  isLoading,
}: MealPlanActionDialogProps) {
  if (!action || !plan) return null

  const actionConfig: Record<
    MealPlanAction,
    {
      title: string
      description: string
      confirmText: string
      variant: 'default' | 'destructive'
    }
  > = {
    activate: {
      title: 'Activate Meal Plan',
      description: `Are you sure you want to activate "${plan.title}"? This will become your active meal plan and any currently active meal plan will be deactivated.`,
      confirmText: 'Activate Plan',
      variant: 'default',
    },
    deactivate: {
      title: 'Deactivate Meal Plan',
      description: `Are you sure you want to deactivate "${plan.title}"? You can reactivate it later.`,
      confirmText: 'Deactivate Plan',
      variant: 'default',
    },
    delete: {
      title: 'Delete Meal Plan',
      description: `Are you sure you want to delete "${plan.title}"? This action cannot be undone and the meal plan will be permanently removed from your account.`,
      confirmText: 'Delete Plan',
      variant: 'destructive',
    },
  }

  const config = actionConfig[action]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dialogTitle={config.title}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ChefHat className="size-5" />
            {config.title}
          </DialogTitle>
          <DialogDescription className="text-left">
            {config.description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={config.variant}
            onClick={onConfirm}
            disabled={isLoading}
            loading={isLoading}
          >
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
