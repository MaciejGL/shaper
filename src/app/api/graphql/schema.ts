import { makeExecutableSchema } from '@graphql-tools/schema'
import * as fs from 'node:fs'
import * as path from 'node:path'

export async function createSchema() {
  const modelFolder = path.join(process.cwd(), 'src', 'server', 'models')

  const resolvers: Record<string, Record<string, unknown>> = {
    Query: {},
    Mutation: {},
  }
  const typeDefs: string[] = []

  const files = fs.readdirSync(modelFolder, { recursive: true })
  for (const file of files) {
    const fileString = String(file)
    if (fileString.endsWith('resolvers.ts')) {
      // Convert the file path to a file URL for dynamic import
      const resolversModule = await import(
        `../../../server/models/${fileString}`
      )

      resolvers.Query = { ...resolvers.Query, ...resolversModule.Query }
      resolvers.Mutation = {
        ...resolvers.Mutation,
        ...resolversModule.Mutation,
      }

      // Merge field resolvers for types (e.g., UserProfileResolvers)
      if (resolversModule.UserProfileResolvers) {
        resolvers.UserProfile = {
          ...resolvers.UserProfile,
          ...resolversModule.UserProfileResolvers,
        }
      }
    } else if (fileString.endsWith('.graphql')) {
      const schema = fs.readFileSync(path.join(modelFolder, fileString), 'utf8')
      typeDefs.push(schema)
    }
  }

  return makeExecutableSchema({
    typeDefs,
    resolvers,
  })
}
