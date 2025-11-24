'use client'

import { useQueryClient } from '@tanstack/react-query'
import { ArrowRight, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { revalidatePlanPages } from '@/app/actions/revalidate'
import { Button } from '@/components/ui/button'
import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent } from '@/components/ui/card'
import { Drawer, DrawerContent } from '@/components/ui/drawer'
import { useUser } from '@/context/user-context'
import { useClosePlanMutation } from '@/generated/graphql-client'
import { useWeightConversion } from '@/hooks/use-weight-conversion'
import { queryInvalidation } from '@/lib/query-invalidation'
import { cn } from '@/lib/utils'

import { PlanCompletionDialogProps } from './types'
import { usePlanCompletion } from './use-plan-completion'

export function PlanCompletionDialog({
  open,
  onOpenChange,
  planId,
  onComplete,
}: PlanCompletionDialogProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const { user } = useUser()
  const { completionData, isLoading } = usePlanCompletion(open ? planId : null)
  const { toDisplayWeight, weightUnit } = useWeightConversion()

  const hasTrainer = !!user?.trainerId

  const { mutate: closePlan, isPending: isClosing } = useClosePlanMutation({
    onSuccess: async () => {
      await Promise.all([
        revalidatePlanPages(),
        queryInvalidation.planStateChange(queryClient),
      ])
      router.refresh()
      onComplete()
      onOpenChange(false)
      router.push('/fitspace/my-plans')
    },
  })

  const handleComplete = () => {
    closePlan({ planId })
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        dialogTitle="Training Plan Completed"
        className="flex flex-col"
      >
        <div className="flex-1 overflow-y-auto px-6 pt-12 pb-6">
          {isLoading ? (
            <LoadingState />
          ) : completionData ? (
            <div className="max-w-md mx-auto space-y-12">
              <div className="flex flex-col items-center gap-6 text-center">
                <div className="size-20 flex-center rounded-full bg-gradient-to-br from-green-500/20 via-green-500/10 to-green-500/5 border-2 border-green-500">
                  <Check className="size-10 text-green-600" strokeWidth={2.5} />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Plan Completed
                  </h2>
                  <p className="text-base text-muted-foreground">
                    Great work on finishing your training plan
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <StatCard
                  label="Sessions"
                  value={`${completionData.workoutsCompleted}/${completionData.totalWorkouts}`}
                  accent
                />

                <StatCard
                  label={`Volume (${weightUnit})`}
                  value={`${((toDisplayWeight(completionData.totalVolumeLifted) || 0) / 1000).toFixed(1)}k`}
                />

                <StatCard
                  label="New PRs"
                  value={completionData.totalPRsAchieved.toString()}
                />

                <StatCard
                  label="Duration"
                  value={`${completionData.duration.weeks} Week${completionData.duration.weeks !== 1 ? 's' : ''}`}
                  accent
                />
              </div>

              <div className="space-y-3 pt-4">
                <Button
                  onClick={handleComplete}
                  variant="default"
                  className="w-full"
                  size="xl"
                  loading={isClosing}
                  disabled={isClosing}
                >
                  Mark Plan as Complete
                </Button>
                {hasTrainer ? (
                  <ButtonLink
                    href="/fitspace/my-trainer"
                    variant="secondary"
                    className="w-full"
                    size="xl"
                    iconEnd={<ArrowRight />}
                  >
                    Get Next Plan from Trainer
                  </ButtonLink>
                ) : (
                  <ButtonLink
                    href="/fitspace/explore?tab=trainers"
                    variant="default"
                    className="w-full"
                    size="xl"
                    iconEnd={<ArrowRight />}
                  >
                    Find a Personal Trainer
                  </ButtonLink>
                )}

                <ButtonLink
                  href="/fitspace/explore?tab=premium-plans"
                  variant="outline"
                  className="w-full"
                  size="xl"
                  iconEnd={<ArrowRight />}
                >
                  Browse Ready-Made Plans
                </ButtonLink>
              </div>
            </div>
          ) : null}
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent?: boolean
}) {
  return (
    <Card variant={accent ? 'premium' : 'secondary'}>
      <CardContent className="text-center space-y-2">
        <div
          className={cn('text-2xl font-semibold tabular-nums', {
            'bg-gradient-to-br from-amber-500 to-amber-500/90 dark:from-yellow-500 dark:to-yellow-500/90 bg-clip-text text-transparent':
              accent,
            'text-foreground': !accent,
          })}
        >
          {value}
        </div>
        <div className="text-xs font-medium text-muted-foreground uppercase">
          {label}
        </div>
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="max-w-md mx-auto space-y-12">
      <div className="flex flex-col items-center gap-6">
        <div className="size-20 rounded-full bg-muted" />
        <div className="space-y-2 w-full max-w-xs flex flex-col items-center">
          <div className="h-9 bg-muted rounded w-3/4" />
          <div className="h-6 bg-muted rounded w-2/3" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 bg-muted rounded-lg" />
        ))}
      </div>

      <div className="space-y-3">
        <div className="h-12 bg-muted rounded" />
        <div className="h-12 bg-muted rounded" />
      </div>
    </div>
  )
}
