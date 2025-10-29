'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect, useMemo } from 'react'

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
}

export function UserProvider({ children, initialData }: UserProviderProps) {
  const session = useSession()
  const queryClient = useQueryClient()

  const { data, isLoading: isLoadingUserBasic } = useUserBasicQuery(
    {},
    {
      initialData,
      enabled: session.status !== 'unauthenticated',
      staleTime: 20 * 60 * 1000,
      refetchOnWindowFocus: true,
      placeholderData: (previousData) => previousData,
      refetchOnMount: false,
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
      enabled: session.status !== 'unauthenticated',
      refetchOnWindowFocus: true,
    },
  )

  if (subscriptionError) {
    console.error('[UserContext] Subscription query error', subscriptionError)
  }
  // Clear user query cache when user logs out
  useEffect(() => {
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

  const userData = data?.userBasic ?? initialData?.userBasic

  // Only hide user data if definitely logged out, not during loading states
  const isDefinitelyNotAuthenticated = session.status === 'unauthenticated'
  const shouldShowData = !isDefinitelyNotAuthenticated && Boolean(userData)

  const contextValue: UserContextType = {
    session,
    user: shouldShowData ? userData : undefined,
    subscription: shouldShowData ? subscription : undefined,
    hasPremium: shouldShowData ? hasPremium : false,
    isLoading:
      session.status === 'loading' ||
      isLoadingUserBasic ||
      isLoadingSubscription,
  }

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
