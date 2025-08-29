import { PrismaPg } from '@prisma/adapter-pg'
import { attachDatabasePool } from '@vercel/functions'
import { Pool } from 'pg'

import { PrismaClient } from '@/generated/prisma/client'

import { createDetailedQueryLogger } from './prisma-query-logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  pool: Pool
}

// Detect build-time vs runtime
const isBuildTime =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE === 'phase-production-build'
const isDevRuntime =
  process.env.NODE_ENV === 'development' && !process.env.NEXT_PHASE

const DATABASE_CONFIG = {
  // PRODUCTION SCALE: Optimized for 2,000+ active users
  // Build-time: Use minimal connections since it's temporary
  MAX_CONNECTIONS: isBuildTime
    ? 2
    : parseInt(process.env.DATABASE_MAX_CONNECTIONS || '5'),
  MIN_CONNECTIONS: isBuildTime
    ? 1
    : parseInt(process.env.DATABASE_MIN_CONNECTIONS || '1'),
  IDLE_TIMEOUT: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '30000'), // 30s - less aggressive
  CONNECTION_TIMEOUT: parseInt(
    process.env.DATABASE_CONNECTION_TIMEOUT || '10000', // 10s - more realistic
  ),
  TRANSACTION_TIMEOUT: parseInt(
    process.env.DATABASE_TRANSACTION_TIMEOUT || '30000', // 30s - for complex GraphQL queries
  ),
  MAX_WAIT: parseInt(process.env.DATABASE_MAX_WAIT || '10000'), // 10s - give users time
  MAX_USES: isBuildTime ? 100 : 2000, // Lower reuse during build
} as const

// Create connection pool optimized for Supabase with PgBouncer
const createPool = () => {
  // Detect if using Supabase based on connection string
  const isSupabase = process.env.DATABASE_URL?.includes('supabase.com')

  // Only log during development runtime, not build time
  if (isDevRuntime) {
    console.info('[DB] Creating new connection pool')
  }

  const pool = new Pool({
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

  // Attach the pool to ensure idle connections close before suspension
  attachDatabasePool(pool)

  return pool
}

// Create pool singleton - always cache to prevent multiple connections
const pool = globalForPrisma.pool ?? createPool()
if (!globalForPrisma.pool) {
  globalForPrisma.pool = pool
}

const adapter = new PrismaPg(pool)

// Create Prisma singleton - always cache to prevent multiple clients
const createPrismaClient = () => {
  // Only log during development runtime, not build time
  if (isDevRuntime) {
    console.info('[DB] Creating new Prisma client')
  }

  const basePrisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? [] : ['error'],
    transactionOptions: {
      timeout: DATABASE_CONFIG.TRANSACTION_TIMEOUT,
      maxWait: DATABASE_CONFIG.MAX_WAIT,
      isolationLevel: 'ReadCommitted',
    },
  })

  return basePrisma.$extends(createDetailedQueryLogger())
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

export { pool }

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

// Only enable pool monitoring during development runtime (not build time)
if (isDevRuntime) {
  setInterval(() => {
    const stats = getPoolStats()
    console.info('[DB-POOL]', stats)
  }, 60000)
}
