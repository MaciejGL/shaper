'use client'

import { use } from 'react'

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
  const { data: navigationData } = use(navigationDataPromise)

  const { data: navigationDataQuery } = useFitspaceGetWorkoutNavigationQuery(
    {
      trainingId,
    },
    {
      initialData: navigationData ?? undefined,
      staleTime: 1000 * 60 * 5, // 5 minutes
      enabled: !!trainingId, // Disable if we have fresh initial data
    },
  )

  return (
    <Navigation
      plan={
        navigationDataQuery?.getWorkoutNavigation?.plan ??
        navigationData?.getWorkoutNavigation?.plan
      }
    />
  )
}
