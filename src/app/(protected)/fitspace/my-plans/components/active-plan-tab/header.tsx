import { Pause } from 'lucide-react'
import { X } from 'lucide-react'
import { MoreHorizontalIcon } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle } from '@/components/ui/card'
import { DropdownMenuItem } from '@/components/ui/dropdown-menu'
import {
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import { ActivePlan, PlanAction } from '../../types'

export function Header({
  plan,
  loading,
  handlePlanAction,
}: {
  plan: NonNullable<ActivePlan>
  loading: boolean
  handlePlanAction: (action: PlanAction, plan: NonNullable<ActivePlan>) => void
}) {
  return (
    <CardHeader className="pb-4">
      <div className="flex justify-between items-start">
        <PlanHeader title={plan.title} loading={loading} />
        <PlanActions handlePlanAction={handlePlanAction} plan={plan} />
      </div>
    </CardHeader>
  )
}

function PlanHeader({ title, loading }: { title: string; loading: boolean }) {
  return (
    <div className="flex-1">
      <div className="mb-2">
        <CardTitle
          className={cn('text-lg mb-1', loading && 'masked-placeholder-text')}
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
  handlePlanAction: (action: PlanAction, plan: NonNullable<ActivePlan>) => void
  plan: NonNullable<ActivePlan>
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
