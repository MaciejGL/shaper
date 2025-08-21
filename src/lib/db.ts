// lib/prisma.ts
import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '@/generated/prisma/client'

import { createDetailedQueryLogger } from './prisma-query-logger'

// import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  //   & { $extends: typeof withAccelerate }
}

// Create adapter for the new Rust-free architecture
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === 'production'
      ? { rejectUnauthorized: false }
      : false,
})

const basePrisma = new PrismaClient({
  adapter,
  log:
    process.env.NODE_ENV === 'development'
      ? [] // Disable default logs to avoid duplicate output
      : ['error'],
  // Add connection timeout configuration
  transactionOptions: {
    timeout: 5000, // 5 second timeout for transactions
    maxWait: 5000, // 5 second max wait for connection
  },
})

export const prisma =
  globalForPrisma.prisma ?? basePrisma.$extends(createDetailedQueryLogger())
//   .$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
