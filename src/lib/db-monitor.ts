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

// Detailed connection information
interface ConnectionInfo {
  pid: number
  usename: string
  application_name: string
  client_addr: string | null
  client_hostname: string | null
  client_port: number | null
  backend_start: Date
  query_start: Date | null
  state_change: Date | null
  state: string
  query: string | null
  wait_event_type: string | null
  wait_event: string | null
  backend_type: string
  connection_duration: string
  query_duration: string | null
}

interface DetailedConnectionStats {
  total_connections: number
  connections_by_application: Record<string, number>
  connections_by_user: Record<string, number>
  connections_by_state: Record<string, number>
  long_running_queries: ConnectionInfo[]
  idle_connections: ConnectionInfo[]
  active_connections: ConnectionInfo[]
  all_connections: ConnectionInfo[]
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

  // Get current connection count (original method)
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

  // NEW: Get detailed connection information
  async getDetailedConnections(): Promise<DetailedConnectionStats | null> {
    try {
      const result = await prisma.$queryRaw<any[]>`
        SELECT 
          pid,
          usename,
          application_name,
          client_addr,
          client_hostname,
          client_port,
          backend_start,
          query_start,
          state_change,
          state,
          query,
          wait_event_type,
          wait_event,
          backend_type,
          -- Calculate connection duration
          EXTRACT(EPOCH FROM (now() - backend_start))::int as connection_duration_seconds,
          -- Calculate query duration (if query is active)
          CASE 
            WHEN query_start IS NOT NULL THEN 
              EXTRACT(EPOCH FROM (now() - query_start))::int
            ELSE NULL
          END as query_duration_seconds
        FROM pg_stat_activity
        WHERE datname = current_database()
          AND pid != pg_backend_pid()  -- Exclude this monitoring query itself
        ORDER BY backend_start DESC
      `

      // Transform raw data into structured format
      const connections: ConnectionInfo[] = result.map((row) => ({
        pid: row.pid,
        usename: row.usename || 'unknown',
        application_name: row.application_name || 'unknown',
        client_addr: row.client_addr,
        client_hostname: row.client_hostname,
        client_port: row.client_port,
        backend_start: new Date(row.backend_start),
        query_start: row.query_start ? new Date(row.query_start) : null,
        state_change: row.state_change ? new Date(row.state_change) : null,
        state: row.state || 'unknown',
        query: row.query,
        wait_event_type: row.wait_event_type,
        wait_event: row.wait_event,
        backend_type: row.backend_type || 'unknown',
        connection_duration: this.formatDuration(
          row.connection_duration_seconds,
        ),
        query_duration: row.query_duration_seconds
          ? this.formatDuration(row.query_duration_seconds)
          : null,
      }))

      // Aggregate statistics
      const stats: DetailedConnectionStats = {
        total_connections: connections.length,
        connections_by_application: {},
        connections_by_user: {},
        connections_by_state: {},
        long_running_queries: [],
        idle_connections: [],
        active_connections: [],
        all_connections: connections,
      }

      // Group by various dimensions
      connections.forEach((conn) => {
        // By application
        stats.connections_by_application[conn.application_name] =
          (stats.connections_by_application[conn.application_name] || 0) + 1

        // By user
        stats.connections_by_user[conn.usename] =
          (stats.connections_by_user[conn.usename] || 0) + 1

        // By state
        stats.connections_by_state[conn.state] =
          (stats.connections_by_state[conn.state] || 0) + 1

        // Categorize connections
        if (conn.state === 'active') {
          stats.active_connections.push(conn)
        } else if (conn.state === 'idle') {
          stats.idle_connections.push(conn)
        }

        // Long-running queries (>30 seconds)
        if (
          (conn.query_duration && conn.query_duration.includes('m')) ||
          (conn.query_duration && parseInt(conn.query_duration) > 30)
        ) {
          stats.long_running_queries.push(conn)
        }
      })

      return stats
    } catch (error) {
      console.error('[DB-MONITOR] Failed to get detailed connections:', error)
      return null
    }
  }

  // NEW: Format duration in human-readable format
  private formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`
    } else if (seconds < 3600) {
      return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
    } else {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours}h ${minutes}m`
    }
  }

  // NEW: Log detailed connection summary
  async logConnectionSummary(): Promise<void> {
    const details = await this.getDetailedConnections()
    if (!details) return

    console.log('\n=== DATABASE CONNECTION SUMMARY ===')
    console.log(`Total Connections: ${details.total_connections}`)

    console.log('\n📱 By Application:')
    Object.entries(details.connections_by_application)
      .sort(([, a], [, b]) => b - a)
      .forEach(([app, count]) => {
        console.log(`  ${app}: ${count}`)
      })

    console.log('\n👤 By User:')
    Object.entries(details.connections_by_user)
      .sort(([, a], [, b]) => b - a)
      .forEach(([user, count]) => {
        console.log(`  ${user}: ${count}`)
      })

    console.log('\n🔄 By State:')
    Object.entries(details.connections_by_state)
      .sort(([, a], [, b]) => b - a)
      .forEach(([state, count]) => {
        console.log(`  ${state}: ${count}`)
      })

    if (details.active_connections.length > 0) {
      console.log('\n⚡ Active Connections:')
      details.active_connections.forEach((conn) => {
        console.log(
          `  PID ${conn.pid}: ${conn.application_name} (${conn.usename}) - ${conn.connection_duration}`,
        )
        if (conn.query) {
          const shortQuery =
            conn.query.length > 100
              ? conn.query.substring(0, 100) + '...'
              : conn.query
          console.log(`    Query: ${shortQuery}`)
        }
      })
    }

    if (details.long_running_queries.length > 0) {
      console.log('\n🐌 Long-Running Queries:')
      details.long_running_queries.forEach((conn) => {
        console.log(
          `  PID ${conn.pid}: ${conn.application_name} - Running for ${conn.query_duration}`,
        )
        if (conn.query) {
          const shortQuery =
            conn.query.length > 100
              ? conn.query.substring(0, 100) + '...'
              : conn.query
          console.log(`    Query: ${shortQuery}`)
        }
      })
    }

    console.log('===================================\n')
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

  // Get basic stats
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

// Periodic health check with detailed logging every 5 minutes
setInterval(async () => {
  await dbMonitor.checkConnections()
  await dbMonitor.healthCheck()
}, 60000) // Every minute

// Detailed connection logging every 5 minutes
setInterval(
  async () => {
    await dbMonitor.logConnectionSummary()
  },
  5 * 60 * 1000,
) // Every 5 minutes
