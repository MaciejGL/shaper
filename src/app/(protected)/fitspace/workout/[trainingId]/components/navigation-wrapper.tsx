'use client'

import { startTransition, use, useEffect, useState } from 'react'

import {
  GQLFitspaceGetWorkoutNavigationQuery,
  useFitspaceGetWorkoutNavigationQuery,
} from '@/generated/graphql-client'

import { Navigation } from './navigation'

export const NavigationWrapper = ({
  navigationDataPromise,
  trainingId,
}: {
  navigationDataPromise: Promise<
    | {
        data: GQLFitspaceGetWorkoutNavigationQuery
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
  const { data: navigationData } = use(navigationDataPromise)
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

  return (
    <Navigation
      plan={
        navigationDataQuery?.getWorkoutNavigation?.plan ??
        navigationData?.getWorkoutNavigation?.plan
      }
    />
  )
}
