import { createYoga } from 'graphql-yoga'
import { NextRequest, NextResponse } from 'next/server'

import { dbMonitor } from '@/lib/db-monitor'
import { getCurrentUser } from '@/lib/getUser'

import { createContext } from './create-context'
import { createSchema } from './schema'

const schema = await createSchema()

// Note: In App Router, body parsing is handled by GraphQL Yoga directly.
// No need for bodyParser config like in Pages Router.
const yoga = createYoga<{
  req: NextRequest
}>({
  schema,
  logging: 'info',
  graphqlEndpoint: '/api/graphql',
  graphiql: process.env.NODE_ENV !== 'production',
  cors: {
    origin: ['https://hypro.app', 'https://www.hypro.app'],
    credentials: true,
  },
  context: async () => createContext(),
  fetchAPI: { Request, Response, Headers },
})

async function requireAuth(): Promise<NextResponse | null> {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json(
      { errors: [{ message: 'Unauthorized' }] },
      { status: 401 },
    )
  }
  return null
}

// Handler wrapper for Next.js API routes with monitoring
export async function GET(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const startTime = Date.now()

  try {
    const response = await yoga.handleRequest(request, {
      req: request,
    })

    // Track successful query
    const executionTime = Date.now() - startTime
    dbMonitor.trackQuery(executionTime, 'GraphQL-GET')

    return response
  } catch (error) {
    // Track failed query
    const executionTime = Date.now() - startTime
    dbMonitor.trackQuery(executionTime, 'GraphQL-GET-ERROR')
    throw error
  }
}

export async function POST(request: NextRequest) {
  const authError = await requireAuth()
  if (authError) return authError

  const startTime = Date.now()
  let operationName = 'Unknown'

  try {
    // Extract operation name for better tracking
    const body = await request.clone().text()
    try {
      const parsed = JSON.parse(body)
      operationName =
        parsed.operationName ||
        parsed.query?.match(/(?:query|mutation)\s+(\w+)/)?.[1] ||
        'Unknown'
    } catch {
      // If we can't parse, continue with 'Unknown'
    }

    console.info(`\x1b[34m[GraphQL]\x1b[0m ${operationName}`)
    const response = await yoga.handleRequest(request, {
      req: request,
    })

    // Track successful query with operation name
    const executionTime = Date.now() - startTime
    dbMonitor.trackQuery(executionTime, `GraphQL-POST-${operationName}-END`)

    const responseDuration =
      process.env.NODE_ENV === 'development' ? 1000 : 2000

    // Log slow GraphQL operations specifically
    if (executionTime > responseDuration) {
      console.warn(
        `\x1b[33m[SLOW-GRAPHQL]\x1b[0m ${operationName}: ${executionTime}ms`,
      )
    }

    return response
  } catch (error) {
    // Track failed query
    const executionTime = Date.now() - startTime
    dbMonitor.trackQuery(executionTime, `GraphQL-POST-ERROR-${operationName}`)

    console.error(
      `\x1b[31m[GRAPHQL-ERROR]\x1b[0m ${operationName}: ${executionTime}ms`,
      error,
    )
    throw error
  }
}
