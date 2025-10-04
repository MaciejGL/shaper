'use client'

import { useQueryState } from 'nuqs'
import { startTransition, use, useEffect, useState } from 'react'

import {
  GQLFitspaceGetQuickWorkoutNavigationQuery,
  GQLFitspaceGetWorkoutNavigationQuery,
  useFitspaceGetWorkoutNavigationQuery,
} from '@/generated/graphql-client'

import { Navigation } from './navigation'
import { getDefaultSelection } from './navigation-utils'

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
  const [allWeeks, setAllWeeks] = useState(false)
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

  const { data: navigationDataQuery, refetch } =
    useFitspaceGetWorkoutNavigationQuery(
      {
        trainingId,
        allWeeks,
      },
      {
        queryKey: ['navigation'],
        initialData: navigationData ?? undefined,
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!trainingId, // Disable if we have fresh initial data
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

      console.info('🎯 Auto-selecting default day:', {
        defaultWeekId,
        defaultDayId,
        usingFreshData: !!navigationDataQuery?.getWorkoutNavigation?.plan,
      })

      if (defaultWeekId && defaultDayId) {
        startTransition(() => {
          setWeekId(defaultWeekId)
          setDayId(defaultDayId)
        })
      }
    }
  }, [weekId, dayId, initialPlan, navigationDataQuery, setWeekId, setDayId])

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (navigationDataQuery?.getWorkoutNavigation?.plan) {
      timeout = setTimeout(() => {
        startTransition(() => {
          setAllWeeks(true)
          refetch()
        })
      }, 1000)
    }
    return () => clearTimeout(timeout)
  }, [trainingId, navigationDataQuery, refetch])

  const finalPlan =
    navigationDataQuery?.getWorkoutNavigation?.plan ?? initialPlan

  return <Navigation plan={finalPlan} />
}
