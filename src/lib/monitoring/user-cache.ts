/**
 * User Cache Monitoring
 *
 * Provides real-time monitoring and logging of user cache statistics.
 * Only active in development environment.
 */
import { getUserCacheStats } from '../getUser'

// ============================================================================
// Calculations
// ============================================================================

const BYTES_PER_ENTRY = 4096 // ~4KB per entry (user object + profile + session)
const BYTES_TO_MB = 1024 * 1024 // 1,048,576 bytes in a MB

function calculateUtilization(size: number, maxSize: number): number {
  return (size / maxSize) * 100
}

function estimateMemoryMB(size: number): number {
  return (size * BYTES_PER_ENTRY) / BYTES_TO_MB
}

// ============================================================================
// Formatting
// ============================================================================

function formatCacheStats(): string {
  const stats = getUserCacheStats()
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
// Logging
// ============================================================================

function logCacheStats(): void {
  console.info(formatCacheStats())
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Start monitoring user cache in development
 * Logs stats every 30 seconds
 */
export function initializeUserCacheMonitoring(): void {
  if (process.env.NODE_ENV !== 'development') {
    return
  }

  // Log after server settles
  setTimeout(logCacheStats, 2000)

  // Then log every 30 seconds
  setInterval(logCacheStats, 30 * 1000)
}

// Auto-initialize when module is imported
initializeUserCacheMonitoring()
