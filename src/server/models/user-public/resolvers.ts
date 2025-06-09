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
        assignedPlans: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return new UserPublic(user)
  },
  myTrainer: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    if (!user.user.trainerId) {
      return null
    }

    const trainer = await prisma.user.findUnique({
      where: {
        id: user.user.trainerId,
      },
      include: {
        profile: true,
      },
    })

    if (!trainer) {
      throw new Error('Trainer not found')
    }

    return new UserPublic(trainer)
  },
}

export const Mutation: GQLMutationResolvers = {}
