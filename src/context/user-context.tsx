'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useMemo, useRef } from 'react'

import {
  GQLGetMySubscriptionStatusQuery,
  GQLUserBasicQuery,
  useGetMySubscriptionStatusQuery,
  useUserBasicQuery,
} from '@/generated/graphql-client'
import { useSyncTimezone } from '@/hooks/use-sync-timezone'

export interface UserContextType {
  session: ReturnType<typeof useSession>
  user: GQLUserBasicQuery['userBasic']
  subscription:
    | GQLGetMySubscriptionStatusQuery['getMySubscriptionStatus']
    | undefined
  hasPremium: boolean
  isLoading: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: React.ReactNode
  initialData?: GQLUserBasicQuery
  initialSubscriptionData?: GQLGetMySubscriptionStatusQuery
}

export function UserProvider({
  children,
  initialData,
  initialSubscriptionData,
}: UserProviderProps) {
  const session = useSession()
  const queryClient = useQueryClient()

  // Query is enabled if we have initialData OR session is authenticated
  // This prevents disabling queries during session loading when we have server data
  const { data, isLoading: isLoadingUserBasic } = useUserBasicQuery(
    {},
    {
      initialData,
      enabled: !!initialData || session.status === 'authenticated',
      staleTime: 60000, // Keep data fresh for 60 seconds
      refetchOnWindowFocus: false,
      refetchOnMount: !initialData, // Only refetch if no server data provided
      placeholderData: (previousData) => previousData,
    },
  )

  useSyncTimezone(data?.userBasic?.profile?.timezone ?? undefined)

  const { data: subscriptionData, isLoading: isLoadingSubscription } =
    useGetMySubscriptionStatusQuery(
      {},
      {
        initialData: initialSubscriptionData,
        enabled:
          !!initialSubscriptionData || session.status === 'authenticated',
        staleTime: 60000, // Data is fresh for 60 seconds - subscription rarely changes
        refetchOnWindowFocus: true, // CRITICAL: Refetch when user returns from payment
        refetchOnMount: !initialSubscriptionData, // Only refetch if no server data provided
        placeholderData: (previousData) => previousData,
      },
    )

  // Track previous session status to detect actual login/logout transitions
  const prevSessionStatus = useRef(session.status)

  // Only invalidate queries on actual session transitions, not on every page load
  useEffect(() => {
    const wasAuthenticated = prevSessionStatus.current === 'authenticated'
    const isNowAuthenticated = session.status === 'authenticated'
    const wasUnauthenticated = prevSessionStatus.current === 'unauthenticated'
    const isNowUnauthenticated = session.status === 'unauthenticated'

    // Detect actual login (transition from unauthenticated/loading to authenticated)
    if (!wasAuthenticated && isNowAuthenticated && wasUnauthenticated) {
      queryClient.invalidateQueries({
        queryKey: useUserBasicQuery.getKey({}),
      })
      queryClient.invalidateQueries({
        queryKey: useGetMySubscriptionStatusQuery.getKey({}),
      })
    }

    // Detect logout (transition from authenticated to unauthenticated)
    if (wasAuthenticated && isNowUnauthenticated) {
      queryClient.invalidateQueries({
        predicate: (query) => {
          const queryKey = query.queryKey
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes('userBasic') ||
              queryKey.includes('user') ||
              queryKey.includes('notifications') ||
              queryKey.includes('getWorkout') ||
              queryKey.includes('fitspace') ||
              queryKey.includes('GetMySubscriptionStatus'))
          )
        },
      })

      queryClient.removeQueries({
        predicate: (query) => {
          const queryKey = query.queryKey
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes('userBasic') ||
              queryKey.includes('user') ||
              queryKey.includes('GetMySubscriptionStatus'))
          )
        },
      })
    }

    prevSessionStatus.current = session.status
  }, [session.status, queryClient])

  const subscription = subscriptionData?.getMySubscriptionStatus
  const hasPremium = subscription?.hasPremium ?? true
  const user = data?.userBasic ?? initialData?.userBasic

  const contextValue: UserContextType = useMemo(
    () => ({
      session,
      user,
      subscription,
      hasPremium,
      isLoading:
        session.status === 'loading' ||
        isLoadingUserBasic ||
        isLoadingSubscription,
    }),
    [
      session,
      user,
      subscription,
      hasPremium,
      isLoadingUserBasic,
      isLoadingSubscription,
    ],
  )

  return (
    <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>
  )
}

export function useUser() {
  const context = useContext(UserContext)

  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }

  return context
}
