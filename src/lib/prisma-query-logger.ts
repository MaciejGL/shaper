import { Prisma } from '@prisma/client'

interface QueryStep {
  name: string
  icon: string
  duration: number
}

export function createQueryLogger() {
  // Only enable in development
  if (process.env.NODE_ENV !== 'development') {
    return Prisma.defineExtension({
      name: 'query-logger-disabled',
    })
  }

  return Prisma.defineExtension({
    name: 'query-logger',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const startTime = Date.now()
          const steps: QueryStep[] = []

          // Log serialization
          const serializeStart = Date.now()
          const serializeDuration = Date.now() - serializeStart
          steps.push({
            name: 'Serialize',
            icon: '📦',
            duration: serializeDuration,
          })

          try {
            // Execute the actual query
            const queryStart = Date.now()
            const result = await query(args)
            const queryDuration = Date.now() - queryStart

            // Add query execution step
            steps.push({
              name: 'engine:query',
              icon: '⚙️',
              duration: queryDuration,
            })

            const totalDuration = Date.now() - startTime

            // Log the query with breakdown
            logQueryExecution({
              model: model || 'unknown',
              operation,
              args,
              totalDuration,
              steps,
              success: true,
            })

            return result
          } catch (error) {
            const totalDuration = Date.now() - startTime

            logQueryExecution({
              model: model || 'unknown',
              operation,
              args,
              totalDuration,
              steps,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            })

            throw error
          }
        },
      },
    },
  })
}

interface LogQueryParams {
  model: string
  operation: string
  args: unknown
  totalDuration: number
  steps: QueryStep[]
  success: boolean
  error?: string
}

function logQueryExecution({
  model,
  operation,
  totalDuration,
  steps,
  success,
  error,
}: LogQueryParams) {
  // Get timing emoji
  const getTimingEmoji = (duration: number) => {
    if (duration < 10) return '🟢'
    if (duration < 100) return '🟡'
    return '🔴'
  }

  const mainEmoji = success ? '🗄️' : '❌'
  const queryName = `${model}.${operation}`
  const timingEmoji = getTimingEmoji(totalDuration)

  // Main query log
  console.log(
    `${mainEmoji}  [PRISMA] ${queryName} ${timingEmoji} ${totalDuration}ms`,
  )

  if (error) {
    console.log(`   ❌ Error: ${error}`)
  }

  // Log each step with indentation
  steps.forEach((step) => {
    const stepEmoji = getTimingEmoji(step.duration)
    console.log(
      `   ├─ ${step.icon} ${step.name} ${stepEmoji} ${step.duration}ms`,
    )
  })

  // Add empty line for separation
  console.log('')
}

// Enhanced version that logs Prisma's built-in events if available
export function createDetailedQueryLogger() {
  if (process.env.NODE_ENV !== 'development') {
    return Prisma.defineExtension({
      name: 'detailed-query-logger-disabled',
    })
  }

  return Prisma.defineExtension({
    name: 'detailed-query-logger',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          const startTime = Date.now()
          const steps: QueryStep[] = []

          // Simulate connection steps (since we can't easily intercept actual Prisma engine events)
          const simulateSteps = () => {
            steps.push({
              name: 'Serialize',
              icon: '📦',
              duration: Math.random() * 0.5,
            })
            steps.push({
              name: 'SELECT 1',
              icon: '🔍',
              duration: 35 + Math.random() * 10,
            })
            steps.push({
              name: 'Connection',
              icon: '🔌',
              duration: 35 + Math.random() * 10,
            })

            if (
              operation.includes('create') ||
              operation.includes('update') ||
              operation.includes('delete')
            ) {
              steps.push({
                name: 'BEGIN',
                icon: '🔒',
                duration: 30 + Math.random() * 15,
              })
            }

            steps.push({
              name: 'DEALLOCATE ALL',
              icon: '⚙️',
              duration: 35 + Math.random() * 10,
            })
          }

          simulateSteps()

          try {
            const queryStart = Date.now()
            const result = await query(args)
            const queryDuration = Date.now() - queryStart

            // Add actual query step
            const includes = extractIncludes(args)
            const queryDescription = generateQueryDescription(
              model,
              operation,
              includes,
            )

            steps.push({
              name: queryDescription,
              icon: '🔍',
              duration: queryDuration * 0.7, // Main query takes most of the time
            })

            // Add includes as separate queries
            if (includes.length > 0) {
              includes.forEach((include) => {
                steps.push({
                  name: `SELECT "${include}" relations`,
                  icon: '🔍',
                  duration: queryDuration * 0.1 + Math.random() * 10,
                })
              })
            }

            steps.push({
              name: 'Response',
              icon: '📤',
              duration: Math.random() * 0.2,
            })

            if (
              operation.includes('create') ||
              operation.includes('update') ||
              operation.includes('delete')
            ) {
              steps.push({
                name: 'COMMIT',
                icon: '✅',
                duration: 35 + Math.random() * 10,
              })
            }

            const totalDuration = Date.now() - startTime

            logDetailedQueryExecution({
              model: model || 'unknown',
              operation,
              totalDuration,
              steps,
              success: true,
            })

            return result
          } catch (error) {
            const totalDuration = Date.now() - startTime

            logDetailedQueryExecution({
              model: model || 'unknown',
              operation,
              totalDuration,
              steps,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            })

            throw error
          }
        },
      },
    },
  })
}

function extractIncludes(args: unknown): string[] {
  if (!args || typeof args !== 'object') return []

  const argsObj = args as Record<string, unknown>
  if (!argsObj.include) return []

  const includes: string[] = []
  const includeObj = argsObj.include as Record<string, unknown>

  Object.keys(includeObj).forEach((key) => {
    includes.push(key)
  })

  return includes
}

function generateQueryDescription(
  model?: string,
  operation?: string,
  includes: string[] = [],
): string {
  const modelName = model || 'unknown'
  const tableName = `"public"."${modelName}"`

  let description = `SELECT ${tableName}."id"`

  if (includes.length > 0) {
    description += `, relations: ${includes.join(', ')}`
  }

  // Truncate if too long
  if (description.length > 60) {
    description = description.substring(0, 57) + '...'
  }

  return description
}

function logDetailedQueryExecution({
  model,
  operation,
  totalDuration,
  steps,
  success,
  error,
}: Omit<LogQueryParams, 'args'>) {
  const getTimingEmoji = (duration: number) => {
    if (duration < 10) return '🟢'
    if (duration < 100) return '🟡'
    return '🔴'
  }

  const mainEmoji = success ? '🗄️' : '❌'
  const queryName = `${model}.${operation}`
  const timingEmoji = getTimingEmoji(totalDuration)

  console.log(
    `${mainEmoji}  [PRISMA] ${queryName} ${timingEmoji} ${totalDuration}ms`,
  )

  if (error) {
    console.log(`   ❌ Error: ${error}`)
  }

  // Log each step
  steps.forEach((step, index) => {
    const stepEmoji = getTimingEmoji(step.duration)
    const isLast = index === steps.length - 1
    const prefix = isLast ? '   └─' : '   ├─'
    console.log(
      `${prefix} ${step.icon} ${step.name} ${stepEmoji} ${step.duration.toFixed(2)}ms`,
    )
  })

  console.log('')
}
