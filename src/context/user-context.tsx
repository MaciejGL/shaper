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

interface UserContextType {
  session: ReturnType<typeof useSession>
  user: GQLUserBasicQuery['userBasic']
  subscription:
    | GQLGetMySubscriptionStatusQuery['getMySubscriptionStatus']
    | undefined
  hasPremium: boolean
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: React.ReactNode
}

export function UserProvider({ children }: UserProviderProps) {
  const session = useSession()
  const queryClient = useQueryClient()

  const { data } = useUserBasicQuery(
    {},
    {
      enabled:
        session.status === 'authenticated' &&
        Boolean(session.data?.user?.email),
      staleTime: 20 * 60 * 1000, // 20 minutes
    },
  )

  const { data: subscriptionData } = useGetMySubscriptionStatusQuery(
    {},
    {
      enabled:
        session.status === 'authenticated' &&
        Boolean(session.data?.user?.email),
      staleTime: 10 * 60 * 1000, // 10 minutes - refresh more frequently for premium status
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
  const hasPremium = subscription?.hasPremium ?? false

  const contextValue: UserContextType = {
    session,
    user: session.status === 'authenticated' ? data?.userBasic : undefined,
    subscription: session.status === 'authenticated' ? subscription : undefined,
    hasPremium: session.status === 'authenticated' ? hasPremium : false,
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
