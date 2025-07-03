import { createYoga } from 'graphql-yoga'
import { NextRequest } from 'next/server'

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

// // Handler wrapper for Next.js API routes
export async function GET(request: NextRequest) {
  return yoga.handleRequest(request, {
    req: request,
  })
}

export async function POST(request: NextRequest) {
  return yoga.handleRequest(request, {
    req: request,
  })
}
