import { addDays, addMonths, addWeeks, getDay, startOfDay } from 'date-fns'

import {
  GQLCheckinFrequency,
  GQLCompleteCheckinInput,
  GQLCreateCheckinScheduleInput,
  GQLUpdateCheckinScheduleInput,
} from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { notifyTrainerCheckinCompleted } from '@/lib/notifications/push-notification-service'
import { GQLContext } from '@/types/gql-context'

import { createBodyProgressLogEntry } from '../body-progress-log/factory'

import { CheckinCompletion, CheckinSchedule } from './model'

/**
 * Calculate the next check-in date based on schedule
 */
export function calculateNextCheckinDate(
  frequency: GQLCheckinFrequency,
  dayOfWeek?: number | null,
  dayOfMonth?: number | null,
  lastCompletionDate?: Date,
): Date {
  const now = new Date()
  const baseDate = lastCompletionDate || now

  switch (frequency) {
    case GQLCheckinFrequency.Weekly: {
      if (dayOfWeek === null || dayOfWeek === undefined) {
        throw new Error('dayOfWeek is required for weekly frequency')
      }

      // If this is the first schedule (no lastCompletionDate), check if target day is still in current week
      if (!lastCompletionDate) {
        const currentDay = getDay(now)
        const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7

        // If target day is today or later this week, use current week
        if (
          daysUntilTarget > 0 ||
          (daysUntilTarget === 0 && dayOfWeek === currentDay)
        ) {
          return addDays(startOfDay(now), daysUntilTarget)
        }
      }

      // Otherwise, add a week and adjust to the correct day
      let nextDate = addWeeks(startOfDay(baseDate), 1)
      const currentDay = getDay(nextDate)
      const daysToAdd = (dayOfWeek - currentDay + 7) % 7
      nextDate = addDays(nextDate, daysToAdd)

      return nextDate
    }

    case GQLCheckinFrequency.Biweekly: {
      if (dayOfWeek === null || dayOfWeek === undefined) {
        throw new Error('dayOfWeek is required for biweekly frequency')
      }

      // If this is the first schedule (no lastCompletionDate), check if target day is still in current week
      if (!lastCompletionDate) {
        const currentDay = getDay(now)
        const daysUntilTarget = (dayOfWeek - currentDay + 7) % 7

        // If target day is today or later this week, use current week
        if (
          daysUntilTarget > 0 ||
          (daysUntilTarget === 0 && dayOfWeek === currentDay)
        ) {
          return addDays(startOfDay(now), daysUntilTarget)
        }
      }

      // Otherwise, add two weeks and adjust to the correct day
      let nextDate = addWeeks(startOfDay(baseDate), 2)
      const currentDay = getDay(nextDate)
      const daysToAdd = (dayOfWeek - currentDay + 7) % 7
      nextDate = addDays(nextDate, daysToAdd)

      return nextDate
    }

    case GQLCheckinFrequency.Monthly: {
      if (dayOfMonth === null || dayOfMonth === undefined) {
        throw new Error('dayOfMonth is required for monthly frequency')
      }

      const nextDate = addMonths(startOfDay(baseDate), 1)

      // Set to the correct day of month
      nextDate.setDate(
        Math.min(
          dayOfMonth,
          new Date(
            nextDate.getFullYear(),
            nextDate.getMonth() + 1,
            0,
          ).getDate(),
        ),
      )

      return nextDate
    }

    default:
      throw new Error(`Unsupported frequency: ${frequency}`)
  }
}

/**
 * Get user's check-in schedule
 */
export async function getUserCheckinSchedule(
  userId: string,
): Promise<CheckinSchedule | null> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
    include: {
      checkinSchedule: {
        include: {
          completions: {
            include: {
              measurement: true,
              progressLog: true,
            },
            orderBy: { completedAt: 'desc' },
            take: 10, // Last 10 completions
          },
        },
      },
    },
  })

  if (!userProfile?.checkinSchedule) {
    return null
  }

  return new CheckinSchedule(userProfile.checkinSchedule)
}

/**
 * Create a new check-in schedule
 */
export async function createCheckinSchedule(
  userId: string,
  input: GQLCreateCheckinScheduleInput,
): Promise<CheckinSchedule> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  })

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Validate input based on frequency
  if (input.frequency === GQLCheckinFrequency.Monthly && !input.dayOfMonth) {
    throw new Error('dayOfMonth is required for monthly frequency')
  }

  if (
    (input.frequency === GQLCheckinFrequency.Weekly ||
      input.frequency === GQLCheckinFrequency.Biweekly) &&
    input.dayOfWeek === undefined
  ) {
    throw new Error('dayOfWeek is required for weekly/biweekly frequency')
  }

  const schedule = await prisma.checkinSchedule.create({
    data: {
      userProfileId: userProfile.id,
      frequency: input.frequency,
      dayOfWeek: input.dayOfWeek,
      dayOfMonth: input.dayOfMonth,
    },
    include: {
      completions: {
        include: {
          measurement: true,
          progressLog: true,
        },
        orderBy: { completedAt: 'desc' },
        take: 10,
      },
    },
  })

  return new CheckinSchedule(schedule)
}

/**
 * Update check-in schedule
 */
export async function updateCheckinSchedule(
  userId: string,
  input: GQLUpdateCheckinScheduleInput,
): Promise<CheckinSchedule> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { checkinSchedule: true },
  })

  if (!userProfile?.checkinSchedule) {
    throw new Error('Check-in schedule not found')
  }

  const updateData: Prisma.CheckinScheduleUpdateInput = {}

  if (input.frequency !== undefined && input.frequency !== null) {
    updateData.frequency = input.frequency
  }
  if (input.dayOfWeek !== undefined && input.dayOfWeek !== null) {
    updateData.dayOfWeek = input.dayOfWeek
  }
  if (input.dayOfMonth !== undefined && input.dayOfMonth !== null) {
    updateData.dayOfMonth = input.dayOfMonth
  }
  if (input.isActive !== undefined && input.isActive !== null) {
    updateData.isActive = input.isActive
  }

  const schedule = await prisma.checkinSchedule.update({
    where: { id: userProfile.checkinSchedule.id },
    data: updateData,
    include: {
      completions: {
        include: {
          measurement: true,
          progressLog: true,
        },
        orderBy: { completedAt: 'desc' },
        take: 10,
      },
    },
  })

  return new CheckinSchedule(schedule)
}

/**
 * Delete check-in schedule
 */
export async function deleteCheckinSchedule(userId: string): Promise<boolean> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { checkinSchedule: true },
  })

  if (!userProfile?.checkinSchedule) {
    return false
  }

  await prisma.checkinSchedule.delete({
    where: { id: userProfile.checkinSchedule.id },
  })

  return true
}

/**
 * Complete a check-in
 */
export async function completeCheckin(
  userId: string,
  input: GQLCompleteCheckinInput,
  context: GQLContext,
): Promise<CheckinCompletion> {
  // Check premium access - required for completing check-ins
  const { checkPremiumAccess } = await import('../subscription/factory')
  const hasPremium = await checkPremiumAccess(context)
  if (!hasPremium) {
    throw new Error('Premium subscription required to complete check-ins')
  }

  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { checkinSchedule: true },
  })

  if (!userProfile?.checkinSchedule) {
    throw new Error('Check-in schedule not found')
  }

  let measurementId: string | undefined
  let progressLogId: string | undefined

  // Create measurement if provided
  if (input.measurementData) {
    const measurement = await prisma.userBodyMeasure.create({
      data: {
        userProfileId: userProfile.id,
        measuredAt: input.measurementData.measuredAt
          ? new Date(input.measurementData.measuredAt)
          : new Date(),
        weight: input.measurementData.weight,
        chest: input.measurementData.chest,
        waist: input.measurementData.waist,
        hips: input.measurementData.hips,
        neck: input.measurementData.neck,
        bicepsLeft: input.measurementData.bicepsLeft,
        bicepsRight: input.measurementData.bicepsRight,
        thighLeft: input.measurementData.thighLeft,
        thighRight: input.measurementData.thighRight,
        calfLeft: input.measurementData.calfLeft,
        calfRight: input.measurementData.calfRight,
        bodyFat: input.measurementData.bodyFat,
        notes: input.measurementData.notes,
      },
    })
    measurementId = measurement.id
  }

  // Create progress log if provided
  if (input.progressLogData) {
    const progressLog = await createBodyProgressLogEntry(
      userId,
      input.progressLogData,
      context,
    )
    progressLogId = progressLog.id
  }

  // Create completion record
  const completion = await prisma.checkinCompletion.create({
    data: {
      scheduleId: userProfile.checkinSchedule.id,
      measurementId,
      progressLogId,
    },
    include: {
      measurement: true,
      progressLog: true,
    },
  })

  // Notify trainer if user has one
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      trainer: {
        include: {
          profile: true,
        },
      },
      profile: true,
    },
  })

  if (user?.trainer) {
    const clientName =
      user.profile?.firstName && user.profile?.lastName
        ? `${user.profile.firstName} ${user.profile.lastName}`
        : user.name || 'Client'

    await notifyTrainerCheckinCompleted(user.trainer.id, clientName, userId)
  }

  return new CheckinCompletion(completion)
}

/**
 * Skip a check-in (creates empty completion)
 */
export async function skipCheckin(userId: string): Promise<CheckinCompletion> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
    include: { checkinSchedule: true },
  })

  if (!userProfile?.checkinSchedule) {
    throw new Error('Check-in schedule not found')
  }

  const completion = await prisma.checkinCompletion.create({
    data: {
      scheduleId: userProfile.checkinSchedule.id,
      measurementId: null,
      progressLogId: null,
    },
    include: {
      measurement: true,
      progressLog: true,
    },
  })

  return new CheckinCompletion(completion)
}
