import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'

import { PlanStats } from './plan-stats'

type ActivePlanCardProps = {
  activePlan: GQLGetClientByIdQuery['getClientTrainingPlans'][number]
  onRemove: () => void
}

export function ActivePlanCard({ activePlan, onRemove }: ActivePlanCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">
          Current Active Plan
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="text-destructive hover:text-destructive"
        >
          <X className="h-4 w-4 mr-1" />
          Remove Plan
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <PlanHeader
          title={activePlan.title}
          description={activePlan.description}
          weekCount={activePlan.weekCount}
        />
        <Separator />
        <PlanStats
          startDate={activePlan.startDate}
          nextSession={activePlan.nextSession}
          progress={activePlan.progress}
        />
      </CardContent>
    </Card>
  )
}

type PlanHeaderProps = {
  title: string
  description?: string | null
  weekCount: number
}

function PlanHeader({ title, description, weekCount }: PlanHeaderProps) {
  return (
    <>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-sm">{description}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{weekCount} exercises</Badge>
      </div>
    </>
  )
}
