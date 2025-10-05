import { prisma } from '@/lib/db'

// Simplified monitoring stats - focus on alerts only
interface MonitoringStats {
  activeConnections: number
  totalQueries: number
  slowQueries: number
  lastHealthCheck: Date
  consecutiveFailures: number
}

// Simplified problematic query detection
interface ProblematicQuery {
  pid: number
  query: string
  duration_minutes: number
  application_name: string
}

class DatabaseMonitor {
  private stats: MonitoringStats = {
    activeConnections: 0,
    totalQueries: 0,
    slowQueries: 0,
    lastHealthCheck: new Date(),
    consecutiveFailures: 0,
  }

  private readonly SLOW_QUERY_THRESHOLD = 10000 // 10 seconds (increased for 20s+ transactions)
  private readonly POOL_SIZE_ALERT_THRESHOLD = 25 // Alert when connections exceed Supavisor pool size

  // Simplified query tracking - focus on genuinely problematic queries
  trackQuery(executionTime: number, queryType?: string) {
    this.stats.totalQueries++

    // Only alert for truly slow queries (10s+, accounting for legitimate 20s+ transactions)
    if (executionTime > this.SLOW_QUERY_THRESHOLD) {
      this.stats.slowQueries++
      console.warn(
        `[DB-ALERT] Slow query: ${executionTime}ms${queryType ? ` (${queryType})` : ''} - Check if this is expected`,
      )
    }

    // Alert for queries that are likely problematic (not business logic)
    if (
      executionTime > 30000 && // 30+ seconds
      queryType &&
      (queryType.includes('COMMIT') ||
        queryType.includes('BEGIN') ||
        queryType.includes('SELECT 1'))
    ) {
      console.error(
        `[DB-ALERT] SUSPICIOUS QUERY: ${executionTime}ms - ${queryType} - This shouldn't take this long!`,
      )
    }
  }

  // Simplified connection check - only alert for genuine problems
  async checkConnections(): Promise<number> {
    try {
      const result = await prisma.$queryRaw<[{ count: bigint }]>`
        SELECT COUNT(*) as count FROM pg_stat_activity
        WHERE datname = current_database()
      `
      const count = Number(result[0].count)
      this.stats.activeConnections = count

      // Only alert when connections significantly exceed pool size (indicates real problems)
      if (count > this.POOL_SIZE_ALERT_THRESHOLD) {
        console.error(
          `[DB-ALERT] CRITICAL: ${count} connections exceed pool size! Check Supabase dashboard immediately.`,
        )
        // Get quick overview of what's using connections
        await this.alertProblematicQueries()
      }

      return count
    } catch (error) {
      console.error('[DB-ALERT] Failed to check connections:', error)
      this.stats.consecutiveFailures++
      return -1
    }
  }

  // Alert for truly problematic queries (don't terminate - let Supavisor handle)
  async alertProblematicQueries(): Promise<void> {
    try {
      // Find genuinely problematic queries (not legitimate long-running business operations)
      const problematicQueries = await prisma.$queryRaw<ProblematicQuery[]>`
        SELECT 
          pid,
          SUBSTRING(query, 1, 150) as query,
          ROUND(EXTRACT(EPOCH FROM (NOW() - query_start))/60, 2) as duration_minutes,
          application_name
        FROM pg_stat_activity 
        WHERE datname = current_database()
          AND pid <> pg_backend_pid()
          AND state IN ('idle in transaction', 'active')
          AND query_start < NOW() - INTERVAL '5 minutes'
          AND application_name NOT IN ('postgrest', 'pg_cron scheduler', 'pg_net 0.14.0')
          AND query NOT LIKE 'LISTEN%'
          AND query != '<IDLE>'
          AND (
            -- Suspicious patterns: simple queries taking too long
            (LOWER(query) LIKE '%commit%' AND query_start < NOW() - INTERVAL '1 minute') OR
            (LOWER(query) LIKE '%begin%' AND query_start < NOW() - INTERVAL '1 minute') OR
            (LOWER(query) LIKE 'select 1%' AND query_start < NOW() - INTERVAL '1 minute') OR
            -- Any transaction idle too long
            (state = 'idle in transaction' AND state_change < NOW() - INTERVAL '2 minutes')
          )
        ORDER BY duration_minutes DESC
        LIMIT 10
      `

      if (problematicQueries.length > 0) {
        console.error(
          `[DB-ALERT] ${problematicQueries.length} problematic queries detected:`,
        )
        problematicQueries.forEach((query) => {
          console.error(
            `  PID ${query.pid} (${query.application_name}): ${query.duration_minutes}m - ${query.query}`,
          )
        })
        console.error(
          '[DB-ALERT] Consider checking Supabase dashboard for connection pool status',
        )
      }
    } catch (error) {
      console.error('[DB-ALERT] Failed to check problematic queries:', error)
    }
  }

  // Keep deadlock detection - this is still important
  async checkDeadlocks(): Promise<void> {
    try {
      const deadlocks = await prisma.$queryRaw<
        {
          blocked_pid: number
          blocking_pid: number
          blocked_query: string
          blocking_query: string
        }[]
      >`
        SELECT 
          w.pid as blocked_pid,
          l.pid as blocking_pid,
          SUBSTRING(w.query, 1, 100) as blocked_query,
          SUBSTRING(l.query, 1, 100) as blocking_query
        FROM pg_stat_activity w
        JOIN pg_locks wl ON w.pid = wl.pid
        JOIN pg_locks ll ON wl.locktype = ll.locktype 
          AND wl.database = ll.database 
          AND wl.relation = ll.relation
        JOIN pg_stat_activity l ON ll.pid = l.pid
        WHERE w.datname = current_database()
          AND l.datname = current_database()
          AND wl.granted = false
          AND ll.granted = true
          AND w.pid != l.pid
      `

      if (deadlocks.length > 0) {
        console.error(
          `[DB-ALERT] DEADLOCK DETECTED: ${deadlocks.length} deadlocks found!`,
        )

        for (const deadlock of deadlocks) {
          console.error(
            `[DEADLOCK] PID ${deadlock.blocked_pid} blocked by PID ${deadlock.blocking_pid}`,
          )
          console.error(`  Blocked: ${deadlock.blocked_query}`)
          console.error(`  Blocking: ${deadlock.blocking_query}`)
        }
      }
    } catch (error) {
      console.error('[DB-ALERT] Failed to check deadlocks:', error)
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
      console.error('[DB-ALERT] Health check failed:', error)
      this.stats.consecutiveFailures++

      // Alert on consecutive failures
      if (this.stats.consecutiveFailures >= 3) {
        console.error(
          `[DB-ALERT] CRITICAL: ${this.stats.consecutiveFailures} consecutive health check failures!`,
        )
      }

      return false
    }
  }

  // Get basic stats
  getStats(): MonitoringStats {
    return { ...this.stats }
  }

  // Simplified emergency check - only run manually when needed
  async emergencyCheck(): Promise<void> {
    console.warn('[DB-ALERT] Emergency database check initiated')

    const connectionCount = await this.checkConnections()
    await this.checkDeadlocks()
    await this.alertProblematicQueries()

    console.warn(
      `[DB-ALERT] Emergency check complete. Connection count: ${connectionCount}`,
    )
    console.warn(
      '[DB-ALERT] If issues persist, check Supabase dashboard connection pool status',
    )
  }
}

// Export singleton instance
export const dbMonitor = new DatabaseMonitor()

// ONLY run monitoring intervals in development
// Production serverless environments should not have long-running intervals
if (process.env.NODE_ENV === 'development') {
  // Minimal monitoring - let Supavisor handle connection management
  // Only check for genuine database problems every 15 minutes
  setInterval(
    async () => {
      const isHealthy = await dbMonitor.healthCheck()

      // Only check connections if health check fails or periodically
      if (!isHealthy || Math.random() < 0.25) {
        // 25% chance = every ~1 hour on average
        await dbMonitor.checkConnections()
      }
    },
    15 * 60 * 1000, // Every 15 minutes - dramatically reduced frequency
  )

  // Check for deadlocks occasionally (these are serious and Supavisor can't prevent them)
  setInterval(
    async () => {
      await dbMonitor.checkDeadlocks()
    },
    30 * 60 * 1000, // Every 30 minutes
  )

  console.info('[DB-MONITOR] Development monitoring intervals started')
}
