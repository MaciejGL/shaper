'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect } from 'react'

import {
  GQLGetMySubscriptionStatusQuery,
  GQLUserBasicQuery,
  useGetMySubscriptionStatusQuery,
  useUserBasicQuery,
} from '@/generated/graphql-client'
import { useSyncTimezone } from '@/hooks/use-sync-timezone'

interface UserContextType {
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

  // Automatically sync timezone when user logs in

  // Enable queries based on actual session data, NOT status string
  // Status can be 'loading' while session.data already exists (mobile webview issue)
  const hasSessionData = Boolean(session.data?.user?.email)
  const isDefinitelyLoggedOut = session.status === 'unauthenticated'

  const { data, isLoading: isLoadingUserBasic } = useUserBasicQuery(
    {},
    {
      initialData,
      enabled: hasSessionData && !isDefinitelyLoggedOut,
      staleTime: 20 * 60 * 1000, // 20 minutes
      refetchOnWindowFocus: true, // Refetch when window regains focus
      placeholderData: (previousData) => previousData, // Keep data visible during session transitions
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
      enabled: hasSessionData && !isDefinitelyLoggedOut,
      staleTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true, // Refetch when window regains focus
      placeholderData: (previousData) => previousData, // Keep data visible during session transitions
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
  const hasPremium = subscription?.hasPremium ?? false

  // Return cached data even during loading state to prevent UI flickering
  // Only clear data when explicitly unauthenticated
  const shouldShowData = session.status !== 'unauthenticated'

  const contextValue: UserContextType = {
    session,
    user: shouldShowData ? data?.userBasic : undefined,
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
