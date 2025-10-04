import { PrismaPg } from '@prisma/adapter-pg'
import { attachDatabasePool } from '@vercel/functions'
import { Pool } from 'pg'

import { PrismaClient } from '@/generated/prisma/client'
import { createDetailedQueryLogger } from '@/lib/prisma-query-logger'

// Vercel Fluid compute pattern with connection pooling
// attachDatabasePool ensures idle connections close before function suspension

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}

function createPrismaClient(): PrismaClient {
  // Create pool with connection limit - Vercel will manage lifecycle
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 3, // Low per-instance limit for serverless (3 × ~10 instances = ~30 total)
    min: 0, // Allow full closure when idle
    idleTimeoutMillis: 10000, // 10s - close idle connections quickly
    connectionTimeoutMillis: 10000,
  })

  // Attach pool to Vercel Fluid for proper cleanup before suspension
  attachDatabasePool(pool)

  // Store pool globally to prevent recreation
  globalForPrisma.pool = pool

  const adapter = new PrismaPg(pool)

  const basePrisma = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    transactionOptions: {
      maxWait: 10000,
      timeout: 20000,
    },
  })

  // Add query logger extension (only active in development)
  const extendedPrisma = basePrisma.$extends(createDetailedQueryLogger())

  return extendedPrisma as PrismaClient
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export default prisma
