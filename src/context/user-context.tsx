'use client'

import { useSession } from 'next-auth/react'
import { createContext, useContext } from 'react'

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

  const { data } = useUserBasicQuery(
    {},
    {
      enabled:
        session.status === 'authenticated' &&
        Boolean(session.data?.user?.email),
      staleTime: 20 * 60 * 1000, // 20 minutes
    },
  )

  const contextValue: UserContextType = {
    session,
    user: data?.userBasic,
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
