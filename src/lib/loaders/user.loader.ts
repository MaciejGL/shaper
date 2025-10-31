import DataLoader from 'dataloader'

import { prisma } from '@/lib/db'

/**
 * User DataLoaders - PERFORMANCE OPTIMIZATION GUIDE:
 *
 * 🟢 PREFERRED: Use userBasic for most cases (profile + trainer)
 * 🟢 PREFERRED: Use getCurrentUser for email lookups (profile + trainer)
 * 🟡 CAUTION: userById includes bodyMeasures (won't batch with others)
 *
 * To maximize batching, use consistent include patterns!
 */
export const createUserLoaders = () => ({
  // STANDARDIZED: Use same include pattern as userBasic for batching
  getCurrentUser: new DataLoader(async (emails: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { email: { in: emails as string[] } },
    })

    const map = new Map(users.map((u) => [u.email, u]))
    return emails.map((email) => map.get(email) ?? null)
  }),

  authSession: new DataLoader(async (emails: readonly string[]) => {
    const user = await prisma.user.findMany({
      where: { email: { in: emails as string[] } },
      include: {
        sessions: {
          where: {
            expiresAt: { gte: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    const map = new Map(user.map((u) => [u.email, u]))
    return emails.map((email) => map.get(email) ?? null)
  }),

  // HEAVY: User with bodyMeasures - use userBasic instead unless bodyMeasures specifically needed
  userById: new DataLoader(async (ids: readonly string[]) => {
    console.warn(
      `⚠️ [USER-LOADER] userById (with bodyMeasures) loading ${ids.length} users - consider using userBasic instead`,
    )
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
      include: {
        profile: {
          include: {
            bodyMeasures: true,
          },
        },
      },
    })
    const map = new Map(users.map((u) => [u.id, u]))
    return ids.map((id) => map.get(id) ?? null)
  }),

  // STANDARDIZED: Standard user data by ID (profile + trainer) - PREFERRED for most use cases
  userBasic: new DataLoader(async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
      include: {
        profile: true, // Include full profile (bodyMeasures will be lazy-loaded if needed)
      },
    })
    const map = new Map(users.map((u) => [u.id, u]))
    return ids.map((id) => map.get(id) ?? null)
  }),

  // UserProfile DataLoader by userId to eliminate UserProfile N+1 queries
  userProfileByUserId: new DataLoader(async (userIds: readonly string[]) => {
    const userProfiles = await prisma.userProfile.findMany({
      where: { userId: { in: userIds as string[] } },
      include: {
        user: true,
        bodyMeasures: true,
      },
    })
    const map = new Map(
      userProfiles.map((profile) => [profile.userId, profile]),
    )
    return userIds.map((userId) => map.get(userId) ?? null)
  }),
})
