import { PrismaPg } from '@prisma/adapter-pg'
import { attachDatabasePool } from '@vercel/functions'
import { Pool } from 'pg'

import { PrismaClient } from '@/generated/prisma/client'

import { createDetailedQueryLogger } from './prisma-query-logger'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  pool: Pool
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

// Create connection pool optimized for Supabase with PgBouncer
const createPool = () => {
  // Detect if using Supabase based on connection string
  const isSupabase = process.env.DATABASE_URL?.includes('supabase.com')
  console.info('[DB] Creating new connection pool')

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
  console.info('[DB] Creating new Prisma client')

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

if (process.env.NODE_ENV === 'development') {
  setInterval(() => {
    const stats = getPoolStats()
    // if (stats.total > 0) {
    console.info('[DB-POOL]', stats)
    // }
  }, 60000)
}
