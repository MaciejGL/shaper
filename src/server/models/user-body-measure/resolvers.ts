import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import { ensureTrainerClientAccess } from '@/lib/access-control'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import UserBodyMeasure from './model'

/**
 * Helper function to update user profile weight when a body measurement with weight is added/updated
 * Only updates if the measurement is the most recent one to avoid outdated weight in profile
 */
async function updateProfileWeightFromMeasurement(
  userProfileId: string,
  measurementWeight: number | null | undefined,
  measurementDate: Date,
) {
  // Only proceed if weight is provided
  if (!measurementWeight) {
    return
  }

  // Get the most recent body measurement to check if this should update the profile
  const mostRecentMeasurement = await prisma.userBodyMeasure.findFirst({
    where: {
      userProfileId,
      weight: { not: null }, // Only consider measurements with weight
    },
    orderBy: {
      measuredAt: 'desc',
    },
  })

  // Update profile weight if this is the most recent measurement with weight
  // or if there are no existing measurements with weight
  const shouldUpdateProfile =
    !mostRecentMeasurement ||
    measurementDate >= mostRecentMeasurement.measuredAt

  if (shouldUpdateProfile) {
    await prisma.userProfile.update({
      where: { id: userProfileId },
      data: { weight: measurementWeight },
    })
  }
}

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

    // Verify the trainer-client access (direct trainer or team member)
    const authorizedTrainerIds = await ensureTrainerClientAccess(
      userSession.user.id,
      clientId,
      {
        returnTrainerIds: true,
      },
    )

    if (authorizedTrainerIds.length === 0) {
      return []
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

    // Check premium access - required for adding new body measurements
    const { checkPremiumAccess } = await import('../subscription/factory')
    const hasPremium = await checkPremiumAccess(context)
    if (!hasPremium) {
      throw new Error('Premium subscription required to add body measurements')
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

    // Update profile weight if weight was provided in the measurement
    await updateProfileWeightFromMeasurement(
      userProfile.id,
      input.weight,
      bodyMeasurement.measuredAt,
    )

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

    // Handle measuredAt field specifically
    const { measuredAt, ...otherData } = updateData
    const data: Prisma.UserBodyMeasureUpdateInput = { ...otherData }

    // If measuredAt is provided, parse it as a Date
    if (measuredAt) {
      data.measuredAt = new Date(measuredAt)
    }

    const updatedMeasurement = await prisma.userBodyMeasure.update({
      where: { id },
      data,
    })

    // Update profile weight if weight was provided in the update
    // Use the weight from input if provided, otherwise use the existing weight from the updated measurement
    const weightToUpdate =
      input.weight !== undefined ? input.weight : updatedMeasurement.weight
    await updateProfileWeightFromMeasurement(
      userProfile.id,
      weightToUpdate,
      updatedMeasurement.measuredAt,
    )

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

    // If the deleted measurement had weight, update profile weight to the next most recent measurement
    if (existingMeasurement.weight) {
      const nextMostRecentMeasurement = await prisma.userBodyMeasure.findFirst({
        where: {
          userProfileId: userProfile.id,
          weight: { not: null },
        },
        orderBy: {
          measuredAt: 'desc',
        },
      })

      // Update profile weight to the next most recent measurement, or null if none exists
      await prisma.userProfile.update({
        where: { id: userProfile.id },
        data: { weight: nextMostRecentMeasurement?.weight || null },
      })
    }

    return true
  },
}
