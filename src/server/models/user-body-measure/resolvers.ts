import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import UserBodyMeasure from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  bodyMeasures: async (_parent, _args, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: userSession?.user?.id },
    })

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    const bodyMeasures = await prisma.userBodyMeasure.findMany({
      where: {
        userProfileId: userProfile.id,
      },
      orderBy: {
        measuredAt: 'desc',
      },
    })

    return bodyMeasures.map((measure) => new UserBodyMeasure(measure))
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  addBodyMeasurement: async (_parent, { input }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: userSession?.user?.id },
    })

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    // Filter out null/undefined values to only store provided measurements
    const measurementData = Object.fromEntries(
      Object.entries(input).filter(
        ([, value]) => value !== null && value !== undefined,
      ),
    )

    const bodyMeasurement = await prisma.userBodyMeasure.create({
      data: {
        userProfileId: userProfile.id,
        ...measurementData,
      },
    })

    return new UserBodyMeasure(bodyMeasurement)
  },

  deleteBodyMeasurement: async (_parent, { id }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: userSession?.user?.id },
    })

    if (!userProfile) {
      throw new Error('User profile not found')
    }

    // Verify the measurement belongs to this user
    const existingMeasurement = await prisma.userBodyMeasure.findFirst({
      where: {
        id,
        userProfileId: userProfile.id,
      },
    })

    if (!existingMeasurement) {
      throw new Error('Body measurement not found or does not belong to user')
    }

    await prisma.userBodyMeasure.delete({
      where: { id },
    })

    return true
  },
}
