import { Prisma } from '@prisma/client'

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
  clientBodyMeasures: async (_parent, { clientId }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    // Verify the trainer-client relationship exists
    const client = await prisma.user.findUnique({
      where: {
        id: clientId,
        trainerId: userSession.user.id, // Ensure the client belongs to this trainer
      },
    })

    if (!client) {
      throw new Error('Client not found or not associated with this trainer')
    }

    // Get the client's user profile
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId: clientId },
    })

    if (!userProfile) {
      throw new Error('Client profile not found')
    }

    // Find the coaching request that established the relationship
    const coachingRequest = await prisma.coachingRequest.findFirst({
      where: {
        OR: [
          { senderId: clientId, recipientId: userSession.user.id },
          { senderId: userSession.user.id, recipientId: clientId },
        ],
        status: 'ACCEPTED',
      },
      orderBy: {
        updatedAt: 'desc', // Get the most recent accepted request
      },
    })

    // If no coaching request found, return empty array
    if (!coachingRequest) {
      return []
    }

    // Get body measurements since the coaching relationship was established
    const bodyMeasures = await prisma.userBodyMeasure.findMany({
      where: {
        userProfileId: userProfile.id,
        measuredAt: {
          gte: coachingRequest.updatedAt, // Only measurements after the relationship was established
        },
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
    const data: Prisma.UserBodyMeasureCreateInput = {
      userProfile: {
        connect: {
          id: userProfile.id,
        },
      },
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
    const data: Prisma.UserBodyMeasureUpdateInput = { ...otherData }

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
