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
      // If we have initialData, treat it as fresh for 30 seconds
      initialDataUpdatedAt: initialData ? Date.now() : undefined,
      enabled: !!initialData || session.status === 'authenticated',
      staleTime: 30000, // Keep data fresh for 30 seconds
      refetchOnWindowFocus: false,
      // Keep previous data while refetching to prevent flash
      placeholderData: (previousData) => previousData,
    },
  )

  useSyncTimezone(data?.userBasic?.profile?.timezone ?? undefined)

  const {
    data: subscriptionData,
    isLoading: isLoadingSubscription,
    error: subscriptionError,
  } = useGetMySubscriptionStatusQuery(
    {},
    {
      initialData: initialSubscriptionData,
      // If we have initialData, treat it as fresh for 30 seconds
      initialDataUpdatedAt: initialSubscriptionData ? Date.now() : undefined,
      enabled: !!initialSubscriptionData || session.status === 'authenticated',
      staleTime: 30000, // Keep data fresh for 30 seconds
      refetchOnWindowFocus: false,
      // Keep previous data while refetching to prevent flash
      placeholderData: (previousData) => previousData,
    },
  )

  // Refetch user data when session becomes authenticated (after login)
  // Clear user query cache when user logs out
  useEffect(() => {
    if (session.status === 'authenticated') {
      // Immediately refetch user data when authenticated
      queryClient.invalidateQueries({
        queryKey: useUserBasicQuery.getKey({}),
      })
      queryClient.invalidateQueries({
        queryKey: useGetMySubscriptionStatusQuery.getKey({}),
      })
    }

    if (session.status === 'unauthenticated') {
      // Clear all user-related queries to prevent stale data
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

      // Remove cached queries entirely for a clean logout
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
