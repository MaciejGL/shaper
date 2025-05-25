import { Calendar, Clock, Target, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { GQLGetClientByIdQuery } from '@/generated/graphql-client'

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
        <ProgressBar progress={activePlan.progress} />
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

type PlanStatsProps = {
  startDate?: string | null
  nextSession?: string | null
  progress?: number | null
}

function PlanStats({ startDate, nextSession, progress }: PlanStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
      <StatItem icon={<Calendar />} label="Start Date" value={startDate} />
      <StatItem icon={<Clock />} label="Next Session" value={nextSession} />
      <StatItem
        icon={<Target />}
        label="Progress"
        value={`${progress}% complete`}
      />
    </div>
  )
}

type StatItemProps = {
  icon: React.ReactNode
  label: string
  value?: string | null
}

function StatItem({ icon, label, value }: StatItemProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-4 w-4 text-muted-foreground">{icon}</div>
      <div>
        <p className="font-medium">{label}</p>
        <p className="text-muted-foreground">{value ?? '-'}</p>
      </div>
    </div>
  )
}

type ProgressBarProps = {
  progress?: number | null
}

function ProgressBar({ progress = 0 }: ProgressBarProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>Overall Progress</span>
        <span>{progress}%</span>
      </div>
      <div className="w-full bg-muted rounded-full h-2">
        <div
          className="bg-primary h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
