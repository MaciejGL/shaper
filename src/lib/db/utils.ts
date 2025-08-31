import { Pool } from 'pg'

import { isDevRuntime } from './config'
import type { DatabaseGlobals, PoolStats } from './types'

/**
 * Get global database storage
 */
export function getGlobalDB(): DatabaseGlobals {
  return globalThis as unknown as DatabaseGlobals
}

/**
 * Gracefully close all database connections
 */
export async function gracefulShutdown(): Promise<void> {
  console.info('[DB] Closing database connections...')
  const db = getGlobalDB()

  try {
    if (db.pool) await db.pool.end()
    if (db.prisma) await db.prisma.$disconnect()
    console.info('[DB] Database connections closed successfully')
  } catch (error) {
    console.error('[DB] Error closing database connections:', error)
  }
}

/**
 * Get current connection pool statistics
 */
export function getPoolStats(pool: Pool): PoolStats {
  return {
    total: pool.totalCount,
    active: pool.totalCount - pool.idleCount,
    idle: pool.idleCount,
    waiting: pool.waitingCount,
    max: pool.options.max,
    min: pool.options.min,
  }
}

/**
 * Setup development monitoring for connection pool
 */
export function setupDevMonitoring(getPool: () => Pool): void {
  if (isDevRuntime) {
    setInterval(() => {
      const stats = getPoolStats(getPool())
      console.info('[DB-POOL]', stats)
    }, 60000)
  }
}
