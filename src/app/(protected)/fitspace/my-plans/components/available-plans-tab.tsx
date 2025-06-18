import { formatDate } from 'date-fns'
import {
  LayoutDashboard,
  MoreHorizontalIcon,
  SparklesIcon,
  Trash,
} from 'lucide-react'
import Link from 'next/link'

import { CollapsibleText } from '@/components/collapsible-text'
import { RatingStars } from '@/components/rating-stars'
import { StatsItem } from '@/components/stats-item'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { DropdownMenu } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import { AvailablePlan, PlanAction } from '../types'

import { CompletionStats } from './completion-stats'
import { PlanAuthor } from './plan-author'

export function AvailablePlansTab({
  availablePlans,
  handlePlanAction,
  loading,
}: {
  availablePlans: AvailablePlan[]
  handlePlanAction: (action: PlanAction, plan: AvailablePlan) => void
  loading: boolean
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {availablePlans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          handlePlanAction={handlePlanAction}
          loading={loading}
        />
      ))}
    </div>
  )
}

function PlanCard({
  plan,
  handlePlanAction,
  loading,
}: {
  plan: AvailablePlan
  handlePlanAction: (action: PlanAction, plan: AvailablePlan) => void
  loading: boolean
}) {
  const {
    id,
    rating,
    totalReviews,
    weekCount,
    totalWorkouts,
    createdBy,
    description,
    adherence,
    completedWorkoutsDays,
  } = plan

  return (
    <Card key={id} className="space-y-4">
      <CardHeader>
        <PlanHeader
          loading={loading}
          handlePlanAction={handlePlanAction}
          plan={plan}
        />
        <PlanAuthor createdBy={createdBy} />
        <PlanRating rating={rating} totalReviews={totalReviews} />
      </CardHeader>
      <CardContent className="space-y-8 flex flex-col justify-between h-full">
        <div>
          <PlanStats weekCount={weekCount} totalWorkouts={totalWorkouts} />
          <CompletionStats
            adherence={adherence}
            completedWorkoutsDays={completedWorkoutsDays}
            totalWorkouts={totalWorkouts}
          />
        </div>
        <CollapsibleText text={description} />
        <Actions handlePlanAction={handlePlanAction} plan={plan} />
      </CardContent>
    </Card>
  )
}

function PlanHeader({
  loading,
  handlePlanAction,
  plan,
}: {
  loading: boolean
  handlePlanAction: (action: PlanAction, plan: AvailablePlan) => void
  plan: AvailablePlan
}) {
  const { startDate, updatedAt, title, difficulty } = plan
  const pausedAt = startDate
    ? `${formatDate(new Date(updatedAt), 'MMM d, yyyy')}`
    : ''
  return (
    <div className="flex justify-between items-start gap-2 mb-2">
      <div>
        <CardTitle
          className={cn('text-lg mb-w', loading && 'masked-placeholder-text')}
        >
          {title}
        </CardTitle>
        <div className="flex gap-2">
          {difficulty && (
            <Badge variant="outline" isLoading={loading}>
              {difficulty}
            </Badge>
          )}
          {startDate && <Badge variant="warning">Pasued {pausedAt}</Badge>}
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-lg"
            iconOnly={<MoreHorizontalIcon />}
            disabled={loading}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => handlePlanAction('activate', plan)}>
            <SparklesIcon className="size-4 mr-2" />
            Activate
          </DropdownMenuItem>
          <Link href={`/fitspace/training-preview/${plan.id}`}>
            <DropdownMenuItem>
              <LayoutDashboard className="size-4 mr-2" />
              Plan Overview
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem onClick={() => handlePlanAction('delete', plan)}>
            <Trash className="size-4 mr-2" />
            Delete Plan
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

function PlanRating({
  rating,
  totalReviews,
}: {
  rating?: number | null
  totalReviews: number
}) {
  if (typeof rating !== 'number') return null

  return (
    <div className="flex items-center gap-2">
      <RatingStars rating={rating ?? 0} size="sm" />
      <span className="text-xs text-muted-foreground">
        ({totalReviews} reviews)
      </span>
    </div>
  )
}

function PlanStats({
  weekCount,
  totalWorkouts,
}: {
  weekCount: number
  totalWorkouts: number
}) {
  return (
    <div className="grid grid-cols-3 gap-2 text-center">
      <StatsItem value={weekCount} label="Weeks" />
      <StatsItem
        value={Math.round(totalWorkouts / weekCount)}
        label="Per Week"
      />
      <StatsItem value={totalWorkouts} label="Workouts" />
    </div>
  )
}

function Actions({
  handlePlanAction,
  plan,
}: {
  handlePlanAction: (action: PlanAction, plan: AvailablePlan) => void
  plan: AvailablePlan
}) {
  return (
    <div className="flex gap-2 pt-2 self-end">
      <Button
        className="flex-1"
        onClick={() => handlePlanAction('activate', plan)}
        iconStart={<SparklesIcon />}
      >
        Activate Plan
      </Button>
    </div>
  )
}
