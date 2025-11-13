import { PrismaPg } from '@prisma/adapter-pg'
import { attachDatabasePool } from '@vercel/functions'
import { Pool } from 'pg'

import { PrismaClient } from '@/generated/prisma/client'

import { createDetailedQueryLogger } from './prisma-query-logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  pool: Pool
  adapter: PrismaPg
  poolConnecting: boolean
  prismaConnecting: boolean
}

// Detect build-time vs runtime
const isBuildTime =
  process.env.NODE_ENV === 'production' &&
  process.env.NEXT_PHASE === 'phase-production-build'
const isDevRuntime =
  process.env.NODE_ENV === 'development' && !process.env.NEXT_PHASE

const DATABASE_CONFIG = {
  // SERVERLESS-OPTIMIZED: Lower connections per instance to prevent pooler exhaustion
  // With multiple serverless instances (5-10 concurrent), total connections = instances × MAX_CONNECTIONS
  // Build-time: Use minimal connections since it's temporary
  MAX_CONNECTIONS: isBuildTime
    ? 2
    : parseInt(process.env.DATABASE_MAX_CONNECTIONS || '10'),
  MIN_CONNECTIONS: isBuildTime
    ? 1
    : parseInt(process.env.DATABASE_MIN_CONNECTIONS || '0'), // Changed from 1 to 0 to allow full idle closure
  IDLE_TIMEOUT: parseInt(process.env.DATABASE_IDLE_TIMEOUT || '10000'), // Reduced from 30s to 10s for faster cleanup
  CONNECTION_TIMEOUT: parseInt(
    process.env.DATABASE_CONNECTION_TIMEOUT || '10000', // 10s - more realistic
  ),
  TRANSACTION_TIMEOUT: parseInt(
    process.env.DATABASE_TRANSACTION_TIMEOUT || '30000', // 30s - for complex GraphQL queries
  ),
  MAX_WAIT: parseInt(process.env.DATABASE_MAX_WAIT || '10000'), // 10s - give users time
  MAX_USES: isBuildTime ? 100 : 7500, // Increased from 2000 - reuse connections more aggressively
} as const

// Create connection pool optimized for Supabase with PgBouncer
function getConnectionPool(): Pool {
  // Return existing pool if available
  if (globalForPrisma.pool) {
    return globalForPrisma.pool
  }

  // Prevent multiple pools during initial setup
  if (globalForPrisma.poolConnecting) {
    // If already connecting, wait for the existing one to be available
    // In practice, this shouldn't happen often due to synchronous module loading
    // but it's a safety measure
    throw new Error('[DB] Pool connection already in progress, please retry')
  }

  try {
    // Only log during development runtime, not build time
    if (isDevRuntime) {
      console.info('[DB] Creating new connection pool')
    }

    globalForPrisma.poolConnecting = true

    // Detect if using Supabase based on connection string
    const isSupabase = process.env.DATABASE_URL?.includes('supabase.com')

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
      allowExitOnIdle: true, // Critical for serverless - allows process to exit when idle
      keepAlive: false, // Disabled for serverless - we want connections to close quickly
    })

    // Attach the pool to ensure idle connections close before suspension
    attachDatabasePool(pool)

    // Store in global immediately to prevent race conditions
    globalForPrisma.pool = pool
    globalForPrisma.poolConnecting = false

    return pool
  } catch (error) {
    globalForPrisma.poolConnecting = false
    throw error
  }
}

// Lazy getters to prevent immediate instantiation on module load
function getPool(): Pool {
  if (!globalForPrisma.pool) {
    globalForPrisma.pool = getConnectionPool()
  }
  return globalForPrisma.pool
}

function getAdapter(): PrismaPg {
  if (!globalForPrisma.adapter) {
    globalForPrisma.adapter = new PrismaPg(getPool())
  }
  return globalForPrisma.adapter
}

// Create Prisma client singleton
function getPrismaClient(): PrismaClient {
  // Return existing client if available
  if (globalForPrisma.prisma) {
    return globalForPrisma.prisma
  }

  // Prevent multiple clients during initial setup
  if (globalForPrisma.prismaConnecting) {
    // If already connecting, wait for the existing one to be available
    throw new Error(
      '[DB] Prisma client connection already in progress, please retry',
    )
  }

  try {
    // Only log during development runtime, not build time
    if (isDevRuntime) {
      console.info('[DB] Creating new Prisma client')
    }

    globalForPrisma.prismaConnecting = true

    const adapter = getAdapter()
    const basePrisma = new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === 'development' ? [] : ['error'],
      transactionOptions: {
        timeout: DATABASE_CONFIG.TRANSACTION_TIMEOUT,
        maxWait: DATABASE_CONFIG.MAX_WAIT,
        isolationLevel: 'ReadCommitted',
      },
    })

    const extendedPrisma = basePrisma.$extends(createDetailedQueryLogger())

    // Store in global immediately to prevent race conditions
    globalForPrisma.prisma = extendedPrisma as PrismaClient
    globalForPrisma.prismaConnecting = false

    return extendedPrisma as PrismaClient
  } catch (error) {
    globalForPrisma.prismaConnecting = false
    throw error
  }
}

// Export lazy Prisma client getter
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrismaClient()
    return client[prop as keyof PrismaClient]
  },
})

// Export lazy pool getter
export const pool = new Proxy({} as Pool, {
  get(_, prop) {
    const poolInstance = getPool()
    return poolInstance[prop as keyof Pool]
  },
})

export const gracefulShutdown = async () => {
  console.info('[DB] Closing database connections...')
  try {
    const poolInstance = getPool()
    const client = getPrismaClient()
    await poolInstance.end()
    await client.$disconnect()
    console.info('[DB] Database connections closed successfully')
  } catch (error) {
    console.error('[DB] Error closing database connections:', error)
  }
}

export const getPoolStats = () => {
  const poolInstance = getPool()
  return {
    total: poolInstance.totalCount,
    active: poolInstance.totalCount - poolInstance.idleCount,
    idle: poolInstance.idleCount,
    waiting: poolInstance.waitingCount,
    max: poolInstance.options.max,
    min: poolInstance.options.min,
  }
}

// Only enable pool monitoring during development runtime (not build time)
if (isDevRuntime) {
  setInterval(() => {
    const stats = getPoolStats()
    console.info('[DB-POOL]', stats)
  }, 60000)
}
