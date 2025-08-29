import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

import { PrismaClient } from '@/generated/prisma/client'

import { createDetailedQueryLogger } from './prisma-query-logger'

type ExtendedPrismaClient = ReturnType<typeof createExtendedPrismaClient>

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined
  pool: Pool | undefined
}

const DATABASE_CONFIG = {
  // PRODUCTION SCALE: Optimized for 2,000+ active users
  MAX_CONNECTIONS: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '5'), // 5 connections per instance
  MIN_CONNECTIONS: parseInt(process.env.DATABASE_MIN_CONNECTIONS || '1'), // Keep 1 warm connection
  IDLE_TIMEOUT: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'), // 30s - less aggressive
  CONNECTION_TIMEOUT: parseInt(
    process.env.DATABASE_CONNECTION_TIMEOUT || '10000', // 10s - more realistic
  ),
  TRANSACTION_TIMEOUT: parseInt(
    process.env.DATABASE_TRANSACTION_TIMEOUT || '30000', // 30s - for complex GraphQL queries
  ),
  MAX_WAIT: parseInt(process.env.DATABASE_MAX_WAIT || '10000'), // 10s - give users time
  MAX_USES: 2000, // Higher reuse for production scale
} as const

const createPool = () => {
  // Detect if using Supabase based on connection string
  const isSupabase = process.env.DATABASE_URL?.includes('supabase.com')

  // Build connection string with aggressive limits for Vercel
  const connectionString = process.env.DATABASE_URL?.includes(
    'connection_limit',
  )
    ? process.env.DATABASE_URL
    : `${process.env.DATABASE_URL}${process.env.DATABASE_URL?.includes('?') ? '&' : '?'}connection_limit=5&pool_timeout=30&connect_timeout=10`

  return new Pool({
    connectionString,
    ssl:
      process.env.NODE_ENV === 'production' || isSupabase
        ? { rejectUnauthorized: false }
        : false,
    max: DATABASE_CONFIG.MAX_CONNECTIONS,
    min: DATABASE_CONFIG.MIN_CONNECTIONS,
    idleTimeoutMillis: DATABASE_CONFIG.IDLE_TIMEOUT,
    connectionTimeoutMillis: DATABASE_CONFIG.CONNECTION_TIMEOUT,
    maxUses: DATABASE_CONFIG.MAX_USES,
    allowExitOnIdle: true, // Critical for serverless - allows process to exit
    keepAlive: false, // Disable keepAlive for serverless
    // Serverless-optimized settings
    query_timeout: DATABASE_CONFIG.TRANSACTION_TIMEOUT,
    statement_timeout: DATABASE_CONFIG.TRANSACTION_TIMEOUT,
  })
}

function createExtendedPrismaClient(pool: Pool) {
  const adapter = new PrismaPg(pool)
  const basePrisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'production' ? ['error', 'warn'] : [],
    transactionOptions: {
      timeout: DATABASE_CONFIG.TRANSACTION_TIMEOUT,
      maxWait: DATABASE_CONFIG.MAX_WAIT,
      isolationLevel: 'ReadCommitted',
    },
  })
  return basePrisma.$extends(createDetailedQueryLogger())
}

// VERCEL SERVERLESS SINGLETON PATTERN - CRITICAL FOR PREVENTING CONNECTION STORMS
function initializeDatabase() {
  if (!globalForPrisma.pool) {
    console.info('[DB] Creating new connection pool')
    globalForPrisma.pool = createPool()
  }

  if (!globalForPrisma.prisma) {
    console.info('[DB] Creating new Prisma client')
    globalForPrisma.prisma = createExtendedPrismaClient(globalForPrisma.pool)
  }

  return {
    pool: globalForPrisma.pool,
    prisma: globalForPrisma.prisma,
  }
}

// True lazy initialization - only create connections when actually accessed
let _initialized = false

function ensureInitialized() {
  if (!_initialized) {
    initializeDatabase()
    _initialized = true
  }
}

// Export with getters for lazy initialization
export const prisma = new Proxy({} as ExtendedPrismaClient, {
  get(target, prop) {
    ensureInitialized()
    return globalForPrisma.prisma![prop as keyof ExtendedPrismaClient]
  },
})

export const pool = new Proxy({} as Pool, {
  get(target, prop) {
    ensureInitialized()
    return globalForPrisma.pool![prop as keyof Pool]
  },
})

export const getPoolStats = () => ({
  total: pool.totalCount,
  active: pool.totalCount - pool.idleCount,
  idle: pool.idleCount,
  waiting: pool.waitingCount,
  max: pool.options.max ?? 0,
  min: pool.options.min ?? 0,
})

// CRITICAL: Connection monitoring for production scale
export const logConnectionHealth = () => {
  const stats = getPoolStats()
  const utilization =
    stats.max > 0 ? ((stats.active / stats.max) * 100).toFixed(1) : '0'

  // Log every health check in production for 2,000+ users
  console.info(
    `[DB-HEALTH] Connections: ${stats.active}/${stats.max} active (${utilization}% utilization), ${stats.idle} idle, ${stats.waiting} waiting`,
  )

  // Alert at 70% utilization for production scale
  if (stats.max > 0 && stats.active / stats.max > 0.7) {
    console.warn(
      `[DB-WARNING] High connection utilization: ${utilization}% - Scale alert for ${stats.waiting} waiting requests`,
    )
  }

  // CRITICAL: Alert on any waiting connections
  if (stats.waiting > 0) {
    console.error(
      `[DB-CRITICAL] ${stats.waiting} requests waiting for connections - IMMEDIATE scaling required!`,
    )
  }

  return stats
}

// Production monitoring for 2,000+ users - CRITICAL
if (process.env.NODE_ENV === 'production') {
  setInterval(() => {
    const stats = logConnectionHealth()

    // URGENT: Alert conditions for production scale
    if (stats.waiting > 5) {
      console.error(
        `[DB-EMERGENCY] ${stats.waiting} waiting connections - Database overload!`,
      )
    }
    if (stats.active / stats.max > 0.9) {
      console.error(
        `[DB-EMERGENCY] ${((stats.active / stats.max) * 100).toFixed(1)}% utilization - Critical load!`,
      )
    }
  }, 30000) // Check every 30 seconds in production
}

// Development monitoring
if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const stats = getPoolStats()
    console.info('[DB-POOL]', stats)
  }, 60000)
}
