import Redis from 'ioredis'

// Redis connection state
let redisClient: Redis | null = null
let isConnected = false

/**
 * Initialize Redis connection
 */
function initRedis(): Redis | null {
  // Only connect if Redis URL is provided
  if (!process.env.REDIS_URL) {
    return null
  }

  if (redisClient) {
    return redisClient // Return existing connection
  }

  try {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    })

    // Set up event handlers after creating the client
    redisClient.on('ready', () => {
      isConnected = true
    })

    redisClient.on('connect', () => {
      isConnected = true
    })

    redisClient.on('error', (error: Error) => {
      console.error('[REDIS] Connection error:', error.message)
      isConnected = false
    })

    redisClient.on('close', () => {
      isConnected = false
    })

    redisClient.on('reconnecting', () => {
      console.info('[REDIS] Reconnecting...')
    })

    return redisClient
  } catch (error) {
    console.error('[REDIS] Failed to create client:', error)
    return null
  }
}

/**
 * Ensure Redis connection is established
 */
async function ensureConnection(client: Redis): Promise<boolean> {
  if (isConnected) {
    return true
  }

  try {
    await client.ping()
    isConnected = true
    return true
  } catch (error) {
    console.error('[REDIS] Connection test failed:', error)
    isConnected = false
    return false
  }
}

/**
 * Get cached value from Redis
 */
async function getFromCache<T>(key: string): Promise<T | null> {
  const client = initRedis()
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
  const client = initRedis()
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
  const client = initRedis()
  if (!client || !isConnected) return false

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
  const client = initRedis()
  if (!client || !isConnected) return

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
  const client = initRedis()
  if (!client || !isConnected) return

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
function getRedisStatus(): { connected: boolean; client: boolean } {
  return {
    connected: isConnected,
    client: redisClient !== null,
  }
}

/**
 * Close Redis connection
 */
async function closeRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    isConnected = false
  }
}

// Cache key generators for food search
export const FoodSearchCacheKeys = {
  searchResults: (query: string) => `food:search:${query.toLowerCase()}`,
  productDetails: (barcode: string) => `food:product:${barcode}`,
  // Pattern to clear all food search cache
  allFoodSearch: () => 'food:search:*',
  allFoodProduct: () => 'food:product:*',
} as const

// Cache TTL constants (in seconds)
export const FoodSearchCacheTTL = {
  searchResults: 60 * 60, // 1 hour
  productDetails: 60 * 60 * 24, // 24 hours (product details change less frequently)
} as const

// Export the functions
export {
  initRedis,
  getFromCache,
  setInCache,
  existsInCache,
  deleteFromCache,
  clearCachePattern,
  getRedisStatus,
  closeRedis,
}
