'use client'

import { useQueryClient } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { createContext, useContext, useEffect } from 'react'

import {
  GQLUserBasicQuery,
  useUserBasicQuery,
} from '@/generated/graphql-client'

interface UserContextType {
  session: ReturnType<typeof useSession>
  user: GQLUserBasicQuery['userBasic']
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
              queryKey.includes('fitspace'))
          )
        },
      })

      // Remove cached queries entirely for a clean logout
      queryClient.removeQueries({
        predicate: (query) => {
          const queryKey = query.queryKey
          return (
            Array.isArray(queryKey) &&
            (queryKey.includes('userBasic') || queryKey.includes('user'))
          )
        },
      })
    }
  }, [session.status, queryClient])

  const contextValue: UserContextType = {
    session,
    user: session.status === 'authenticated' ? data?.userBasic : undefined,
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
