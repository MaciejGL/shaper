'use client'

import { useQueryState } from 'nuqs'
import { startTransition, use, useEffect, useMemo, useState } from 'react'

import {
  GQLFitspaceGetQuickWorkoutNavigationQuery,
  GQLFitspaceGetWorkoutNavigationQuery,
  useFitspaceGetWorkoutNavigationQuery,
} from '@/generated/graphql-client'

import { Navigation } from './navigation'
import {
  findTrainerPlanWeek,
  getDefaultSelection,
  isQuickWorkout,
} from './navigation-utils'
import { OverduePlanDialog } from './overdue-plan-dialog/overdue-plan-dialog'
import { useOverduePlanDismissal } from './overdue-plan-dialog/use-overdue-plan-dismissal'

type NavigationData =
  | GQLFitspaceGetWorkoutNavigationQuery
  | GQLFitspaceGetQuickWorkoutNavigationQuery

export const NavigationWrapper = ({
  navigationDataPromise,
  trainingId,
}: {
  navigationDataPromise: Promise<
    | {
        data: NavigationData
        error: null
      }
    | {
        data: null
        error: string
      }
  >
  trainingId: string
}) => {
  const [weekId, setWeekId] = useQueryState('week')
  const [dayId, setDayId] = useQueryState('day')

  const { data: navigationData } = use(navigationDataPromise)

  // Handle both getWorkoutNavigation (trainer plans) and getQuickWorkoutNavigation (quick workouts)
  const initialPlan =
    'getWorkoutNavigation' in (navigationData ?? {})
      ? (navigationData as GQLFitspaceGetWorkoutNavigationQuery)
          .getWorkoutNavigation?.plan
      : (navigationData as GQLFitspaceGetQuickWorkoutNavigationQuery)
          .getQuickWorkoutNavigation?.plan

  const { data: navigationDataQuery } = useFitspaceGetWorkoutNavigationQuery(
    {
      trainingId,
    },
    {
      queryKey: ['navigation'],
      initialData: navigationData ?? undefined,
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: !!trainingId,
      // Prevent immediate refetch when we have server-provided initial data
      refetchOnMount: !navigationData,
      refetchOnWindowFocus: false,
    },
  )

  // Auto-select today's day on initial load if no URL parameters
  // Use fresh client-side data if available, fallback to initial server data
  useEffect(() => {
    const planToUse =
      navigationDataQuery?.getWorkoutNavigation?.plan ?? initialPlan

    if (!weekId && !dayId && planToUse) {
      const { weekId: defaultWeekId, dayId: defaultDayId } =
        getDefaultSelection(planToUse)

      if (defaultWeekId && defaultDayId) {
        startTransition(() => {
          setWeekId(defaultWeekId)
          setDayId(defaultDayId)
        })
      }
    }
  }, [weekId, dayId, initialPlan, navigationDataQuery, setWeekId, setDayId])

  const finalPlan =
    navigationDataQuery?.getWorkoutNavigation?.plan ?? initialPlan

  // Check if plan is overdue (past end date, not completed, not a quick workout)
  const isPlanOverdue = useMemo(() => {
    if (!finalPlan) return false
    if (isQuickWorkout(finalPlan)) return false
    if (finalPlan.completedAt) return false

    const { isPastPlanEnd } = findTrainerPlanWeek(
      finalPlan.weeks,
      finalPlan.startDate,
      new Date(),
    )
    return isPastPlanEnd
  }, [finalPlan])

  const { isDismissed, dismiss } = useOverduePlanDismissal(finalPlan?.id)
  const [dialogOpen, setDialogOpen] = useState(false)

  // Show dialog when plan is overdue and not dismissed
  useEffect(() => {
    if (isPlanOverdue && !isDismissed) {
      setDialogOpen(true)
    }
  }, [isPlanOverdue, isDismissed])

  return (
    <>
      <Navigation plan={finalPlan} />
      {finalPlan && isPlanOverdue && (
        <OverduePlanDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          planId={finalPlan.id}
          weeks={finalPlan.weeks}
          onDismiss={dismiss}
        />
      )}
    </>
  )
}
