'use client'

import { ChevronRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { ButtonLink } from '@/components/ui/button-link'
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { cn } from '@/lib/utils'

import { type AvailablePlan, PlanStatus, getPlanStatus } from '../../types'

import type { SelectPlanDrawerProps } from './types'

export function SelectPlanDrawer({
  open,
  onClose,
  plans,
  onSelectPlan,
}: SelectPlanDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onClose}>
      <DrawerContent dialogTitle="Select plan to activate" className="max-h-[90vh]">
        <div className="flex flex-col min-h-0">
          <DrawerHeader className="border-b flex-none">
            <DrawerTitle>Select plan to activate</DrawerTitle>
          </DrawerHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-4 pt-4 pb-6">
            {plans.length === 0 ? (
              <div className="rounded-xl border border-border bg-muted/20 p-4">
                <p className="text-sm text-muted-foreground">
                  No plans available to activate right now.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {plans.map((plan) => (
                  <PlanRow
                    key={plan.id}
                    plan={plan}
                    onClick={() => onSelectPlan(plan)}
                  />
                ))}
              </div>
            )}
          </div>

          <DrawerFooter className="border-t flex-none">
            <ButtonLink
              href="/fitspace/explore?tab=plans"
              iconEnd={<ChevronRight />}
              className="w-full"
              size="lg"
            >
              Explore more plans
            </ButtonLink>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  )
}

function PlanRow({
  plan,
  onClick,
}: {
  plan: AvailablePlan
  onClick: () => void
}) {
  const difficultyLabel =
    typeof plan.difficulty === 'string' && plan.difficulty.length > 0
      ? plan.difficulty.toLowerCase()
      : null

  const status = getPlanStatus(plan)
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left rounded-xl border border-border bg-background/40 px-4 py-3',
        'transition-colors hover:bg-accent/30 active:bg-accent/40',
      )}
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <p className="font-semibold truncate">{plan.title}</p>
          </div>
          <div className="flex items-center gap-2 mt-2">
            {difficultyLabel && (
              <Badge variant="secondary" size="sm" className="capitalize">
                {difficultyLabel}
              </Badge>
            )}
            {status === PlanStatus.Paused && (
              <Badge variant="primary" size="sm" className="capitalize">
                Paused
              </Badge>
            )}
            <p className="text-sm text-muted-foreground">
              {plan.weekCount} weeks
            </p>
          </div>
        </div>
        <ChevronRight className="size-5 text-muted-foreground" />
      </div>
    </button>
  )
}
