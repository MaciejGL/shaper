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
  })
//   .$extends(withAccelerate())

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
