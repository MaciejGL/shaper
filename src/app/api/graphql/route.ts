import { createYoga } from 'graphql-yoga'
import { NextRequest } from 'next/server'

import { getCurrentUser } from '@/lib/getUser'

import { createSchema } from './schema'

export type GraphQLContext = {
  user: Awaited<ReturnType<typeof getCurrentUser>>
}

const schema = await createSchema()

export const config = {
  api: {
    // Disable body parsing (required for file uploads)
    bodyParser: false,
  },
}

// const yoga = createYoga({
//   graphqlEndpoint: '/api/graphql',
//   schema: schema,
//   logging: 'debug',
//   async context() {
//     const userSession = await getCurrentUser()
//     return {
//       user: userSession,
//     }
//   },
//   cors: {
//     origin: '*',
//     credentials: true,
//     allowedHeaders: [
//       'X-Custom-Header',
//       'Content-Type',
//       'Authorization',
//       'Accept',
//       'X-Requested-With',
//     ],
//     methods: ['POST', 'GET', 'OPTIONS'],
//   },
// })

const yoga = createYoga<{
  req: NextRequest
}>({
  schema,
  logging: 'debug',
  graphqlEndpoint: '/api/graphql',
  cors: {
    origin: ['https://fit-space.app', 'https://www.fit-space.app'],
    credentials: true,
  },
  async context() {
    const userSession = await getCurrentUser()
    return {
      user: userSession,
    }
  },
  fetchAPI: { Request, Response, Headers },
})

export { yoga as GET, yoga as POST }

// // Handler wrapper for Next.js API routes
// export async function GET(request: Request) {
//   return yoga.handleRequest(request, {})
// }

// export async function POST(request: Request) {
//   return yoga.handleRequest(request, {})
// }

// export async function OPTIONS(request: Request) {
//   return yoga.handleRequest(request, {})
// }
