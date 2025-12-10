import { deleteFromCache } from '@/lib/redis'

export function getTrainingAnalyticsCacheKey(userId: string): string {
  return `training-analytics:v2:${userId}`
}

export async function invalidateTrainingAnalyticsCache(
  userId: string,
): Promise<void> {
  await deleteFromCache(getTrainingAnalyticsCacheKey(userId))
}

