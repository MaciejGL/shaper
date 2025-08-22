import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

import { PrismaClient } from '@/generated/prisma/client'

import { createDetailedQueryLogger } from './prisma-query-logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  pool: Pool
}

const DATABASE_CONFIG = {
  MAX_CONNECTIONS: parseInt(process.env.DATABASE_MAX_CONNECTIONS || '6'),
  MIN_CONNECTIONS: parseInt(process.env.DATABASE_MIN_CONNECTIONS || '1'),
  IDLE_TIMEOUT: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '15000'),
  CONNECTION_TIMEOUT: parseInt(
    process.env.DATABASE_CONNECTION_TIMEOUT || '8000',
  ),
  TRANSACTION_TIMEOUT: parseInt(
    process.env.DATABASE_TRANSACTION_TIMEOUT || '15000',
  ),
  MAX_WAIT: parseInt(process.env.DATABASE_MAX_WAIT || '8000'),
  MAX_USES: 7500,
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

if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const stats = getPoolStats()
    // if (stats.total > 0) {
    console.info('[DB-POOL]', stats)
    // }
  }, 5000)
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
