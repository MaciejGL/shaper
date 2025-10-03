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

  const { data: navigationData, error: navigationError } = use(
    navigationDataPromise,
  )

  // Handle both getWorkoutNavigation (trainer plans) and getQuickWorkoutNavigation (quick workouts)
  const initialPlan =
    'getWorkoutNavigation' in (navigationData ?? {})
      ? (navigationData as GQLFitspaceGetWorkoutNavigationQuery)
          .getWorkoutNavigation?.plan
      : (navigationData as GQLFitspaceGetQuickWorkoutNavigationQuery)
          .getQuickWorkoutNavigation?.plan

  const queryType =
    'getWorkoutNavigation' in (navigationData ?? {}) ? 'trainer' : 'quick'

  console.info('🎨 NavigationWrapper received:', {
    hasData: !!navigationData,
    hasPlan: !!initialPlan,
    weeksCount: initialPlan?.weeks?.length,
    error: navigationError,
    trainingId,
    queryType,
  })

  // Auto-select today's day on initial load if no URL parameters
  useEffect(() => {
    if (!weekId && !dayId && initialPlan) {
      const { weekId: defaultWeekId, dayId: defaultDayId } =
        getDefaultSelection(initialPlan)

      console.info('🎯 Auto-selecting default day:', {
        defaultWeekId,
        defaultDayId,
      })

      if (defaultWeekId && defaultDayId) {
        startTransition(() => {
          setWeekId(defaultWeekId)
          setDayId(defaultDayId)
        })
      }
    }
  }, [weekId, dayId, initialPlan, setWeekId, setDayId])

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

  console.info('🎨 NavigationWrapper rendering:', {
    hasFinalPlan: !!finalPlan,
    weeksCount: finalPlan?.weeks?.length,
    firstWeekDaysCount: finalPlan?.weeks?.[0]?.days?.length,
  })

  return <Navigation plan={finalPlan} />
}
