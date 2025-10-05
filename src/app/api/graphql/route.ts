import { createYoga } from 'graphql-yoga'
import { NextRequest } from 'next/server'

import { dbMonitor } from '@/lib/db-monitor'

import { createContext } from './create-context'
import { createSchema } from './schema'

const schema = await createSchema()

export const config = {
  api: {
    // Disable body parsing (required for file uploads)
    bodyParser: false,
  },
}

const yoga = createYoga<{
  req: NextRequest
}>({
  schema,
  logging: 'info',
  graphqlEndpoint: '/api/graphql',
  cors: {
    origin: ['https://hypro.app', 'https://www.hypro.app'],
    credentials: true,
  },
  context: async () => createContext(),
  fetchAPI: { Request, Response, Headers },
})

// Handler wrapper for Next.js API routes with monitoring
export async function GET(request: NextRequest) {
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

    console.info(`[GraphQL-POST-START] ${operationName}`)
    const response = await yoga.handleRequest(request, {
      req: request,
    })

    // Track successful query with operation name
    const executionTime = Date.now() - startTime
    dbMonitor.trackQuery(executionTime, `GraphQL-POST-${operationName}-END`)

    // Log slow GraphQL operations specifically
    if (executionTime > 2000) {
      console.warn(`[SLOW-GRAPHQL] ${operationName}: ${executionTime}ms`)
    }

    return response
  } catch (error) {
    // Track failed query
    const executionTime = Date.now() - startTime
    dbMonitor.trackQuery(executionTime, `GraphQL-POST-ERROR-${operationName}`)

    console.error(`[GRAPHQL-ERROR] ${operationName}: ${executionTime}ms`, error)
    throw error
  }
}
