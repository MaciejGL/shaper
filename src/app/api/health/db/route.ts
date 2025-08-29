import { NextResponse } from 'next/server'

import { logConnectionHealth } from '@/lib/db'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Test database connectivity
    await prisma.$queryRaw`SELECT 1`

    // Get connection pool statistics
    const stats = logConnectionHealth()

    // Determine health status
    const utilization = stats.active / stats.max
    const isHealthy = utilization < 0.9 && stats.waiting === 0

    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'degraded',
      database: {
        connected: true,
        pool: {
          active: stats.active,
          idle: stats.idle,
          waiting: stats.waiting,
          total: stats.total,
          max: stats.max,
          min: stats.min,
          utilization: `${(utilization * 100).toFixed(1)}%`,
        },
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[HEALTH-CHECK] Database health check failed:', error)

    return NextResponse.json(
      {
        status: 'unhealthy',
        database: {
          connected: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 },
    )
  }
}
