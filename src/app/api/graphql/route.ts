import { createYoga } from 'graphql-yoga'
import { NextResponse } from 'next/server'

import { getCurrentUser } from '@/lib/getUser'

import { createSchema } from './schema'

export type GraphQLContext = {
  user: Awaited<ReturnType<typeof getCurrentUser>>
}

const schema = await createSchema()

const yoga = createYoga({
  graphqlEndpoint: '/api/graphql',
  schema: schema,
  cors: {
    origin: ['https://fit-space.app'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'credentials'],
  },
  logging: 'debug',
  async context() {
    const userSession = await getCurrentUser()
    return {
      user: userSession,
    }
  },
})

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': 'https://fit-space.app',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      },
    },
  )
}

export async function GET(request: Request) {
  return yoga.handleRequest(request, {})
}

export async function POST(request: Request) {
  return yoga.handleRequest(request, {})
}
