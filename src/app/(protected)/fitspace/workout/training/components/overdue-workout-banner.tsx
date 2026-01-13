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

    // Find current week (where today falls in range)
    let currentWeekIndex = -1
    for (let i = 0; i < plan.weeks.length; i++) {
      const week = plan.weeks[i]
      const scheduledDays = week.days.filter((d) => d.scheduledAt)
      if (scheduledDays.length === 0) continue

      const firstDayDate = startOfDay(new Date(scheduledDays[0].scheduledAt!))
      const lastDayDate = startOfDay(
        new Date(scheduledDays[scheduledDays.length - 1].scheduledAt!),
      )

      if (today >= firstDayDate && today <= lastDayDate) {
        currentWeekIndex = i
        break
      }
    }

    // No current week found or it's the first week - no previous week to check
    if (currentWeekIndex <= 0) return null

    // Check only the immediately previous week
    const previousWeek = plan.weeks[currentWeekIndex - 1]
    const unfinishedCount = previousWeek.days.filter(
      (d) => !d.isRestDay && !d.completedAt && d.scheduledAt,
    ).length

    // Show banner only if previous week has 3+ unfinished
    if (unfinishedCount >= 3) {
      return { count: unfinishedCount }
    }

    return null
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
        You can shift your scheduled weeks in Settings, or mark days as
        complete.
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
