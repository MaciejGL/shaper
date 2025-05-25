import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

import User from './model'

export const Query: GQLQueryResolvers = {
  user: async () => {
    const userSession = await getCurrentUser()
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
