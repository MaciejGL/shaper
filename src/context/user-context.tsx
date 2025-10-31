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
}

export function UserProvider({ children, initialData }: UserProviderProps) {
  const session = useSession()
  const queryClient = useQueryClient()

  // Keep reference to last valid user data to prevent flashing to undefined
  const lastValidUserRef = useRef<GQLUserBasicQuery['userBasic'] | undefined>(
    undefined,
  )

  const { data, isLoading: isLoadingUserBasic } = useUserBasicQuery(
    {},
    {
      initialData,
      enabled: session.status !== 'unauthenticated',
      staleTime: 20 * 60 * 1000,
      refetchOnWindowFocus: false,
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
      // Reduce aggressive refetching
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000, // 10 minutes
    },
  )

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

  // Update ref with latest valid user data
  if (userData) {
    lastValidUserRef.current = userData
  }

  // Only show user data when session is definitely authenticated
  const isAuthenticated = session.status === 'authenticated'

  // Use current data if available, otherwise use last valid data
  // This prevents flashing to undefined during session transitions
  const displayUser = isAuthenticated
    ? userData || lastValidUserRef.current
    : undefined

  const contextValue: UserContextType = useMemo(
    () => ({
      session,
      user: displayUser,
      subscription: isAuthenticated ? subscription : undefined,
      hasPremium: isAuthenticated ? hasPremium : false,
      isLoading:
        session.status === 'loading' ||
        isLoadingUserBasic ||
        isLoadingSubscription,
    }),
    [
      session,
      displayUser,
      subscription,
      hasPremium,
      isAuthenticated,
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
