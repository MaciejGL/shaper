import { Redis } from '@upstash/redis'

// Use global to persist Redis client across module reloads in development
declare global {
  var __upstashRedis: Redis | undefined
}

/**
 * Get Upstash Redis client
 * Uses HTTP-based REST API - no connection management needed
 */
function getRedisClient(): Redis | null {
  // Check if Upstash environment variables are set
  if (
    !process.env.UPSTASH_KV_REST_API_URL ||
    !process.env.UPSTASH_KV_REST_API_TOKEN
  ) {
    console.warn('[REDIS] Upstash environment variables not configured')
    return null
  }

  // Return existing global client if available
  if (global.__upstashRedis) {
    return global.__upstashRedis
  }

  // Create new Upstash Redis client
  try {
    console.info('[REDIS] Creating Upstash Redis client...')

    const client = new Redis({
      url: process.env.UPSTASH_KV_REST_API_URL,
      token: process.env.UPSTASH_KV_REST_API_TOKEN,
    })

    // Store in global for reuse
    global.__upstashRedis = client
    console.info('[REDIS] Upstash Redis client ready')

    return client
  } catch (error) {
    console.error('[REDIS] Failed to create Upstash Redis client:', error)
    return null
  }
}

/**
 * Get cached value from Redis
 */
async function getFromCache<T>(key: string): Promise<T | null> {
  const client = getRedisClient()
  if (!client) {
    return null
  }

  try {
    const value = await client.get<string>(key)

    if (value) {
      // Upstash returns parsed JSON if it's valid JSON, otherwise string
      // We need to handle both cases
      if (typeof value === 'string') {
        return JSON.parse(value)
      }
      return value as T
    }
    return null
  } catch (error) {
    console.error(`[REDIS] GET error for ${key}:`, error)
    return null
  }
}

/**
 * Set cached value in Redis with TTL
 */
async function setInCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 3600,
): Promise<void> {
  const client = getRedisClient()
  if (!client) {
    return
  }

  try {
    const serialized = JSON.stringify(value)
    // Use SETEX: set key with expiration
    await client.setex(key, ttlSeconds, serialized)
  } catch (error) {
    console.error(`[REDIS] SET error for ${key}:`, error)
  }
}

/**
 * Check if key exists in Redis
 */
async function existsInCache(key: string): Promise<boolean> {
  const client = getRedisClient()
  if (!client) return false

  try {
    const result = await client.exists(key)
    return result === 1
  } catch (error) {
    console.error('[REDIS] EXISTS error:', error)
    return false
  }
}

/**
 * Delete key from Redis
 */
async function deleteFromCache(key: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    await client.del(key)
  } catch (error) {
    console.error('[REDIS] DEL error:', error)
  }
}

/**
 * Clear all keys matching pattern from Redis
 */
async function clearCachePattern(pattern: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(...keys)
    }
  } catch (error) {
    console.error('[REDIS] CLEAR PATTERN error:', error)
  }
}

/**
 * Get Redis connection status
 */
function getRedisStatus(): {
  connected: boolean
  connecting: boolean
  client: boolean
} {
  return {
    connected: global.__upstashRedis !== undefined,
    connecting: false, // HTTP-based, no connection state
    client: global.__upstashRedis !== undefined,
  }
}

/**
 * Close Redis connection gracefully
 * Note: Upstash uses HTTP, no persistent connections to close
 */
async function closeRedis(): Promise<void> {
  if (global.__upstashRedis) {
    global.__upstashRedis = undefined
    console.info('[REDIS] Upstash client cleared')
  }
}

// Export the functions
export {
  getRedisClient,
  getFromCache,
  setInCache,
  existsInCache,
  deleteFromCache,
  clearCachePattern,
  getRedisStatus,
  closeRedis,
}
