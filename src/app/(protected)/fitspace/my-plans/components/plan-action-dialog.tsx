import { formatDate } from 'date-fns'
import { BookmarkXIcon, SparklesIcon, Trash } from 'lucide-react'
import { Pause } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from '@/components/ui/dialog'
import { DialogHeader } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { WeekPicker } from '@/components/week-picker'

import { ActivePlan, AvailablePlan, CompletedPlan, PlanAction } from '../page'

interface PlanActionDialogProps {
  isOpen: boolean
  onClose: () => void
  action: PlanAction | null
  plan: AvailablePlan | ActivePlan | CompletedPlan
  onConfirm: (data: { startDate?: Date }) => void
  isLoading: boolean
}

export function PlanActionDialog({
  isOpen,
  onClose,
  action,
  plan,
  onConfirm,
  isLoading,
}: PlanActionDialogProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined)

  if (!action || !plan) return null

  const actionConfig: Record<
    PlanAction,
    {
      title: string
      description: string
      confirmText: string
      icon: React.ReactNode
    }
  > = {
    activate: {
      title: 'Activate Plan',
      description: `Are you sure you want to activate "${plan.title}"? This will become your active training plan.`,
      confirmText: 'Activate Plan',
      icon: <SparklesIcon className="size-4" />,
    },
    pause: {
      title: 'Pause Plan',
      description: `Are you sure you want to pause "${plan.title}"? You can resume it later.`,
      confirmText: 'Pause Plan',
      icon: <Pause className="size-4" />,
    },
    close: {
      title: 'Close Plan',
      description: `Are you sure you want to close "${plan.title}"? This action cannot be undone and the plan will be moved to completed.`,
      confirmText: 'Close Plan',
      icon: <BookmarkXIcon className="size-4" />,
    },
    delete: {
      title: 'Delete Plan',
      description: `Are you sure you want to delete "${plan.title}"? This action cannot be undone and the plan will be deleted from your account.`,
      confirmText: 'Delete Plan',
      icon: <Trash className="size-4" />,
    },
  }

  const config = actionConfig[action]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent dialogTitle={config.title}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {config.icon}
            {config.title}
          </DialogTitle>
          <DialogDescription>{config.description}</DialogDescription>
        </DialogHeader>

        {action === 'activate' && (
          <div className="space-y-4 py-4">
            {/* Start Date Selection */}
            <div className="space-y-2">
              <Label htmlFor="start-date">Training Start Week</Label>
              <WeekPicker
                value={startDate}
                onChange={setStartDate}
                placeholder="Select start week"
              />
              {startDate && (
                <div className="text-xs text-muted-foreground">
                  Your training will begin on{' '}
                  {formatDate(startDate, 'EEEE, MMMM d, yyyy')}
                </div>
              )}
            </div>

            {/* Plan Preview */}
            <div className="space-y-2">
              <Label>What to expect:</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-medium">{plan.weekCount} weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Workouts per week:</span>
                  <span className="font-medium">
                    {Math.round(plan.totalWorkouts / plan.weekCount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total workouts:</span>
                  <span className="font-medium">{plan.totalWorkouts}</span>
                </div>
                {startDate && typeof plan.weekCount === 'number' && (
                  <div className="flex justify-between">
                    <span>Estimated completion:</span>
                    <span className="font-medium">
                      {formatDate(
                        new Date(
                          startDate.getTime() +
                            plan.weekCount * 7 * 24 * 60 * 60 * 1000,
                        ),
                        'MMM d, yyyy',
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm({ startDate })}
            disabled={action === 'activate' && !startDate}
            loading={isLoading}
          >
            {config.confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
