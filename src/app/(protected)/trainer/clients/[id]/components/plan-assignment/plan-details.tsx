'use client'

import { differenceInDays, formatDate } from 'date-fns'
import { Activity, Calendar, Clock, Target } from 'lucide-react'

import { CollapsibleText } from '@/components/collapsible-text'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'

type PlanAssignmentProps = {
  assignedPlan: NonNullable<GQLGetClientByIdQuery['getClientActivePlan']>
}

export function PlanDetails({ assignedPlan }: PlanAssignmentProps) {
  const daysToEnd = assignedPlan.endDate
    ? differenceInDays(new Date(assignedPlan.endDate), new Date())
    : 0

  return (
    <div className="space-y-6">
      <Card className="max-w-max">
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-lg font-semibold">{assignedPlan.title}</p>
            <div className="flex flex-wrap gap-2">
              {assignedPlan.difficulty && (
                <Badge variant="secondary" className="capitalize">
                  {assignedPlan.difficulty.toLowerCase()}
                </Badge>
              )}
              <Badge variant="secondary">
                {assignedPlan.weekCount}{' '}
                {assignedPlan.weekCount === 1 ? 'week' : 'weeks'}
              </Badge>
            </div>
          </div>
          <div className="max-w-2xl">
            <CollapsibleText maxWords={40} text={assignedPlan.description} />
          </div>
        </CardContent>
      </Card>
      <Card className="space-y-4">
        <CardContent>
          <div className="grid grid-cols-2 @xl/client-detail-page:grid-cols-4 gap-4">
            {assignedPlan.startDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Start Date</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(assignedPlan.startDate, 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
            )}
            {assignedPlan.endDate && (
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">End Date</p>
                  <p className={cn('text-sm text-muted-foreground')}>
                    {formatDate(assignedPlan.endDate, 'MMM d, yyyy')}
                  </p>
                  {daysToEnd < 14 && (
                    <p
                      className={cn(
                        'text-xs text-muted-foreground',
                        daysToEnd < 10 && 'text-amber-600',
                        daysToEnd < 3 && 'text-destructive',
                      )}
                    >
                      {daysToEnd > 0 && <span>({daysToEnd} days left)</span>}
                    </p>
                  )}
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Next Session</p>
                <p className="text-sm text-muted-foreground">
                  {assignedPlan.nextSession || 'Not scheduled'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Total Weeks</p>
                <p className="text-sm text-muted-foreground">
                  {assignedPlan.weekCount} weeks
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
