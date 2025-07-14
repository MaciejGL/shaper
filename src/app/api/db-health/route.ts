import { NextRequest, NextResponse } from 'next/server'

import { dbMonitor } from '@/lib/db-monitor'

// GET /api/db-health - Get current database health stats
// GET /api/db-health?detailed=true - Get detailed connection information
export async function GET(request: NextRequest) {
  try {
    // Check if detailed information is requested
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'

    // Get current stats
    const stats = dbMonitor.getStats()

    // Run a quick health check
    const [isHealthy, connectionCount] = await Promise.all([
      dbMonitor.healthCheck(),
      dbMonitor.checkConnections(),
    ])

    // Base response
    const response = {
      healthy: isHealthy,
      timestamp: new Date().toISOString(),
      connections: {
        active: connectionCount,
        warning: connectionCount > 6 ? 'High connection count' : null,
      },
      performance: {
        totalQueries: stats.totalQueries,
        slowQueries: stats.slowQueries,
        averageQueryTime: Math.round(stats.averageQueryTime),
        slowQueryPercentage:
          stats.totalQueries > 0
            ? Math.round((stats.slowQueries / stats.totalQueries) * 100)
            : 0,
      },
      status: {
        lastHealthCheck: stats.lastHealthCheck,
        consecutiveFailures: stats.consecutiveFailures,
        warning:
          stats.consecutiveFailures > 0 ? 'Database failures detected' : null,
      },
    }

    // Add detailed connection information if requested
    if (detailed) {
      const detailedConnections = await dbMonitor.getDetailedConnections()

      if (detailedConnections) {
        return NextResponse.json({
          ...response,
          detailed_connections: {
            total_connections: detailedConnections.total_connections,
            connections_by_application:
              detailedConnections.connections_by_application,
            connections_by_user: detailedConnections.connections_by_user,
            connections_by_state: detailedConnections.connections_by_state,
            active_connections: detailedConnections.active_connections.map(
              (conn) => ({
                pid: conn.pid,
                user: conn.usename,
                application: conn.application_name,
                client_addr: conn.client_addr,
                connection_duration: conn.connection_duration,
                query_duration: conn.query_duration,
                state: conn.state,
                current_query: conn.query
                  ? conn.query.length > 200
                    ? conn.query.substring(0, 200) + '...'
                    : conn.query
                  : null,
              }),
            ),
            idle_connections: detailedConnections.idle_connections.map(
              (conn) => ({
                pid: conn.pid,
                user: conn.usename,
                application: conn.application_name,
                client_addr: conn.client_addr,
                connection_duration: conn.connection_duration,
                state: conn.state,
              }),
            ),
            long_running_queries: detailedConnections.long_running_queries.map(
              (conn) => ({
                pid: conn.pid,
                user: conn.usename,
                application: conn.application_name,
                query_duration: conn.query_duration,
                current_query: conn.query
                  ? conn.query.length > 200
                    ? conn.query.substring(0, 200) + '...'
                    : conn.query
                  : null,
              }),
            ),
          },
        })
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('[DB-HEALTH] Health check error:', error)
    return NextResponse.json(
      {
        healthy: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// POST /api/db-health - Reset monitoring stats
export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json()

    if (action === 'reset') {
      dbMonitor.resetStats()
      return NextResponse.json({
        success: true,
        message: 'Monitoring stats reset',
        timestamp: new Date().toISOString(),
      })
    }

    return NextResponse.json(
      { error: 'Invalid action. Use "reset"' },
      { status: 400 },
    )
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
