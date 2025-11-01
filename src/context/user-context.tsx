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

  // Keep reference to last valid user data to prevent flashing to undefined
  const lastValidUserRef = useRef<GQLUserBasicQuery['userBasic'] | undefined>(
    undefined,
  )

  // Query is enabled if we have initialData OR session is authenticated
  // This prevents disabling queries during session loading when we have server data
  const { data, isLoading: isLoadingUserBasic } = useUserBasicQuery(
    {},
    {
      initialData,
      enabled: !!initialData || session.status === 'authenticated',
      staleTime: 0, // Always refetch - user data should be fresh
      refetchOnWindowFocus: false,
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
      enabled: !!initialSubscriptionData || session.status === 'authenticated',
      staleTime: 0, // Always refetch - subscription status must be fresh
      refetchOnWindowFocus: false,
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

  const isAuthenticated = session.status === 'authenticated'
  const isSessionLoading = session.status === 'loading'

  // Show data if authenticated OR if we have initialData (server-provided) while session is loading
  // This prevents flashing to undefined during session transitions
  const shouldShowData =
    isAuthenticated ||
    (isSessionLoading && (userData || lastValidUserRef.current))

  const displayUser = shouldShowData
    ? userData || lastValidUserRef.current
    : undefined

  const contextValue: UserContextType = useMemo(
    () => ({
      session,
      user: displayUser,
      subscription: shouldShowData ? subscription : undefined,
      hasPremium: shouldShowData ? hasPremium : false,
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
      shouldShowData,
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
