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

    // Handle measuredAt field specifically
    const { measuredAt, ...otherData } = measurementData
    const data: any = {
      userProfileId: userProfile.id,
      ...otherData,
    }

    // If measuredAt is provided, parse it as a Date, otherwise let Prisma use default
    if (measuredAt) {
      data.measuredAt = new Date(measuredAt as string)
    }

    const bodyMeasurement = await prisma.userBodyMeasure.create({
      data,
    })

    return new UserBodyMeasure(bodyMeasurement)
  },

  updateBodyMeasurement: async (_parent, { input }, context) => {
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

    const { id, ...updateData } = input

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

    // Filter out null/undefined values to only update provided measurements
    const measurementData = Object.fromEntries(
      Object.entries(updateData).filter(
        ([, value]) => value !== null && value !== undefined,
      ),
    )

    // Handle measuredAt field specifically
    const { measuredAt, ...otherData } = measurementData
    const data: any = { ...otherData }

    // If measuredAt is provided, parse it as a Date
    if (measuredAt) {
      data.measuredAt = new Date(measuredAt as string)
    }

    const updatedMeasurement = await prisma.userBodyMeasure.update({
      where: { id },
      data,
    })

    return new UserBodyMeasure(updatedMeasurement)
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
