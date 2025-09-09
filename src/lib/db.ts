import { PrismaPg } from '@prisma/adapter-pg'
import { attachDatabasePool } from '@vercel/functions'
import { Pool } from 'pg'

import { PrismaClient } from '@/generated/prisma/client'

import { createDetailedQueryLogger } from './prisma-query-logger'

// Simple Vercel Fluid setup - no complex global state management needed
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Basic SSL for production/Supabase
  ssl:
    process.env.NODE_ENV === 'production' ||
    process.env.DATABASE_URL?.includes('supabase.com')
      ? { rejectUnauthorized: false }
      : false,
})

// Attach pool to ensure idle connections close before function suspension
attachDatabasePool(pool)

// Create Prisma client with adapter
const basePrisma = new PrismaClient({
  adapter: new PrismaPg(pool),
  log: process.env.NODE_ENV === 'development' ? [] : ['error'],
})

// Export enhanced Prisma client with query logging
export const prisma = basePrisma.$extends(createDetailedQueryLogger())
