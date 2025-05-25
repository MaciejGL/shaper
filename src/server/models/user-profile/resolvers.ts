import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

import UserProfile from './model'

export const Query: GQLQueryResolvers = {
  profile: async () => {
    const userSession = await getCurrentUser()
    if (!userSession) {
      throw new Error('User not found')
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: userSession?.user?.id },
    })

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    return new UserProfile(userProfile)
  },
}

export const Mutation: GQLMutationResolvers = {
  updateProfile: async (_, { input }) => {
    const userSession = await getCurrentUser()
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
    })

    return new UserProfile(userProfile)
  },
}
