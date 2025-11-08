/**
 * User Cache Monitoring
 *
 * Production-safe monitoring system:
 * - Production: Writes cache stats to Redis every 2 minutes
 * - Development: Reads from Redis every minute to display in terminal
 */
import { getUserCacheStats } from '../getUser'
import { getFromCache, setInCache } from '../redis'

// ============================================================================
// Configuration
// ============================================================================

const BYTES_PER_ENTRY = 4096 // ~4KB per entry (user object + profile + session)
const BYTES_TO_MB = 1024 * 1024 // 1,048,576 bytes in a MB

// Production: Write cache stats to Redis every 2 minutes
const PRODUCTION_WRITE_INTERVAL = 2 * 60 * 1000 // 2 minutes
// Development: Read from Redis every minute
const DEVELOPMENT_READ_INTERVAL = 2 * 60 * 1000 // 2 minutes

const CACHE_STATS_KEY = 'user-cache-stats'

// ============================================================================
// Calculations
// ============================================================================

function calculateUtilization(size: number, maxSize: number): number {
  return (size / maxSize) * 100
}

function estimateMemoryMB(size: number): number {
  return (size * BYTES_PER_ENTRY) / BYTES_TO_MB
}

// ============================================================================
// Formatting
// ============================================================================

function formatCacheStats(stats: {
  size: number
  maxSize: number
  expired: number
  pending: number
}): string {
  const utilization = calculateUtilization(stats.size, stats.maxSize)
  const memoryMB = estimateMemoryMB(stats.size)

  // Color codes
  const cyan = '\x1b[36m'
  const green = '\x1b[32m'
  const yellow = '\x1b[33m'
  const magenta = '\x1b[35m'
  const blue = '\x1b[34m'
  const gray = '\x1b[90m'
  const reset = '\x1b[0m'
  const bold = '\x1b[1m'

  // Dynamic colors based on thresholds
  const utilColor = utilization > 70 ? yellow : green
  const memColor = memoryMB > 50 ? yellow : cyan

  return `${bold}${magenta}[USER CACHE]${reset} ${bold}${stats.size}${reset}${gray}/${reset}${stats.maxSize} ${blue}entries${reset} ${utilColor}${bold}(${utilization.toFixed(1)}%)${reset} ${gray}|${reset} ${memColor}${bold}${memoryMB.toFixed(1)}MB${reset} ${gray}|${reset} ${cyan}${bold}${stats.pending}${reset} ${cyan}pending${reset} ${gray}|${reset} ${yellow}${bold}${stats.expired}${reset} ${yellow}expired${reset}`
}

// ============================================================================
// Production: Write to Redis
// ============================================================================

/**
 * Write current cache stats to Redis
 * Called every 2 minutes in production
 */
async function writeCacheStatsToRedis(): Promise<void> {
  try {
    const stats = getUserCacheStats()
    const statsWithTimestamp = {
      ...stats,
      timestamp: Date.now(),
      environment: 'production',
    }

    await setInCache(CACHE_STATS_KEY, statsWithTimestamp, 300) // 5 minute TTL
  } catch (error) {
    console.error('❌ Failed to write cache stats to Redis:', error)
  }
}

// ============================================================================
// Development: Read from Redis
// ============================================================================

/**
 * Read cache stats from Redis and display in terminal
 * Called every minute in development
 */
async function readAndDisplayCacheStats(): Promise<void> {
  try {
    const cachedStats = (await getFromCache(CACHE_STATS_KEY)) as {
      size: number
      maxSize: number
      expired: number
      pending: number
      timestamp: number
      environment: string
    } | null

    if (cachedStats) {
      const stats = {
        size: cachedStats.size,
        maxSize: cachedStats.maxSize,
        expired: cachedStats.expired,
        pending: cachedStats.pending,
      }

      const timestamp = new Date(cachedStats.timestamp)
      const timeFormatted = timestamp.toLocaleTimeString('en-GB', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })

      const gray = '\x1b[90m'
      const reset = '\x1b[0m'

      console.info(
        formatCacheStats(stats) + ` ${gray}(${timeFormatted})${reset}`,
      )
    } else {
      console.info('📊 [USER CACHE] No production stats available')
    }
  } catch (error) {
    console.error('❌ Failed to read cache stats from Redis:', error)
  }
}

// ============================================================================
// Initialization
// ============================================================================

// Singleton pattern to prevent multiple initializations
let isInitialized = false
let productionInterval: NodeJS.Timeout | null = null
let developmentInterval: NodeJS.Timeout | null = null

/**
 * Initialize monitoring based on environment
 * - Production: Write to Redis every 2 minutes
 * - Development: Read from Redis every minute
 */
export function initializeUserCacheMonitoring(): void {
  // Prevent multiple initializations
  if (isInitialized) {
    return
  }

  isInitialized = true

  if (process.env.NODE_ENV === 'production') {
    // Production: Write to Redis every 2 minutes
    console.info(
      '📊 [USER CACHE] Production monitoring: Writing stats to Redis every 2 minutes',
    )
    setTimeout(writeCacheStatsToRedis, 2000) // Start after 2 seconds
    productionInterval = setInterval(
      writeCacheStatsToRedis,
      PRODUCTION_WRITE_INTERVAL,
    )
  } else {
    // Development: Read from Redis every minute
    console.info(
      '📊 [USER CACHE] Development monitoring: Reading stats from Redis every minute',
    )
    setTimeout(readAndDisplayCacheStats, 2000) // Start after 2 seconds
    developmentInterval = setInterval(
      readAndDisplayCacheStats,
      DEVELOPMENT_READ_INTERVAL,
    )
  }
}

/**
 * Clean up intervals (useful for testing or manual cleanup)
 */
export function cleanupUserCacheMonitoring(): void {
  if (productionInterval) {
    clearInterval(productionInterval)
    productionInterval = null
  }
  if (developmentInterval) {
    clearInterval(developmentInterval)
    developmentInterval = null
  }
  isInitialized = false
}

// Auto-initialize when module is imported
// initializeUserCacheMonitoring()
