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
    origin: ['https://fit-space.app', 'https://www.fit-space.app'],
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

  try {
    const response = await yoga.handleRequest(request, {
      req: request,
    })

    // Track successful query
    const executionTime = Date.now() - startTime
    dbMonitor.trackQuery(executionTime, 'GraphQL-POST')

    return response
  } catch (error) {
    // Track failed query
    const executionTime = Date.now() - startTime
    dbMonitor.trackQuery(executionTime, 'GraphQL-POST-ERROR')
    throw error
  }
}
