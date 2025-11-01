import { randomBytes } from 'crypto'

import { getRedisClient } from '@/lib/redis'

/**
 * OAuth Handoff Code Storage
 *
 * Manages one-time codes for mobile OAuth handoff flow.
 * Codes are stored in Redis with 120-second TTL and consumed atomically.
 */

const HANDOFF_TTL_SECONDS = 120
const CODE_BYTES = 32

interface HandoffData {
  userId: string
  expiresAt: number // Unix timestamp in milliseconds
}

/**
 * Generate a cryptographically secure random handoff code
 */
export function generateHandoffCode(): string {
  return randomBytes(CODE_BYTES).toString('hex')
}

/**
 * Save a handoff code to Redis with TTL
 *
 * @param code - The handoff code (should be generated via generateHandoffCode)
 * @param userId - The authenticated user ID
 * @returns Promise that resolves when saved
 */
export async function saveHandoffCode(
  code: string,
  userId: string,
): Promise<void> {
  const redis = getRedisClient()
  if (!redis) {
    throw new Error('Redis client not available')
  }

  const key = `handoff:${code}`
  const expiresAt = Date.now() + HANDOFF_TTL_SECONDS * 1000

  const data: HandoffData = {
    userId,
    expiresAt,
  }

  try {
    await redis.setex(key, HANDOFF_TTL_SECONDS, JSON.stringify(data))
    console.info('🔐 [HANDOFF] Code saved:', {
      code: code.substring(0, 8) + '...',
      userId,
      expiresAt: new Date(expiresAt).toISOString(),
    })
  } catch (error) {
    console.error('🔐 [HANDOFF] Failed to save code:', error)
    throw error
  }
}

/**
 * Consume (retrieve and delete) a handoff code from Redis
 *
 * This operation is atomic - the code can only be consumed once.
 *
 * @param code - The handoff code to consume
 * @returns HandoffData if valid and not expired, null otherwise
 */
export async function consumeHandoffCode(
  code: string,
): Promise<HandoffData | null> {
  const redis = getRedisClient()
  if (!redis) {
    console.error('🔐 [HANDOFF] Redis client not available')
    return null
  }

  const key = `handoff:${code}`

  try {
    // Get the value
    const value = await redis.get<string>(key)

    if (!value) {
      console.warn('🔐 [HANDOFF] Code not found:', {
        code: code.substring(0, 8) + '...',
      })
      return null
    }

    // Delete immediately (single-use)
    await redis.del(key)

    // Parse the data
    const data: HandoffData =
      typeof value === 'string' ? JSON.parse(value) : value

    // Check if expired (extra safety check)
    if (Date.now() > data.expiresAt) {
      console.warn('🔐 [HANDOFF] Code expired:', {
        code: code.substring(0, 8) + '...',
        expiresAt: new Date(data.expiresAt).toISOString(),
      })
      return null
    }

    console.info('🔐 [HANDOFF] Code consumed successfully:', {
      code: code.substring(0, 8) + '...',
      userId: data.userId,
    })

    return data
  } catch (error) {
    console.error('🔐 [HANDOFF] Error consuming code:', error)
    return null
  }
}
