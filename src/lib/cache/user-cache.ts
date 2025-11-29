import { deleteFromCache, getFromCache, setInCache } from '@/lib/redis'

const USER_BASIC_CACHE_TTL = 60 * 60 // 1 hour - profile data rarely changes

function getUserBasicCacheKey(userId: string): string {
  return `user:basic:${userId}`
}

export async function getCachedUserBasic<T>(userId: string): Promise<T | null> {
  return getFromCache<T>(getUserBasicCacheKey(userId))
}

export async function setCachedUserBasic<T>(
  userId: string,
  data: T,
): Promise<void> {
  await setInCache(getUserBasicCacheKey(userId), data, USER_BASIC_CACHE_TTL)
}

export async function invalidateUserBasicCache(userId: string): Promise<void> {
  await deleteFromCache(getUserBasicCacheKey(userId))
}
