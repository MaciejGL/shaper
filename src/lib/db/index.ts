import { PrismaPg } from '@prisma/adapter-pg'
import { attachDatabasePool } from '@vercel/functions'
import { Pool } from 'pg'

import { PrismaClient } from '@/generated/prisma/client'

import { createDetailedQueryLogger } from '../prisma-query-logger'

import { DATABASE_CONFIG, getSSLConfig, isDevRuntime } from './config'
import {
  getGlobalDB,
  getPoolStats,
  gracefulShutdown,
  setupDevMonitoring,
} from './utils'

/*
 * DATABASE SINGLETON PATTERN
 *
 * This module implements a singleton pattern to prevent multiple database connections
 * across different Next.js contexts (SSR, API routes, build process, etc.).
 *
 * Key features:
 * - Lazy loading: Connections created only when first accessed
 * - Race condition protection: Prevents multiple simultaneous connections
 * - Global caching: Reuses existing connections across module reloads
 * - Backward compatibility: Exports work with existing code
 */

// Get global storage for database instances
const db = getGlobalDB()

/*
 * CORE CONNECTION FUNCTIONS
 */

function createPool(): Pool {
  if (db.poolConnecting) {
    throw new Error('[DB] Pool connection already in progress')
  }

  try {
    if (isDevRuntime) {
      console.info('[DB] Creating new connection pool')
    }

    db.poolConnecting = true

    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: getSSLConfig(),
      max: DATABASE_CONFIG.MAX_CONNECTIONS,
      min: DATABASE_CONFIG.MIN_CONNECTIONS,
      idleTimeoutMillis: DATABASE_CONFIG.IDLE_TIMEOUT,
      connectionTimeoutMillis: DATABASE_CONFIG.CONNECTION_TIMEOUT,
      maxUses: DATABASE_CONFIG.MAX_USES,
      allowExitOnIdle: true,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
    })

    attachDatabasePool(pool)

    // Cache globally to prevent multiple instances
    db.pool = pool
    db.poolConnecting = false

    return pool
  } catch (error) {
    db.poolConnecting = false
    throw error
  }
}

function createClient(): PrismaClient {
  if (db.prismaConnecting) {
    throw new Error('[DB] Prisma client connection already in progress')
  }

  try {
    if (isDevRuntime) {
      console.info('[DB] Creating new Prisma client')
    }

    db.prismaConnecting = true

    // Ensure we have an adapter
    if (!db.adapter) {
      db.adapter = new PrismaPg(getPool())
    }

    const basePrisma = new PrismaClient({
      adapter: db.adapter,
      log: process.env.NODE_ENV === 'development' ? [] : ['error'],
      transactionOptions: {
        timeout: DATABASE_CONFIG.TRANSACTION_TIMEOUT,
        maxWait: DATABASE_CONFIG.MAX_WAIT,
        isolationLevel: 'ReadCommitted',
      },
    })

    const client = basePrisma.$extends(
      createDetailedQueryLogger(),
    ) as PrismaClient

    // Cache globally to prevent multiple instances
    db.prisma = client
    db.prismaConnecting = false

    return client
  } catch (error) {
    db.prismaConnecting = false
    throw error
  }
}

/*
 * PUBLIC API
 */

export function getPool(): Pool {
  return db.pool || (db.pool = createPool())
}

export function getPrisma(): PrismaClient {
  return db.prisma || (db.prisma = createClient())
}

/*
 * LAZY EXPORTS
 * Use Proxy to enable lazy loading while maintaining backward compatibility
 */

export const pool = new Proxy({} as Pool, {
  get(_, prop) {
    return getPool()[prop as keyof Pool]
  },
})

export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    return getPrisma()[prop as keyof PrismaClient]
  },
})

/*
 * RE-EXPORTED UTILITIES
 */
export { gracefulShutdown }

export function getConnectionStats() {
  return getPoolStats(getPool())
}

// Setup development monitoring
setupDevMonitoring(getPool)
