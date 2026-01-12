'use client'

import { startOfDay } from 'date-fns'
import { AlertCircle, X } from 'lucide-react'
import { useMemo } from 'react'

import { cn } from '@/lib/utils'

import { useOverduePlanDismissal } from './overdue-plan-dialog/use-overdue-plan-dismissal'
import type { NavigationPlan } from './workout-day'

interface OverdueWorkoutBannerProps {
  plan: NavigationPlan
  isQuickWorkout?: boolean
}

export function OverdueWorkoutBanner({
  plan,
  isQuickWorkout,
}: OverdueWorkoutBannerProps) {
  const { isDismissed, dismiss } = useOverduePlanDismissal(plan.id)

  const overdueInfo = useMemo(() => {
    if (isQuickWorkout) return null

    const today = startOfDay(new Date())

    // Find incomplete workout days that are in the past
    let overdueCount = 0

    for (const week of plan.weeks) {
      for (const day of week.days) {
        if (day.isRestDay) continue
        if (day.completedAt) continue
        if (!day.scheduledAt) continue

        const scheduledDate = startOfDay(new Date(day.scheduledAt))
        if (scheduledDate < today) {
          overdueCount++
        }
      }
    }

    if (overdueCount === 0) return null

    return { count: overdueCount }
  }, [plan, isQuickWorkout])

  if (!overdueInfo || isDismissed) return null

  return (
    <div
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg mb-2',
        'bg-amber-500/10 border border-amber-500/20',
        'text-amber-600 dark:text-amber-400',
      )}
    >
      <AlertCircle className="size-4 shrink-0" />
      <p className="text-xs flex-1">
        {overdueInfo.count} workout{overdueInfo.count !== 1 ? 's' : ''} overdue.
        Shift your schedule in Settings, or mark days as complete.
      </p>
      <button
        type="button"
        onClick={dismiss}
        className="p-0.5 hover:bg-amber-500/20 rounded transition-colors"
        aria-label="Dismiss"
      >
        <X className="size-4" />
      </button>
    </div>
  )
}
