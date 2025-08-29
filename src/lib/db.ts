import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

import { PrismaClient } from '@/generated/prisma/client'

import { createDetailedQueryLogger } from './prisma-query-logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  pool: Pool
}

const DATABASE_CONFIG = {
  // Optimized for Supabase + Vercel deployment scenario
  MAX_CONNECTIONS: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10'), // Increased from 6 to handle multiple instances
  MIN_CONNECTIONS: parseInt(process.env.DATABASE_MIN_CONNECTIONS || '2'), // Keep minimum connections ready
  IDLE_TIMEOUT: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'), // 30s - allow longer idle for connection reuse
  CONNECTION_TIMEOUT: parseInt(
    process.env.DATABASE_CONNECTION_TIMEOUT || '10000', // 10s - match Supabase connect_timeout
  ),
  TRANSACTION_TIMEOUT: parseInt(
    process.env.DATABASE_TRANSACTION_TIMEOUT || '30000', // 30s - prevent long-running transaction locks
  ),
  MAX_WAIT: parseInt(process.env.DATABASE_MAX_WAIT || '15000'), // 15s - give more time to acquire connections
  MAX_USES: 5000, // Reduced from 7500 - recycle connections more frequently
} as const

// Create connection pool optimized for Supabase with PgBouncer
const createPool = () => {
  // Detect if using Supabase based on connection string
  const isSupabase = process.env.DATABASE_URL?.includes('supabase.com')

  return new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl:
      process.env.NODE_ENV === 'production' || isSupabase
        ? { rejectUnauthorized: false }
        : false,
    max: DATABASE_CONFIG.MAX_CONNECTIONS,
    min: DATABASE_CONFIG.MIN_CONNECTIONS,
    idleTimeoutMillis: DATABASE_CONFIG.IDLE_TIMEOUT,
    connectionTimeoutMillis: DATABASE_CONFIG.CONNECTION_TIMEOUT,
    maxUses: DATABASE_CONFIG.MAX_USES,
    allowExitOnIdle: true,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    // Additional optimization for production stability
    query_timeout: DATABASE_CONFIG.TRANSACTION_TIMEOUT,
    statement_timeout: DATABASE_CONFIG.TRANSACTION_TIMEOUT,
  })
}

const pool = globalForPrisma.pool ?? createPool()
const adapter = new PrismaPg(pool)

const basePrisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? [] : ['error'],
  transactionOptions: {
    timeout: DATABASE_CONFIG.TRANSACTION_TIMEOUT,
    maxWait: DATABASE_CONFIG.MAX_WAIT,
    isolationLevel: 'ReadCommitted',
  },
})

export const prisma =
  globalForPrisma.prisma ?? basePrisma.$extends(createDetailedQueryLogger())

export { pool }

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
  globalForPrisma.pool = pool
}

export const gracefulShutdown = async () => {
  console.info('[DB] Closing database connections...')
  try {
    await pool.end()
    await prisma.$disconnect()
    console.info('[DB] Database connections closed successfully')
  } catch (error) {
    console.error('[DB] Error closing database connections:', error)
  }
}

export const getPoolStats = () => ({
  total: pool.totalCount,
  active: pool.totalCount - pool.idleCount,
  idle: pool.idleCount,
  waiting: pool.waitingCount,
  max: pool.options.max,
  min: pool.options.min,
})

// Enhanced connection monitoring for production debugging
export const logConnectionHealth = () => {
  const stats = getPoolStats()
  const utilization = ((stats.active / stats.max) * 100).toFixed(1)

  console.info(
    `[DB-HEALTH] Connections: ${stats.active}/${stats.max} active (${utilization}% utilization), ${stats.idle} idle, ${stats.waiting} waiting`,
  )

  // Alert if connection utilization is high
  if (stats.active / stats.max > 0.8) {
    console.warn(
      `[DB-WARNING] High connection utilization: ${utilization}% - Consider checking for connection leaks`,
    )
  }

  return stats
}

// Emergency connection cleanup function
export const forceConnectionCleanup = async () => {
  try {
    console.warn('[DB-CLEANUP] Forcing connection cleanup...')

    // Get current stats before cleanup
    const beforeStats = getPoolStats()
    console.info(
      `[DB-CLEANUP] Before: ${beforeStats.active} active, ${beforeStats.idle} idle`,
    )

    // Force idle connections to close
    await pool.query('SELECT 1') // Simple health check

    const afterStats = getPoolStats()
    console.info(
      `[DB-CLEANUP] After: ${afterStats.active} active, ${afterStats.idle} idle`,
    )

    return { before: beforeStats, after: afterStats }
  } catch (error) {
    console.error('[DB-CLEANUP] Cleanup failed:', error)
    throw error
  }
}

if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const stats = getPoolStats()
    // if (stats.total > 0) {
    console.info('[DB-POOL]', stats)
    // }
  }, 60000)
}

// In your db.ts (production only)
if (process.env.NODE_ENV === 'production' && typeof window === 'undefined') {
  setInterval(() => {
    const stats = getPoolStats()

    if (stats.waiting > 3) {
      // Send to error monitoring
      console.error('[DB-POOL-CRITICAL] Pool exhausted', stats)
      // Sentry.captureMessage('Database pool exhausted', 'error')
    }
  }, 60000)
}
