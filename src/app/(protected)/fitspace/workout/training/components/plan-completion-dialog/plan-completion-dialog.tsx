'use client'

import { CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { AnimateNumber } from '@/components/animate-number'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { useUser } from '@/context/user-context'

import { PlanCompletionDialogProps } from './types'
import { usePlanCompletion } from './use-plan-completion'

export function PlanCompletionDialog({
  open,
  onOpenChange,
  planId,
  onComplete,
}: PlanCompletionDialogProps) {
  const router = useRouter()
  const { user } = useUser()
  const { completionData, isLoading } = usePlanCompletion(open ? planId : null)

  const hasTrainer = !!user?.trainerId

  const handleComplete = () => {
    onComplete()
    onOpenChange(false)
    router.push('/fitspace/my-plans')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent dialogTitle="Training Plan Completed" className="max-w-md">
        <DialogHeader>
          <div className="flex-center mb-4">
            <div className="size-16 flex-center rounded-full bg-primary/10">
              <CheckCircle2 className="size-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Training Plan Complete
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : completionData ? (
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 rounded-lg bg-background-secondary p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  Adherence Rate
                </div>
                <div className="text-3xl font-semibold text-foreground">
                  <AnimateNumber value={completionData.adherence} />%
                </div>
              </div>

              <div className="space-y-2 rounded-lg bg-background-secondary p-4 text-center">
                <div className="text-sm text-muted-foreground">
                  Workouts Completed
                </div>
                <div className="text-3xl font-semibold text-foreground">
                  <AnimateNumber value={completionData.workoutsCompleted} />/
                  {completionData.totalWorkouts}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                What&apos;s Next?
              </h3>

              <div className="grid gap-2">
                <ButtonLink
                  href="/fitspace/explore?tab=premium-plans"
                  variant="outline"
                  className="w-full justify-start"
                >
                  Find New Plan
                </ButtonLink>

                {hasTrainer ? (
                  <ButtonLink
                    href="/fitspace/my-trainer"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Contact Your Trainer
                  </ButtonLink>
                ) : (
                  <ButtonLink
                    href="/fitspace/explore?tab=trainers"
                    variant="outline"
                    className="w-full justify-start"
                  >
                    Discover Top Trainers
                  </ButtonLink>
                )}

                <ButtonLink
                  href="/fitspace/my-plans"
                  variant="outline"
                  className="w-full justify-start"
                >
                  View My Plans
                </ButtonLink>
              </div>
            </div>

            <Button
              onClick={handleComplete}
              className="w-full"
              size="lg"
              variant="default"
            >
              Complete Plan
            </Button>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
