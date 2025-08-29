import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'

import { GQLUserRole } from '@/generated/graphql-server'
import { UserWithSession } from '@/types/UserWithSession'

import { authOptions } from './auth'
import { createUserLoaders } from './loaders/user.loader'
import { deleteFromCache, getFromCache, setInCache } from './redis'

// Simple in-memory deduplication to prevent race conditions
const pendingRequests = new Map<string, Promise<UserWithSession | null>>()

export type User = {
  id: string
  email: string
}

export type Session = {
  user: User
  expires: string
}

/**
 * Get the current authenticated user and session with Redis caching
 * @returns Promise with the user and session or null if not authenticated
 */
export async function getCurrentUser(): Promise<
  UserWithSession | null | undefined
> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return null
  }

  // Try to get user from cache first
  const cacheKey = `auth:user:${session.user.email}`
  const cachedUser = await getFromCache<UserWithSession>(cacheKey)

  if (cachedUser) {
    // Security: Check if session matches (prevents stale cache after logout)
    if (cachedUser.session.expires === session.expires) {
      console.info(`🔄 [CACHE-HIT] getCurrentUser for ${session.user.email}`)
      return cachedUser
    }
    // Session changed, clear cache
    await deleteFromCache(cacheKey)
  }

  // Check if there's already a pending request for this user (race condition protection)
  const userEmail = session.user.email
  if (pendingRequests.has(userEmail)) {
    console.info(`⏳ [DEDUP] Waiting for ongoing request for ${userEmail}`)
    return await pendingRequests.get(userEmail)!
  }

  // Cache miss - fetch from database
  console.info(
    `🔍 [CACHE-MISS] Fetching getCurrentUser from DB for ${userEmail}`,
  )

  // Create and store the pending request
  const fetchPromise = (async (): Promise<UserWithSession | null> => {
    try {
      const loaders = createUserLoaders()
      const user = await loaders.getCurrentUser.load(userEmail)

      if (!user) {
        return null
      }

      const userWithSession = {
        user,
        session,
      }

      // Cache for 30 seconds
      await setInCache(cacheKey, userWithSession, 120)
      console.info(
        `💾 [CACHE-SET] Cached getCurrentUser for ${userEmail} (120s TTL)`,
      )

      return userWithSession
    } finally {
      // Clean up the pending request
      pendingRequests.delete(userEmail)
    }
  })()

  pendingRequests.set(userEmail, fetchPromise)
  return await fetchPromise
}
/**
 * Get the current authenticated user and session with caching (throws on error)
 * @returns Promise with the user and session or throws error if not authenticated
 */
export async function getCurrentUserOrThrow(): Promise<UserWithSession> {
  const userWithSession = await getCurrentUser()

  if (!userWithSession) {
    throw new Error('User not authenticated')
  }

  if (!userWithSession.user?.id) {
    throw new Error('User not found')
  }

  return userWithSession
}

/**
 * Invalidate user cache when user data is updated or logs out
 * Call this after logout, profile updates, role changes, etc.
 */
export async function invalidateUserCache(email: string): Promise<void> {
  const cacheKey = `auth:user:${email}`
  await deleteFromCache(cacheKey)
  // Security: Also clear any pending requests
  pendingRequests.delete(email)
  console.info(`🗑️ [CACHE-INVALIDATE] Cleared cache for user ${email}`)
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
      redirect('/fitspace/workout')
    }
  }

  return userSession
}
