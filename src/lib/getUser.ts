import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { GQLUserRole } from '@/generated/graphql-server'
import { UserWithSession } from '@/types/UserWithSession'

import { authOptions } from './auth'
import { createUserLoaders } from './loaders/user.loader'

export type User = {
  id: string
  email: string
}

export type Session = {
  user: User
  expires: string
}

/**
 * Get the current authenticated user and session
 * @returns Promise with the user and session or null if not authenticated
 */
export async function getCurrentUser(): Promise<
  UserWithSession | null | undefined
> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }
  // Get full user data from database
  const loaders = createUserLoaders()
  const user = await loaders.getCurrentUser.load(session.user.email)

  if (!user) {
    return null
  }

  return {
    user,
    session,
  }
}
/**
 * Get the current authenticated user and session
 * @returns Promise with the user and session or null if not authenticated
 */
export async function getCurrentUserOrThrow(): Promise<UserWithSession> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    throw new Error('User not authenticated')
  }

  const loaders = createUserLoaders()
  const user = await loaders.getCurrentUser.load(session.user.email)

  if (!user?.id) {
    throw new Error('User not found')
  }

  return {
    user,
    session,
  }
}

// Helper function to use in API routes or server components to require authentication
export function requireAuth(
  authLevel: GQLUserRole,
  userSession?: UserWithSession | null,
) {
  if (!userSession) {
    redirect('/login')
  }

  if (authLevel && userSession.user?.role !== authLevel) {
    if (userSession.user?.role === GQLUserRole.Trainer) {
      redirect('/trainer/dashboard')
    } else if (userSession.user?.role === GQLUserRole.Client) {
      redirect('/fitspace/dashboard')
    }
  }

  return userSession
}
