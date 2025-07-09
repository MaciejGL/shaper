import { LayoutDashboard, Pause, PencilIcon } from 'lucide-react'
import { X } from 'lucide-react'
import { MoreHorizontalIcon } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import { ActivePlan, PlanAction } from '../../types'
import { ManagePlanModal } from '../manage-plan-modal'

export function Header({
  plan,
  handlePlanAction,
}: {
  plan: NonNullable<ActivePlan>
  handlePlanAction: (action: PlanAction, plan: NonNullable<ActivePlan>) => void
}) {
  return (
    <div className="pb-6">
      <div className="flex justify-between items-start gap-2">
        <PlanHeader title={plan.title} planId={plan.id} />
        <PlanActions handlePlanAction={handlePlanAction} plan={plan} />
      </div>
    </div>
  )
}

function PlanHeader({
  title,

  planId,
}: {
  title: string
  planId: string
}) {
  return (
    <div className="flex-1">
      <div className="mb-2">
        <Link href={`/fitspace/training-preview/${planId}`}>
          <h2 className={cn('text-2xl font-medium mb-1')}>{title}</h2>
        </Link>
        <Badge variant="secondary">Active</Badge>
      </div>
    </div>
  )
}

function PlanActions({
  handlePlanAction,
  plan,
}: {
  handlePlanAction: (action: PlanAction, plan: NonNullable<ActivePlan>) => void
  plan: NonNullable<ActivePlan>
}) {
  const [extendPlanModalOpen, setExtendPlanModalOpen] = useState(false)
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="secondary"
            size="icon-lg"
            iconOnly={<MoreHorizontalIcon />}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setExtendPlanModalOpen(true)}>
            <PencilIcon className="size-4 mr-2" />
            Edit Plan
          </DropdownMenuItem>
          <Link href={`/fitspace/training-preview/${plan.id}`}>
            <DropdownMenuItem>
              <LayoutDashboard className="size-4 mr-2" />
              Plan Overview
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => handlePlanAction('pause', plan)}>
            <Pause className="size mr-2" />
            Pause Plan
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handlePlanAction('close', plan)}>
            <X className="size mr-2" />
            Close Plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ManagePlanModal
        plan={plan}
        open={extendPlanModalOpen}
        setOpen={setExtendPlanModalOpen}
      />
    </div>
  )
}
