import DataLoader from 'dataloader'

import { prisma } from '@/lib/db'

/**
 * User DataLoaders - PERFORMANCE OPTIMIZATION GUIDE:
 *
 * 🟢 PREFERRED: Use userBasic for most cases (profile + trainer)
 * 🟢 PREFERRED: Use getCurrentUser for email lookups (profile + trainer)
 * 🟡 CAUTION: userById includes bodyMeasures (won't batch with others)
 * 🔴 AVOID: getCurrentUserFull, userWithAllData (very heavy)
 *
 * To maximize batching, use consistent include patterns!
 */
export const createUserLoaders = () => ({
  // STANDARDIZED: Use same include pattern as userBasic for batching
  getCurrentUser: new DataLoader(async (emails: readonly string[]) => {
    console.info(
      `🔍 [USER-LOADER] getCurrentUser loading ${emails.length} users by email`,
    )
    const users = await prisma.user.findMany({
      where: { email: { in: emails as string[] } },
      include: {
        profile: true,
        trainer: true, // Added for consistency with userBasic
      },
    })

    const map = new Map(users.map((u) => [u.email, u]))
    return emails.map((email) => map.get(email) ?? null)
  }),

  // HEAVY: Full user data (only use when specifically needed)
  getCurrentUserFull: new DataLoader(async (emails: readonly string[]) => {
    console.warn(
      '[USER-LOADER] Using heavy getCurrentUserFull - ensure this is necessary',
    )
    const users = await prisma.user.findMany({
      where: { email: { in: emails as string[] } },
      include: {
        profile: {
          include: {
            bodyMeasures: true,
          },
        },
        trainer: {
          include: {
            profile: true,
          },
        },
        clients: {
          include: {
            profile: true,
          },
        },
        sessions: true,
        notifications: true,
      },
    })

    const map = new Map(users.map((u) => [u.email, u]))
    return emails.map((email) => map.get(email) ?? null)
  }),

  authSession: new DataLoader(async (emails: readonly string[]) => {
    console.info(
      `🔍 [USER-LOADER] authSession loading ${emails.length} users by email`,
    )
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
    console.info(`🔍 [USER-LOADER] userBasic loading ${ids.length} users by ID`)
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
      include: {
        profile: true, // Include full profile (bodyMeasures will be lazy-loaded if needed)
        trainer: true,
        // Exclude trainer relations, clients, sessions, notifications, and other heavy data
      },
    })
    const map = new Map(users.map((u) => [u.id, u]))
    return ids.map((id) => map.get(id) ?? null)
  }),

  // HEAVY: Full user data by ID (only use when specifically needed)
  userWithAllData: new DataLoader(async (ids: readonly string[]) => {
    console.warn(
      '[USER-LOADER] Using heavy userWithAllData - ensure this is necessary for user:',
      ids[0],
    )
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
      include: {
        profile: {
          include: {
            bodyMeasures: true,
          },
        },
        trainer: {
          include: {
            profile: true,
          },
        },
        clients: {
          include: {
            profile: true,
          },
        },
        sessions: true,
        notifications: {
          include: {
            creator: {
              include: {
                profile: true,
              },
            },
          },
        },
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
