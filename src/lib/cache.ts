/**
 * Simple Centralized Cache System
 *
 * Usage:
 * - cache.get<T>(key)
 * - cache.set(key, value, ttlSeconds?)
 * - cache.remove(key)
 * - cache.removePattern(pattern)
 * - cache.keys.user.subscription(userId)
 */
import {
  clearCachePattern,
  deleteFromCache,
  getFromCache,
  setInCache,
} from '@/lib/redis'

// Cache TTL constants (in seconds)
const TTL = {
  SHORT: 5 * 60, // 5 minutes
  MEDIUM: 30 * 60, // 30 minutes
  LONG: 2 * 60 * 60, // 2 hours
  VERY_LONG: 24 * 60 * 60, // 24 hours
} as const

// Cache key generators
const keys = {
  user: {
    trainingPlans: (userId: string) => `user:${userId}:training-plans`,
    mealPlans: (userId: string) => `user:${userId}:meal-plans`,
  },
  exercises: {
    public: () => 'exercises:public',
    publicFiltered: (hash: string) => `exercises:public:${hash}`,
    single: (id: string) => `exercise:${id}`,
    previousExercises: (planId: string, dayId: string) =>
      `previous-exercises-v4:${planId}:${dayId}`,
  },
  packages: {
    active: () => 'packages:active',
    single: (id: string) => `package:${id}`,
  },
  patterns: {
    userAll: (userId: string) => `user:${userId}:*`,
    userSubscriptions: (userId: string) => `user:${userId}:subscription*`,
    exercisesAll: () => 'exercise*',
    packagesAll: () => 'package*',
  },
  trainerClientAccess: {
    trainerClientAccess: (trainerId: string, clientId: string) =>
      `access:trainer:${trainerId}:client:${clientId}`,
    trainerAllAccess: (trainerId: string) => `access:trainer:${trainerId}:*`,
    clientAllAccess: (clientId: string) => `access:*:client:${clientId}`,
  },
}

// Cache operations
async function get<T>(key: string): Promise<T | null> {
  try {
    return await getFromCache<T>(key)
  } catch (error) {
    console.error(`[CACHE] GET error for ${key}:`, error)
    return null
  }
}

async function set<T>(
  key: string,
  value: T,
  ttlSeconds: number = TTL.MEDIUM,
): Promise<void> {
  try {
    await setInCache(key, value, ttlSeconds)
    console.info(`[CACHE] SET ${key} (TTL: ${ttlSeconds}s)`)
  } catch (error) {
    console.error(`[CACHE] SET error for ${key}:`, error)
  }
}

async function remove(key: string): Promise<void> {
  try {
    await deleteFromCache(key)
    console.info(`[CACHE] REMOVE ${key}`)
  } catch (error) {
    console.error(`[CACHE] REMOVE error for ${key}:`, error)
  }
}

async function removePattern(pattern: string): Promise<void> {
  try {
    await clearCachePattern(pattern)
    console.info(`[CACHE] REMOVE PATTERN ${pattern}`)
  } catch (error) {
    console.error(`[CACHE] REMOVE PATTERN error for ${pattern}:`, error)
  }
}

// Cache-or-fetch helper
async function getOrSet<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = TTL.MEDIUM,
): Promise<T> {
  const cached = await get<T>(key)
  if (cached !== null) {
    console.info(`[CACHE] HIT ${key}`)
    return cached
  }

  console.info(`[CACHE] MISS ${key}`)
  const data = await fetchFn()
  await set(key, data, ttlSeconds)
  return data
}

// Export everything as one object
export const cache = {
  keys,
  TTL,
  get,
  set,
  remove,
  removePattern,
  getOrSet,
}
