import { createYoga } from 'graphql-yoga'

import { getCurrentUser } from '@/lib/getUser'

import { createSchema } from './schema'

export type GraphQLContext = {
  user: Awaited<ReturnType<typeof getCurrentUser>>
}

const schema = await createSchema()

const yoga = createYoga({
  graphqlEndpoint: '/api/graphql',
  schema: schema,
  logging: 'debug',
  async context() {
    const userSession = await getCurrentUser()
    return {
      user: userSession,
    }
  },
})
// Handler wrapper for Next.js API routes
export async function GET(request: Request) {
  return yoga.handleRequest(request, {})
}

export async function POST(request: Request) {
  return yoga.handleRequest(request, {})
}
