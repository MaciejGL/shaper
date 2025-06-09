import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import User from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  user: async (_, __, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    const user = await prisma.user.findUnique({
      where: { id: userSession?.user?.id },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return new User(user)
  },
}

export const Mutation: GQLMutationResolvers = {}
