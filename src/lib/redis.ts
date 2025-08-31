import Redis from 'ioredis'

// Use global to persist Redis connection across module reloads in development
declare global {
  var __redis: Redis | undefined
  var __redisConnected: boolean | undefined
  var __redisConnecting: boolean | undefined
}

/**
 * Create single Redis instance with proper configuration
 * Uses global variable to persist across Next.js module reloads
 * Prevents race conditions during connection initialization
 */
function getRedisClient(): Redis | null {
  // Only connect if Redis URL is provided
  if (!process.env.REDIS_URL) {
    return null
  }

  // Return existing global connection if available
  if (global.__redis) {
    return global.__redis
  }

  // Prevent multiple connections during initial setup
  if (global.__redisConnecting) {
    console.warn('[REDIS] Connection already in progress, skipping...')
    return null
  }

  // Create new connection if none exists
  try {
    console.info('[REDIS] Creating new Redis connection...')
    global.__redisConnecting = true

    const client = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 2,
      lazyConnect: false,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
    })

    // Set up event handlers
    client.on('ready', () => {
      console.info('[REDIS] Connection ready')
      global.__redisConnected = true
      global.__redisConnecting = false
    })

    client.on('connect', () => {
      console.info('[REDIS] Connected successfully')
      global.__redisConnected = true
      global.__redisConnecting = false
    })

    client.on('error', (error: Error) => {
      console.error('[REDIS] Connection error:', error.message)
      global.__redisConnected = false
      global.__redisConnecting = false
    })

    client.on('close', () => {
      console.warn('[REDIS] Connection closed')
      global.__redisConnected = false
      global.__redisConnecting = false
    })

    client.on('reconnecting', (time: number) => {
      console.info(`[REDIS] Reconnecting in ${time}ms...`)
      global.__redisConnected = false
      global.__redisConnecting = true
    })

    client.on('end', () => {
      console.warn('[REDIS] Connection ended')
      global.__redisConnected = false
      global.__redisConnecting = false
      global.__redis = undefined
    })

    // Store in global for reuse - do this immediately to prevent race conditions
    global.__redis = client
    global.__redisConnected = false // Will be set to true on 'ready' event

    return client
  } catch (error) {
    console.error('[REDIS] Failed to create Redis client:', error)
    global.__redisConnecting = false
    return null
  }
}

/**
 * Ensure Redis connection is established
 * Waits for connection if currently connecting
 */
async function ensureConnection(client: Redis): Promise<boolean> {
  // If already connected, return immediately
  if (global.__redisConnected) {
    return true
  }

  // If currently connecting, wait a bit for the connection to establish
  if (global.__redisConnecting) {
    let attempts = 0
    const maxAttempts = 50 // 5 seconds max wait

    while (global.__redisConnecting && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      attempts++

      if (global.__redisConnected) {
        return true
      }
    }
  }

  // Test connection if not connected
  try {
    await client.ping()
    global.__redisConnected = true
    return true
  } catch (error) {
    console.error('[REDIS] Connection test failed:', error)
    global.__redisConnected = false
    return false
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

  // Ensure connection before operation
  const connected = await ensureConnection(client)
  if (!connected) {
    return null
  }

  try {
    const value = await client.get(key)

    if (value) {
      return JSON.parse(value)
    } else {
      return null
    }
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

  // Ensure connection before operation
  const connected = await ensureConnection(client)
  if (!connected) {
    return
  }

  try {
    const serialized = JSON.stringify(value)
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

  const connected = await ensureConnection(client)
  if (!connected) return false

  try {
    const result = await client.exists(key)
    return result === 1
  } catch (error) {
    console.error('Redis EXISTS error:', error)
    return false
  }
}

/**
 * Delete key from Redis
 */
async function deleteFromCache(key: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  const connected = await ensureConnection(client)
  if (!connected) return

  try {
    await client.del(key)
  } catch (error) {
    console.error('Redis DEL error:', error)
  }
}

/**
 * Clear all keys matching pattern from Redis
 */
async function clearCachePattern(pattern: string): Promise<void> {
  const client = getRedisClient()
  if (!client) return

  const connected = await ensureConnection(client)
  if (!connected) return

  try {
    const keys = await client.keys(pattern)
    if (keys.length > 0) {
      await client.del(...keys)
    }
  } catch (error) {
    console.error('Redis CLEAR PATTERN error:', error)
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
    connected: global.__redisConnected || false,
    connecting: global.__redisConnecting || false,
    client: global.__redis !== undefined,
  }
}

/**
 * Close Redis connection gracefully
 */
async function closeRedis(): Promise<void> {
  if (global.__redis) {
    try {
      await global.__redis.quit()
      console.info('[REDIS] Connection closed gracefully')
    } catch (error) {
      console.error('[REDIS] Error during close:', error)
    } finally {
      global.__redis = undefined
      global.__redisConnected = false
    }
  }
}

/**
 * Normalize search query for better cache hit rates
 * Removes special characters, extra spaces, and standardizes format
 */
export function normalizeSearchQuery(query: string): string {
  return query
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim()
}

// Cache key generators for food search
export const FoodSearchCacheKeys = {
  searchResults: (query: string) =>
    `food:search:${normalizeSearchQuery(query)}`,
  productDetails: (barcode: string) => `food:product:${barcode}`,
  popularQuery: (query: string) =>
    `food:popular:${normalizeSearchQuery(query)}`,
  // Pattern to clear all food search cache
  allFoodSearch: () => 'food:search:*',
  allFoodProduct: () => 'food:product:*',
  allPopular: () => 'food:popular:*',
} as const

// Cache TTL constants (in seconds) - Optimized for performance
export const FoodSearchCacheTTL = {
  searchResults: 60 * 60 * 6, // 6 hours (increased from 1 hour for better hit rate)
  productDetails: 60 * 60 * 24 * 7, // 1 week (product details rarely change)
  popularQueries: 60 * 60 * 24, // 24 hours for frequently searched terms
} as const

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
