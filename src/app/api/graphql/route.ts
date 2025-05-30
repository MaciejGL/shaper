import { createYoga } from 'graphql-yoga'

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
  cors: {
    origin: '*',
    credentials: true,
    allowedHeaders: [
      'X-Custom-Header',
      'Content-Type',
      'Authorization',
      'Accept',
      'X-Requested-With',
    ],
    methods: ['POST', 'GET', 'OPTIONS'],
  },
})

// export default createYoga<{
//   req: NextApiRequest
//   res: NextApiResponse
// }>({
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
//   schema,
//   logging: 'debug',
//   async context() {
//     const userSession = await getCurrentUser()
//     return {
//       user: userSession,
//     }
//   },
//   // Needed to be defined explicitly because our endpoint lives at a different path other than `/graphql`
//   graphqlEndpoint: '/api/graphql',
// })

// Handler wrapper for Next.js API routes
export async function GET(request: Request) {
  return yoga.handleRequest(request, {})
}

export async function POST(request: Request) {
  return yoga.handleRequest(request, {})
}

export async function OPTIONS(request: Request) {
  return yoga.handleRequest(request, {})
}
