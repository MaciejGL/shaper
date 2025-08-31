import { cache } from '@/lib/cache'
import { prisma } from '@/lib/db'

// Cache TTL for access control - 30 minutes (team membership doesn't change often)
const ACCESS_CONTROL_TTL = 30 * 60 // 30 minutes

/**
 * Verifies if a user (trainer) has access to a client's data.
 *
 * Access is granted if:
 * 1. The user is the direct trainer of the client, OR
 * 2. The user is a team member with the client's trainer
 *
 * Results are cached for 30 minutes to improve performance.
 * Falls back gracefully when Redis is unavailable.
 *
 * @param trainerId - The ID of the user requesting access (should be a trainer)
 * @param clientId - The ID of the client whose data is being accessed
 * @returns Promise<boolean> - true if access is granted, false otherwise
 */
export async function verifyTrainerClientAccess(
  trainerId: string,
  clientId: string,
): Promise<boolean> {
  const cacheKey = cache.keys.trainerClientAccess.trainerClientAccess(
    trainerId,
    clientId,
  )

  // Try to get from cache first (will return null if Redis unavailable)
  try {
    const cachedResult = await cache.get<boolean>(cacheKey)
    if (cachedResult !== null) {
      console.info(`[ACCESS_CONTROL] Cache HIT for ${cacheKey}`)
      return cachedResult
    }
  } catch (error) {
    // Redis cache failed - continue without cache
    console.warn(
      `[ACCESS_CONTROL] Cache unavailable, proceeding with database check`,
    )
  }

  console.info(`[ACCESS_CONTROL] Cache MISS for ${cacheKey}`)

  try {
    // First check: Is the user the direct trainer of the client?
    const directClient = await prisma.user.findUnique({
      where: {
        id: clientId,
        trainerId: trainerId,
      },
    })

    if (directClient) {
      // Try to cache the result, but don't fail if Redis is down
      try {
        await cache.set(cacheKey, true, ACCESS_CONTROL_TTL)
      } catch (error) {
        console.warn(
          `[ACCESS_CONTROL] Failed to cache result: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
      return true
    }

    // Second check: Is the user a team member with the client's trainer?
    const clientWithTrainer = await prisma.user.findUnique({
      where: { id: clientId },
      select: { trainerId: true },
    })

    // If client has no trainer, access denied
    if (!clientWithTrainer?.trainerId) {
      // Try to cache the result, but don't fail if Redis is down
      try {
        await cache.set(cacheKey, false, ACCESS_CONTROL_TTL)
      } catch (error) {
        console.warn(
          `[ACCESS_CONTROL] Failed to cache result: ${error instanceof Error ? error.message : String(error)}`,
        )
      }
      return false
    }

    // Check if the requesting user and the client's trainer are team members
    const teamConnection = await prisma.teamMember.findFirst({
      where: {
        userId: trainerId,
        team: {
          members: {
            some: {
              userId: clientWithTrainer.trainerId,
            },
          },
        },
      },
    })

    const hasAccess = !!teamConnection

    // Try to cache the result, but don't fail if Redis is down
    try {
      await cache.set(cacheKey, hasAccess, ACCESS_CONTROL_TTL)
    } catch (error) {
      console.warn(
        `[ACCESS_CONTROL] Failed to cache result: ${error instanceof Error ? error.message : String(error)}`,
      )
    }

    return hasAccess
  } catch (error) {
    console.error('Error verifying trainer-client access:', error)
    return false
  }
}

interface TrainerAccessOptions {
  returnTrainerIds?: boolean
}

/**
 * Verifies trainer-client access and throws an error if access is denied.
 * Use this in GraphQL resolvers to ensure proper error handling.
 *
 * @param trainerId - The ID of the user requesting access
 * @param clientId - The ID of the client whose data is being accessed
 * @param options - Optional settings
 * @param options.returnTrainerIds - If true, returns array of authorized trainer IDs
 * @throws Error if access is denied or client not found
 * @returns void if returnTrainerIds is false, string[] if returnTrainerIds is true
 */
export async function ensureTrainerClientAccess(
  trainerId: string,
  clientId: string,
  options?: TrainerAccessOptions & { returnTrainerIds: true },
): Promise<string[]>
export async function ensureTrainerClientAccess(
  trainerId: string,
  clientId: string,
  options?: TrainerAccessOptions & { returnTrainerIds?: false },
): Promise<void>
export async function ensureTrainerClientAccess(
  trainerId: string,
  clientId: string,
  options?: TrainerAccessOptions,
): Promise<void | string[]> {
  const hasAccess = await verifyTrainerClientAccess(trainerId, clientId)

  if (!hasAccess) {
    throw new Error('Client not found or not associated with this trainer')
  }

  // If caller wants trainer IDs, get them
  if (options?.returnTrainerIds) {
    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: { trainerId: true },
    })

    if (!client?.trainerId) {
      return []
    }

    // Start with the direct trainer
    const authorizedTrainerIds = new Set([client.trainerId])

    // Add all team members of the client's trainer
    const teamMembers = await prisma.teamMember.findMany({
      where: {
        team: {
          members: {
            some: {
              userId: client.trainerId,
            },
          },
        },
      },
      select: { userId: true },
    })

    teamMembers.forEach((member) => authorizedTrainerIds.add(member.userId))

    return Array.from(authorizedTrainerIds)
  }
}

/**
 * Gets client information with trainer access verification.
 * Returns the client data if access is granted, null otherwise.
 *
 * @param trainerId - The ID of the user requesting access
 * @param clientId - The ID of the client
 * @returns Promise<User | null> - Client data if access granted, null otherwise
 */
export async function getClientWithAccess(trainerId: string, clientId: string) {
  const hasAccess = await verifyTrainerClientAccess(trainerId, clientId)

  if (!hasAccess) {
    return null
  }

  return prisma.user.findUnique({
    where: { id: clientId },
    include: {
      profile: true,
      trainer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })
}

/**
 * Invalidates access control cache for a specific trainer.
 * Call this when a trainer's team membership changes.
 * Gracefully handles Redis unavailability.
 *
 * @param trainerId - The ID of the trainer whose cache should be invalidated
 */
export async function invalidateTrainerAccessCache(
  trainerId: string,
): Promise<void> {
  try {
    const pattern = cache.keys.trainerClientAccess.trainerAllAccess(trainerId)
    await cache.removePattern(pattern)
    console.info(`[ACCESS_CONTROL] Invalidated cache for trainer: ${trainerId}`)
  } catch (error) {
    console.warn(
      `[ACCESS_CONTROL] Failed to invalidate cache for trainer ${trainerId}: ${error instanceof Error ? error.message : String(error)}`,
    )
    // Continue gracefully - cache invalidation failure isn't critical
  }
}

/**
 * Invalidates access control cache for a specific client.
 * Call this when a client's trainer assignment changes.
 * Gracefully handles Redis unavailability.
 *
 * @param clientId - The ID of the client whose cache should be invalidated
 */
export async function invalidateClientAccessCache(
  clientId: string,
): Promise<void> {
  try {
    const pattern = cache.keys.trainerClientAccess.clientAllAccess(clientId)
    await cache.removePattern(pattern)
    console.info(`[ACCESS_CONTROL] Invalidated cache for client: ${clientId}`)
  } catch (error) {
    console.warn(
      `[ACCESS_CONTROL] Failed to invalidate cache for client ${clientId}: ${error instanceof Error ? error.message : String(error)}`,
    )
    // Continue gracefully - cache invalidation failure isn't critical
  }
}

/**
 * Invalidates access control cache for multiple users.
 * Useful when a team is dissolved or multiple users are affected.
 * Gracefully handles Redis unavailability.
 *
 * @param userIds - Array of user IDs whose cache should be invalidated
 */
export async function invalidateMultipleUsersAccessCache(
  userIds: string[],
): Promise<void> {
  try {
    const promises = userIds.map((userId) => {
      return Promise.all([
        invalidateTrainerAccessCache(userId),
        invalidateClientAccessCache(userId),
      ])
    })

    await Promise.all(promises)
    console.info(
      `[ACCESS_CONTROL] Invalidated cache for ${userIds.length} users`,
    )
  } catch (error) {
    console.warn(
      `[ACCESS_CONTROL] Failed to invalidate cache for multiple users: ${error instanceof Error ? error.message : String(error)}`,
    )
    // Continue gracefully - cache invalidation failure isn't critical
  }
}

/**
 * Invalidates access control cache for a specific trainer-client pair.
 * Use this for targeted cache invalidation when you know the specific relationship.
 * Gracefully handles Redis unavailability.
 *
 * @param trainerId - The ID of the trainer
 * @param clientId - The ID of the client
 */
export async function invalidateSpecificAccessCache(
  trainerId: string,
  clientId: string,
): Promise<void> {
  try {
    const cacheKey = cache.keys.trainerClientAccess.trainerClientAccess(
      trainerId,
      clientId,
    )
    await cache.remove(cacheKey)
    console.info(`[ACCESS_CONTROL] Invalidated specific cache: ${cacheKey}`)
  } catch (error) {
    console.warn(
      `[ACCESS_CONTROL] Failed to invalidate cache for ${trainerId}-${clientId}: ${error instanceof Error ? error.message : String(error)}`,
    )
    // Continue gracefully - cache invalidation failure isn't critical
  }
}
