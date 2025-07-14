import { prisma } from '@/lib/db'

// Simple monitoring stats
interface MonitoringStats {
  activeConnections: number
  totalQueries: number
  slowQueries: number
  averageQueryTime: number
  lastHealthCheck: Date
  consecutiveFailures: number
}

class DatabaseMonitor {
  private stats: MonitoringStats = {
    activeConnections: 0,
    totalQueries: 0,
    slowQueries: 0,
    averageQueryTime: 0,
    lastHealthCheck: new Date(),
    consecutiveFailures: 0,
  }

  private queryTimes: number[] = []
  private readonly SLOW_QUERY_THRESHOLD = 2000 // 2 seconds
  private readonly MAX_QUERY_TIMES = 100 // Keep last 100 query times for average

  // Track query execution
  trackQuery(executionTime: number, queryType?: string) {
    this.stats.totalQueries++
    this.queryTimes.push(executionTime)

    // Keep only recent query times
    if (this.queryTimes.length > this.MAX_QUERY_TIMES) {
      this.queryTimes.shift()
    }

    // Update average
    this.stats.averageQueryTime =
      this.queryTimes.reduce((sum, time) => sum + time, 0) /
      this.queryTimes.length

    // Track slow queries
    if (executionTime > this.SLOW_QUERY_THRESHOLD) {
      this.stats.slowQueries++
      console.warn(
        `[DB-MONITOR] Slow query detected: ${executionTime}ms${queryType ? ` (${queryType})` : ''}`,
      )
    }
  }

  // Get current connection count
  async checkConnections(): Promise<number> {
    try {
      const result = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM pg_stat_activity
        WHERE datname = current_database()
      `
      const count = Number(result[0].count)
      this.stats.activeConnections = count

      // Warn on high connection count (adjusted for connection pooling)
      if (count > 6) {
        console.warn(`[DB-MONITOR] High connection count: ${count}`)
      }

      return count
    } catch (error) {
      console.error('[DB-MONITOR] Failed to check connections:', error)
      this.stats.consecutiveFailures++
      return -1
    }
  }

  // Basic health check
  async healthCheck(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`
      this.stats.lastHealthCheck = new Date()
      this.stats.consecutiveFailures = 0
      return true
    } catch (error) {
      console.error('[DB-MONITOR] Health check failed:', error)
      this.stats.consecutiveFailures++
      return false
    }
  }

  // Get current stats
  getStats(): MonitoringStats {
    return { ...this.stats }
  }

  // Reset stats
  resetStats() {
    this.stats = {
      activeConnections: 0,
      totalQueries: 0,
      slowQueries: 0,
      averageQueryTime: 0,
      lastHealthCheck: new Date(),
      consecutiveFailures: 0,
    }
    this.queryTimes = []
  }
}

// Export singleton instance
export const dbMonitor = new DatabaseMonitor()

// Periodic health check (only in production)
if (process.env.NODE_ENV !== 'production') {
  setInterval(async () => {
    await dbMonitor.checkConnections()
    await dbMonitor.healthCheck()
  }, 60000) // Every minute
}
