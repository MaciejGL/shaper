'use client'

import { ChevronRight, Medal, Plus, TrendingUp } from 'lucide-react'

import { ButtonLink } from '@/components/ui/button-link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SectionIcon } from '@/components/ui/section-icon'
import { cn } from '@/lib/utils'

interface PersonalRecord {
  id: string
  exerciseName: string
  weight: number
  weightUnit: string
  improvement: number
  improvementType: 'weight' | 'reps' | 'volume'
  achievedAt: string
  rank: 1 | 2 | 3 | number // For medal display
  estimatedOneRM?: number
}

interface RecentPRsSectionProps {
  personalRecords?: PersonalRecord[]
  isLoading?: boolean
}

// Mock data - replace with real PR data from your GraphQL queries
const mockPersonalRecords: PersonalRecord[] = [
  {
    id: '1',
    exerciseName: 'Deadlift',
    weight: 150,
    weightUnit: 'kg',
    improvement: 5,
    improvementType: 'weight',
    achievedAt: '3 days ago',
    rank: 1,
    estimatedOneRM: 150,
  },
  {
    id: '2',
    exerciseName: 'Squat',
    weight: 120,
    weightUnit: 'kg',
    improvement: 2.5,
    improvementType: 'weight',
    achievedAt: '1 week ago',
    rank: 2,
    estimatedOneRM: 120,
  },
  {
    id: '3',
    exerciseName: 'Bench Press',
    weight: 85,
    weightUnit: 'kg',
    improvement: 2.5,
    improvementType: 'weight',
    achievedAt: '2 weeks ago',
    rank: 3,
    estimatedOneRM: 85,
  },
]

function getMedalColor(rank: number) {
  switch (rank) {
    case 1:
      return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-950/20'
    case 2:
      return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-950/20'
    case 3:
      return 'text-amber-700 bg-amber-100 dark:text-amber-500 dark:bg-amber-950/20'
    default:
      return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-950/20'
  }
}

function PersonalRecordItem({ pr }: { pr: PersonalRecord }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50">
      <div
        className={cn(
          'size-8 rounded-full flex items-center justify-center shrink-0',
          getMedalColor(pr.rank),
        )}
      >
        <Medal className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">
            {pr.exerciseName}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          {pr.weight}
          {pr.weightUnit}{' '}
          <span className="text-green-500">
            (+{pr.improvement}
            {pr.weightUnit})
          </span>{' '}
          • {pr.achievedAt}
        </div>
      </div>

      <div className="text-right shrink-0">
        <div className="text-xs text-muted-foreground">1RM Est.</div>
        <div className="text-sm font-medium">
          {pr.estimatedOneRM}
          {pr.weightUnit}
        </div>
      </div>
    </div>
  )
}

function EmptyPRs() {
  return (
    <div className="text-center py-6 px-4">
      <div className="w-12 h-12 bg-muted/50 rounded-full flex items-center justify-center mx-auto mb-3">
        <TrendingUp className="h-6 w-6 text-muted-foreground/70" />
      </div>
      <p className="text-sm text-muted-foreground mb-2">
        No personal records yet
      </p>
      <p className="text-xs text-muted-foreground/70 mb-4">
        Complete workouts to start tracking your PRs
      </p>
      <ButtonLink href="/fitspace/workout" size="sm" variant="outline">
        Start Workout
      </ButtonLink>
    </div>
  )
}

function PRsSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-border/50"
        >
          <div className="size-8 rounded-full bg-muted animate-pulse shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
          </div>
          <div className="text-right space-y-1">
            <div className="h-3 bg-muted rounded animate-pulse w-12" />
            <div className="h-4 bg-muted rounded animate-pulse w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function RecentPRsSection({
  personalRecords = mockPersonalRecords,
  isLoading,
}: RecentPRsSectionProps) {
  if (isLoading) {
    return (
      <Card variant="secondary">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <SectionIcon icon={Medal} variant="default" />
            Recent PRs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PRsSkeleton />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card variant="secondary">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <SectionIcon icon={Medal} variant="default" />
          Recent PRs
        </CardTitle>
      </CardHeader>

      <CardContent>
        {personalRecords.length === 0 ? (
          <EmptyPRs />
        ) : (
          <>
            <div className="space-y-3 mb-4">
              {personalRecords.map((pr) => (
                <PersonalRecordItem key={pr.id} pr={pr} />
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2 pt-2 border-t border-border/50">
              <ButtonLink
                href="/fitspace/progress"
                variant="tertiary"
                size="sm"
                iconStart={<Plus />}
              >
                Log New PR
              </ButtonLink>
              <ButtonLink
                href="/fitspace/progress"
                variant="tertiary"
                size="sm"
                className="flex-1"
                iconEnd={<ChevronRight />}
              >
                View All PRs
              </ButtonLink>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
