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

    // Preload commonly requested data to prevent N+1 queries
    // Other relations (trainer, clients, sessions) are lazy-loaded as needed
    const user = await prisma.user.findUnique({
      where: { id: userSession.user.id },
      include: {
        profile: {
          include: {
            bodyMeasures: true,
          },
        },
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return new User(user, context)
  },
  // Comprehensive resolver for when all user data is needed (trainer dashboard)
  userWithAllData: async (_, __, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    // Preload ALL related data to prevent N+1 queries
    const user = await prisma.user.findUnique({
      where: { id: userSession.user.id },
      include: {
        profile: {
          include: {
            bodyMeasures: true,
          },
        },
        trainer: {
          include: {
            profile: true,
          },
        },
        clients: {
          include: {
            profile: true,
          },
        },
        sessions: true,
        notifications: {
          include: {
            creator: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return new User(user, context)
  },
  // Lightweight resolver for global context - only essential data
  userBasic: async (_, __, context: GQLContext) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    // Only fetch essential data for global context
    const user = await prisma.user.findUnique({
      where: { id: userSession.user.id },
      include: {
        profile: true, // Include full profile (bodyMeasures will be lazy-loaded if needed)
        // Exclude trainer, clients, sessions, notifications, and other heavy data
      },
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
        assignedPlans: {
          include: {
            weeks: {
              include: {
                days: {
                  include: {
                    events: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!clients) {
      throw new Error('User not found')
    }

    return clients.map((client) => new UserPublic(client, context))
  },
}

export const Mutation: GQLMutationResolvers = {}
