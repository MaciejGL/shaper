import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import UserProfile from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  profile: async (_, __, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: userSession?.user?.id },
      include: {
        user: true,
        bodyMeasures: true,
      },
    })

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    return new UserProfile(userProfile)
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  updateProfile: async (_, { input }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    const { email, ...rest } = input

    const emailToUpdate = (email || userSession?.user?.email).trim()
    if (!emailToUpdate) {
      throw new Error('Email not found')
    }

    const userProfile = await prisma.userProfile.update({
      where: { userId: userSession?.user?.id },
      data: {
        firstName: rest.firstName || null,
        lastName: rest.lastName || null,
        phone: rest.phone || null,
        birthday: rest.birthday || null,
        sex: rest.sex || null,
        // avatarUrl: rest.avatarUrl || null,
        height: rest.height || null,
        weight: rest.weight || null,
        fitnessLevel: rest.fitnessLevel || null,
        activityLevel: rest.activityLevel || null,
        goals: rest.goals || [],
        allergies: rest.allergies || null,
        bio: rest.bio || null,
        user: {
          update: {
            email: emailToUpdate,
          },
        },
      },
      include: {
        user: true,
      },
    })

    return new UserProfile(userProfile)
  },
}
