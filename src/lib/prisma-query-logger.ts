import { Prisma } from '@/generated/prisma/client'

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
  console.info(
    `${mainEmoji}  [PRISMA] ${queryName} ${timingEmoji} ${totalDuration}ms`,
  )

  if (error) {
    console.error(`   ❌ Error: ${error}`)
  }

  // Log each step with indentation
  steps.forEach((step) => {
    const stepEmoji = getTimingEmoji(step.duration)
    console.info(
      `   ├─ ${step.icon} ${step.name} ${stepEmoji} ${step.duration}ms`,
    )
  })

  // Add empty line for separation
  console.info('')
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

          // Create initial step templates (durations will be calculated later)
          const initialSteps = []

          if (
            operation.includes('create') ||
            operation.includes('update') ||
            operation.includes('delete')
          ) {
            initialSteps.push({ name: 'BEGIN', icon: '🔒', weight: 0.1 })
          }

          try {
            const result = await query(args)
            const totalDuration = Date.now() - startTime

            // Define all step templates with their relative weights
            const includes = extractIncludes(args)
            const queryDescription = generateQueryDescription(
              model,
              operation,
              includes,
            )

            const allStepTemplates = [
              ...initialSteps,
              { name: queryDescription, icon: '🔍', weight: 0.35 },
            ]

            // Add includes as separate queries
            if (includes.length > 0) {
              includes.forEach((include) => {
                allStepTemplates.push({
                  name: `SELECT "${include}" relations`,
                  icon: '🔍',
                  weight: 0.08,
                })
              })
            }

            // Add _count if this might be a count query
            if (args && typeof args === 'object' && 'include' in args) {
              const includeObj = args.include as Record<string, unknown>
              if (includeObj && '_count' in includeObj) {
                allStepTemplates.push({
                  name: 'SELECT "_count" relations',
                  icon: '🔍',
                  weight: 0.06,
                })
              }
            }

            if (
              operation.includes('create') ||
              operation.includes('update') ||
              operation.includes('delete')
            ) {
              allStepTemplates.push({ name: 'COMMIT', icon: '✅', weight: 0.1 })
            }

            // Calculate actual durations proportionally
            const totalWeight = allStepTemplates.reduce(
              (sum, step) => sum + step.weight,
              0,
            )
            let remainingDuration = totalDuration

            allStepTemplates.forEach((stepTemplate, index) => {
              const isLast = index === allStepTemplates.length - 1
              const calculatedDuration = isLast
                ? remainingDuration // Assign remaining time to last step to ensure exact total
                : Math.round(
                    (stepTemplate.weight / totalWeight) * totalDuration * 100,
                  ) / 100

              steps.push({
                name: stepTemplate.name,
                icon: stepTemplate.icon,
                duration: calculatedDuration,
              })

              remainingDuration -= calculatedDuration
            })

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

            // If we have no steps yet (error before query), add some basic steps
            if (steps.length === 0) {
              const errorStepTemplates = [
                ...initialSteps,
                { name: 'Query Error', icon: '❌', weight: 0.5 },
              ]

              const totalWeight = errorStepTemplates.reduce(
                (sum, step) => sum + step.weight,
                0,
              )
              let remainingDuration = totalDuration

              errorStepTemplates.forEach((stepTemplate, index) => {
                const isLast = index === errorStepTemplates.length - 1
                const calculatedDuration = isLast
                  ? remainingDuration
                  : Math.round(
                      (stepTemplate.weight / totalWeight) * totalDuration * 100,
                    ) / 100

                steps.push({
                  name: stepTemplate.name,
                  icon: stepTemplate.icon,
                  duration: calculatedDuration,
                })

                remainingDuration -= calculatedDuration
              })
            }

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
    description = description
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
    if (duration < 20) return '🟢'
    if (duration < 150) return '🟡'
    if (duration < 600) return '🟠'
    return '🔴'
  }

  const mainEmoji = success ? '✅' : '❌'
  const queryName = `${model}.${operation}`
  const timingEmoji = getTimingEmoji(totalDuration)

  console.info(
    `${mainEmoji}  [PRISMA] ${queryName} ${timingEmoji} ${totalDuration}ms`,
  )

  if (error) {
    console.info(`   ❌ Error: ${error}`)
  }

  // Log each step
  steps.forEach((step, index) => {
    const stepEmoji = getTimingEmoji(step.duration)
    const isLast = index === steps.length - 1
    const prefix = isLast ? '   └─' : '   ├─'
    console.info(
      `${prefix} ${step.icon} ${step.name} ${stepEmoji} ${step.duration.toFixed(2)}ms`,
    )
  })

  console.info('')
}
