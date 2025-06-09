import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import UserPublic from '../user-public/model'

import User from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  user: async (_, __, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    const user = await prisma.user.findUnique({
      where: { id: userSession.user.id },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return new User(user, context)
  },
  myClients: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const clients = await prisma.user.findMany({
      where: { trainerId: user.user.id },
      include: {
        profile: true,
      },
    })

    if (!clients) {
      throw new Error('User not found')
    }

    return clients.map((client) => new UserPublic(client, context))
  },
}

export const Mutation: GQLMutationResolvers = {}
