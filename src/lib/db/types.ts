import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

import { PrismaClient } from '@/generated/prisma/client'

/**
 * Global storage interface for database singleton instances
 * This persists connections across Next.js module reloads
 */
export interface DatabaseGlobals {
  pool?: Pool
  adapter?: PrismaPg
  prisma?: PrismaClient
  poolConnecting?: boolean
  prismaConnecting?: boolean
}

/**
 * Connection pool statistics interface
 */
export interface PoolStats {
  total: number
  active: number
  idle: number
  waiting: number
  max: number | undefined
  min: number | undefined
}
