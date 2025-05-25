import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'

import UserPublic from './model'

export const Query: GQLQueryResolvers = {
  userPublic: async (_, { id }) => {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return new UserPublic(user)
  },
}

export const Mutation: GQLMutationResolvers = {}
