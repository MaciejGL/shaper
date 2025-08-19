// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// import { withAccelerate } from '@prisma/extension-accelerate'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
  //   & { $extends: typeof withAccelerate }
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
        // Connection pooling is configured via DATABASE_URL parameters:
        // ?connection_limit=5&pool_timeout=20
      },
    },
    log:
      process.env.NODE_ENV === 'development'
        ? ['info', 'warn', 'error']
        : ['error'],
    // Add connection timeout configuration
    transactionOptions: {
      timeout: 5000, // 5 second timeout for transactions
      maxWait: 5000, // 5 second max wait for connection
    },
  })
//   .$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
