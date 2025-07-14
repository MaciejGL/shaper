import { NextRequest, NextResponse } from 'next/server'

import { dbMonitor } from '@/lib/db-monitor'

// GET /api/db-health - Get current database health stats
export async function GET() {
  try {
    // Get current stats
    const stats = dbMonitor.getStats()

    // Run a quick health check
    const [isHealthy, connectionCount] = await Promise.all([
      dbMonitor.healthCheck(),
      dbMonitor.checkConnections(),
    ])

    return NextResponse.json({
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
    })
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
