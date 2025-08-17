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

// Safe transaction wrapper with reduced timeouts and better error handling
type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export async function safeTransaction<T>(
  operation: (tx: TransactionClient) => Promise<T>,
  options: {
    timeout?: number
    maxWait?: number
    operationName?: string
  } = {},
): Promise<T> {
  const { timeout = 5000, maxWait = 5000, operationName = 'unknown' } = options

  const startTime = Date.now()

  try {
    console.info(`[SAFE-TX] Starting ${operationName} (timeout: ${timeout}ms)`)

    const result = await prisma.$transaction(operation, {
      timeout,
      maxWait,
    })

    const duration = Date.now() - startTime
    console.info(`[SAFE-TX] Completed ${operationName} in ${duration}ms`)

    return result
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      `[SAFE-TX] Failed ${operationName} after ${duration}ms:`,
      error,
    )

    // Log specific error types
    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        console.error(
          `[SAFE-TX] TIMEOUT in ${operationName} - consider breaking into smaller operations`,
        )
      }
      if (error.message.includes('deadlock')) {
        console.error(
          `[SAFE-TX] DEADLOCK in ${operationName} - will be retried automatically`,
        )
      }
    }

    throw error
  }
}
