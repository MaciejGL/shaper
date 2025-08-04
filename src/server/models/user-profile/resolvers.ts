import { Prisma } from '@prisma/client'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import UserProfile from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  profile: async (_parent, _args, context) => {
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
  updateProfile: async (_parent, { input }, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    const { email, ...rest } = input

    const emailToUpdate = (email || userSession?.user?.email).trim()
    if (!emailToUpdate) {
      throw new Error('Email not found')
    }

    // Build data object with only provided fields
    const updateData: Prisma.UserProfileUpdateInput = {
      user: {
        update: {
          email: emailToUpdate,
        },
      },
    }

    // Only update fields that are explicitly provided
    if (rest.firstName !== undefined)
      updateData.firstName = rest.firstName || null
    if (rest.lastName !== undefined) updateData.lastName = rest.lastName || null
    if (rest.phone !== undefined) updateData.phone = rest.phone || null
    if (rest.birthday !== undefined) updateData.birthday = rest.birthday || null
    if (rest.sex !== undefined) updateData.sex = rest.sex || null
    if (rest.avatarUrl !== undefined)
      updateData.avatarUrl = rest.avatarUrl || null
    if (rest.height !== undefined) updateData.height = rest.height || null
    if (rest.weight !== undefined) updateData.weight = rest.weight || null
    if (rest.fitnessLevel !== undefined)
      updateData.fitnessLevel = rest.fitnessLevel || null
    if (rest.activityLevel !== undefined)
      updateData.activityLevel = rest.activityLevel || null
    if (rest.goals !== undefined) updateData.goals = rest.goals || []
    if (rest.allergies !== undefined)
      updateData.allergies = rest.allergies || null
    if (rest.bio !== undefined) updateData.bio = rest.bio || null

    // Preference fields
    if (rest.weekStartsOn !== undefined)
      updateData.weekStartsOn = rest.weekStartsOn
    if (rest.weightUnit !== undefined) updateData.weightUnit = rest.weightUnit
    if (rest.heightUnit !== undefined) updateData.heightUnit = rest.heightUnit
    if (rest.theme !== undefined) updateData.theme = rest.theme
    if (rest.timeFormat !== undefined) updateData.timeFormat = rest.timeFormat
    if (rest.trainingView !== undefined)
      updateData.trainingView = rest.trainingView

    // Notification preferences
    if (rest.notificationPreferences?.workoutReminders !== undefined) {
      updateData.workoutReminders =
        rest.notificationPreferences.workoutReminders
    }
    if (rest.notificationPreferences?.mealReminders !== undefined) {
      updateData.mealReminders = rest.notificationPreferences.mealReminders
    }
    if (rest.notificationPreferences?.progressUpdates !== undefined) {
      updateData.progressUpdates = rest.notificationPreferences.progressUpdates
    }
    if (
      rest.notificationPreferences?.collaborationNotifications !== undefined
    ) {
      updateData.collaborationNotifications =
        rest.notificationPreferences.collaborationNotifications
    }
    if (rest.notificationPreferences?.systemNotifications !== undefined) {
      updateData.systemNotifications =
        rest.notificationPreferences.systemNotifications
    }
    if (rest.notificationPreferences?.emailNotifications !== undefined) {
      updateData.emailNotifications =
        rest.notificationPreferences.emailNotifications
    }
    if (rest.notificationPreferences?.pushNotifications !== undefined) {
      updateData.pushNotifications =
        rest.notificationPreferences.pushNotifications
    }

    const userProfile = await prisma.userProfile.update({
      where: { userId: userSession?.user?.id },
      data: updateData,
      include: {
        user: true,
      },
    })

    return new UserProfile(userProfile)
  },
}
