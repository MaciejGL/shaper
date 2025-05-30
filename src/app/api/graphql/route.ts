import { createYoga } from 'graphql-yoga'
import { NextRequest } from 'next/server'

import { getCurrentUser } from '@/lib/getUser'

import { createSchema } from './schema'

export type GraphQLContext = {
  user: Awaited<ReturnType<typeof getCurrentUser>>
}

const allowedOrigins = [
  'https://fit-space.app',
  'https://www.fit-space.app',
  'http://localhost:4000',
]
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
  logging: 'debug',
  graphqlEndpoint: '/api/graphql',
  cors: {
    origin: allowedOrigins,
    credentials: true,
    allowedHeaders: [
      'X-Custom-Header',
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
  },
  async context() {
    const userSession = await getCurrentUser()
    return {
      user: userSession,
    }
  },
  fetchAPI: { Request, Response, Headers },
})

// // Handler wrapper for Next.js API routes
export async function GET(request: NextRequest) {
  const response = await yoga.handleRequest(request, {
    req: request,
  })

  const origin = request.headers.get('origin') ?? ''
  const isAllowed = allowedOrigins.includes(origin)

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'Access-Control-Allow-Origin': isAllowed ? origin : '',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}

export async function POST(request: NextRequest) {
  const response = await yoga.handleRequest(request, {
    req: request,
  })

  const origin = request.headers.get('origin') ?? ''
  const isAllowed = allowedOrigins.includes(origin)

  return new Response(await response.text(), {
    status: response.status,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'Access-Control-Allow-Origin': isAllowed ? origin : '',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin') ?? ''
  const isAllowed = allowedOrigins.includes(origin)

  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': isAllowed ? origin : '',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
      'Access-Control-Allow-Headers':
        'Content-Type, Authorization, Accept, X-Requested-With',
      'Access-Control-Allow-Credentials': 'true',
    },
  })
}
