/**
 * Redis Cache Service for Public Base Exercises
 *
 * This service implements a cache-first approach for public base exercises to reduce database load.
 *
 * WHAT IS CACHED:
 * ✅ Public base exercises (isPublic: true) - regardless of creator
 * ❌ Private/trainer exercises - always hit database
 * ❌ Admin/moderator lists - not cached
 *
 * USAGE:
 * - Replace direct Prisma calls with cache service functions
 * - Cache automatically handles filtering, version filtering, and TTL
 * - Falls back to database on cache miss or Redis unavailability
 *
 * CACHE BYPASS:
 * - Set SKIP_BASE_EXERCISE_CACHE=true to bypass cache (useful for AI training/testing)
 * - When enabled, all queries go directly to the database
 *
 * CACHE KEYS:
 * - base-exercises:public:all - All public exercises (no filters)
 * - base-exercises:public:filtered:{hash} - Filtered public exercises
 * - base-exercises:public:single:{id} - Individual public exercises
 *
 * CACHE TTL: 24 hours (public exercises are very static)
 */
import crypto from 'crypto'

import { GQLExerciseWhereInput } from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { getExerciseVersionWhereClause } from '@/lib/exercise-version-filter'
import { getFromCache, setInCache } from '@/lib/redis'

// Cache TTL: 24 hours for public exercises (very static)
const CACHE_TTL = 24 * 60 * 60 // 24 hours in seconds

// Environment variable to skip cache (useful for AI training/testing)
const SKIP_CACHE =
  process.env.SKIP_BASE_EXERCISE_CACHE === 'true' ||
  process.env.SKIP_BASE_EXERCISE_CACHE === '1'

// Cache key prefixes
const CACHE_KEYS = {
  PUBLIC_ALL: 'base-exercises:public:all',
  PUBLIC_FILTERED: 'base-exercises:public:filtered',
  PUBLIC_SINGLE: 'base-exercises:public:single',
} as const

/**
 * Type definition for cached base exercise data
 * Matches the Prisma include structure used in resolvers
 */
export type CachedBaseExercise = Prisma.BaseExerciseGetPayload<{
  include: {
    images: true
    muscleGroups: true
    secondaryMuscleGroups: true
  }
}>

/**
 * Generate a consistent hash for cache keys based on filter parameters
 */
function generateFilterHash(where?: GQLExerciseWhereInput | null): string {
  if (!where) return 'no-filter'

  const filterObj = {
    equipment: where.equipment || null,
    muscleGroups: where.muscleGroups?.sort() || null, // Sort for consistency
  }

  return crypto
    .createHash('md5')
    .update(JSON.stringify(filterObj))
    .digest('hex')
    .substring(0, 8) // Use first 8 chars for shorter keys
}

/**
 * Build Prisma where clause for public exercises with optional filters
 */
function buildPublicExerciseWhereClause(
  where?: GQLExerciseWhereInput | null,
): Prisma.BaseExerciseWhereInput {
  const whereClause: Prisma.BaseExerciseWhereInput = {
    isPublic: true, // Only cache public exercises
    ...getExerciseVersionWhereClause(), // Apply environment version filter
  }

  if (where?.equipment) {
    whereClause.equipment = where.equipment
  }

  if (where?.muscleGroups) {
    whereClause.muscleGroups = {
      some: {
        id: { in: where.muscleGroups },
      },
    }
  }

  return whereClause
}

/**
 * Fetch public exercises from database with all related data
 */
async function fetchPublicExercisesFromDB(
  where?: GQLExerciseWhereInput | null,
): Promise<CachedBaseExercise[]> {
  const whereClause = buildPublicExerciseWhereClause(where)

  const exercises = await prisma.baseExercise.findMany({
    relationLoadStrategy: 'query',
    where: whereClause,
    orderBy: {
      name: 'asc',
    },
    include: {
      images: true,
      muscleGroups: true,
      secondaryMuscleGroups: true,
    },
  })

  return exercises
}

/**
 * Get public exercises with cache-first approach
 * Falls back to database if cache miss
 * Skips cache if SKIP_BASE_EXERCISE_CACHE env var is set
 */
export async function getPublicExercises(
  where?: GQLExerciseWhereInput | null,
): Promise<CachedBaseExercise[]> {
  // Skip cache if environment variable is set
  if (SKIP_CACHE) {
    console.info('[BASE_EXERCISE_CACHE] Cache SKIPPED (env var set)')
    return fetchPublicExercisesFromDB(where)
  }

  const filterHash = generateFilterHash(where)
  const cacheKey = where
    ? `${CACHE_KEYS.PUBLIC_FILTERED}:${filterHash}`
    : CACHE_KEYS.PUBLIC_ALL

  try {
    // Try cache first
    const cached = await getFromCache<CachedBaseExercise[]>(cacheKey)
    if (cached) {
      console.info(`[BASE_EXERCISE_CACHE] Cache HIT for key: ${cacheKey}`)
      return cached
    }

    console.info(`[BASE_EXERCISE_CACHE] Cache MISS for key: ${cacheKey}`)

    // Fallback to database
    const exercises = await fetchPublicExercisesFromDB(where)

    // Cache the result
    await setInCache(cacheKey, exercises, CACHE_TTL)
    console.info(
      `[BASE_EXERCISE_CACHE] Cached ${exercises.length} exercises with key: ${cacheKey}`,
    )

    return exercises
  } catch (error) {
    console.error('[BASE_EXERCISE_CACHE] Error in getPublicExercises:', error)
    // Fallback to database on any error
    return fetchPublicExercisesFromDB(where)
  }
}

/**
 * Get a single public exercise by ID with cache-first approach
 * Skips cache if SKIP_BASE_EXERCISE_CACHE env var is set
 */
export async function getPublicExerciseById(
  id: string,
): Promise<CachedBaseExercise | null> {
  // Skip cache if environment variable is set
  if (SKIP_CACHE) {
    console.info(
      '[BASE_EXERCISE_CACHE] Cache SKIPPED for single exercise (env var set)',
    )
    return prisma.baseExercise.findUnique({
      where: {
        id,
        isPublic: true,
      },
      include: {
        images: true,
        muscleGroups: true,
        secondaryMuscleGroups: true,
      },
    })
  }

  const cacheKey = `${CACHE_KEYS.PUBLIC_SINGLE}:${id}`

  try {
    // Try cache first
    const cached = await getFromCache<CachedBaseExercise>(cacheKey)
    if (cached) {
      console.info(`[BASE_EXERCISE_CACHE] Cache HIT for single exercise: ${id}`)
      return cached
    }

    console.info(`[BASE_EXERCISE_CACHE] Cache MISS for single exercise: ${id}`)

    // Fallback to database
    const exercise = await prisma.baseExercise.findUnique({
      where: {
        id,
        isPublic: true, // Only cache public exercises
      },
      include: {
        images: true,
        muscleGroups: true,
        secondaryMuscleGroups: true,
      },
    })

    if (exercise) {
      // Cache the result
      await setInCache(cacheKey, exercise, CACHE_TTL)
      console.info(`[BASE_EXERCISE_CACHE] Cached single exercise: ${id}`)
    }

    return exercise
  } catch (error) {
    console.error(`[BASE_EXERCISE_CACHE] Error getting exercise ${id}:`, error)
    // Fallback to database on any error
    return prisma.baseExercise.findUnique({
      where: { id },
      include: {
        images: true,
        muscleGroups: true,
        secondaryMuscleGroups: true,
      },
    })
  }
}

/**
 * Utility function to warm up the cache with all public exercises
 * Can be called during application startup or scheduled jobs
 * Skips if SKIP_BASE_EXERCISE_CACHE env var is set
 */
export async function warmUpPublicExercisesCache(): Promise<void> {
  if (SKIP_CACHE) {
    console.info('[BASE_EXERCISE_CACHE] Cache warm-up skipped (env var set)')
    return
  }

  try {
    console.info('[BASE_EXERCISE_CACHE] Warming up cache...')
    await getPublicExercises() // This will cache all public exercises
    console.info('[BASE_EXERCISE_CACHE] Cache warm-up completed')
  } catch (error) {
    console.error('[BASE_EXERCISE_CACHE] Error during cache warm-up:', error)
  }
}
