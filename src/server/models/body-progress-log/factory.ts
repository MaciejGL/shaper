import { GQLMutationUpdateBodyProgressLogArgs } from '@/generated/graphql-server'
import { Prisma } from '@/generated/prisma/client'
import { ensureTrainerClientAccess } from '@/lib/access-control'
import { ImageHandler } from '@/lib/aws/image-handler'
import { prisma } from '@/lib/db'

import BodyProgressLog from './model'

export async function getUserBodyProgressLogs(
  userId: string,
  userProfileId: string,
): Promise<BodyProgressLog[]> {
  // Verify the user profile belongs to the current user
  const userProfile = await prisma.userProfile.findFirst({
    where: {
      id: userProfileId,
      userId: userId,
    },
  })

  if (!userProfile) {
    throw new Error('User profile not found or access denied')
  }

  const progressLogs = await prisma.bodyProgressLog.findMany({
    where: {
      userProfileId: userProfileId,
    },
    orderBy: {
      loggedAt: 'desc',
    },
  })

  return progressLogs.map((log) => new BodyProgressLog(log))
}

export async function getClientBodyProgressLogs(
  trainerId: string,
  clientId: string,
): Promise<BodyProgressLog[]> {
  // Verify the trainer-client access
  const authorizedTrainerIds = await ensureTrainerClientAccess(
    trainerId,
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

  // Only return logs that are shared with trainer
  const progressLogs = await prisma.bodyProgressLog.findMany({
    where: {
      userProfileId: userProfile.id,
      shareWithTrainer: true,
    },
    orderBy: {
      loggedAt: 'desc',
    },
  })

  return progressLogs.map((log) => new BodyProgressLog(log))
}

export async function createBodyProgressLogEntry(
  userId: string,
  input: {
    loggedAt?: string | null
    notes?: string | null
    image1Url?: string | null
    image2Url?: string | null
    image3Url?: string | null
    shareWithTrainer?: boolean | null
  },
): Promise<BodyProgressLog> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  })

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Filter out null/undefined values
  const logData = Object.fromEntries(
    Object.entries(input).filter(
      ([, value]) => value !== null && value !== undefined,
    ),
  )

  // Handle loggedAt field specifically
  const { loggedAt, ...otherData } = logData
  const data: Prisma.BodyProgressLogCreateInput = {
    userProfile: {
      connect: {
        id: userProfile.id,
      },
    },
    shareWithTrainer: input.shareWithTrainer ?? false,
    ...otherData,
  }

  // If loggedAt is provided, parse it as a Date, otherwise use default
  if (loggedAt) {
    data.loggedAt = new Date(loggedAt as string)
  }

  const progressLog = await prisma.bodyProgressLog.create({
    data,
  })

  return new BodyProgressLog(progressLog)
}

export async function updateBodyProgressLogEntry(
  userId: string,
  id: string,
  input: GQLMutationUpdateBodyProgressLogArgs['input'],
): Promise<BodyProgressLog> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  })

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Verify the progress log belongs to this user
  const existingLog = await prisma.bodyProgressLog.findFirst({
    where: {
      id,
      userProfileId: userProfile.id,
    },
  })

  if (!existingLog) {
    throw new Error('Progress log not found or does not belong to user')
  }

  // Collect images that will be removed for S3 deletion
  const imagesToDelete: string[] = []

  // Compare existing vs provided images to detect what should be deleted

  // Image 1: Delete if exists in DB but not provided in input, or if replaced
  if (existingLog.image1Url && !input.hasOwnProperty('image1Url')) {
    // Image was removed (not provided)
    imagesToDelete.push(existingLog.image1Url)
  } else if (
    input.image1Url &&
    existingLog.image1Url &&
    input.image1Url !== existingLog.image1Url
  ) {
    // Image was replaced
    imagesToDelete.push(existingLog.image1Url)
  }

  // Image 2: Delete if exists in DB but not provided in input, or if replaced
  if (existingLog.image2Url && !input.hasOwnProperty('image2Url')) {
    // Image was removed (not provided)
    imagesToDelete.push(existingLog.image2Url)
  } else if (
    input.image2Url &&
    existingLog.image2Url &&
    input.image2Url !== existingLog.image2Url
  ) {
    // Image was replaced
    imagesToDelete.push(existingLog.image2Url)
  }

  // Image 3: Delete if exists in DB but not provided in input, or if replaced
  if (existingLog.image3Url && !input.hasOwnProperty('image3Url')) {
    // Image was removed (not provided)
    imagesToDelete.push(existingLog.image3Url)
  } else if (
    input.image3Url &&
    existingLog.image3Url &&
    input.image3Url !== existingLog.image3Url
  ) {
    // Image was replaced
    imagesToDelete.push(existingLog.image3Url)
  }

  // Prepare update data - include nulls for image removal
  const data: Prisma.BodyProgressLogUpdateInput = {}

  // Handle loggedAt field
  if (input.loggedAt && typeof input.loggedAt === 'string') {
    data.loggedAt = new Date(input.loggedAt)
  }

  // Handle other fields
  if (input.hasOwnProperty('notes')) {
    data.notes = input.notes
  }

  // Handle image updates and removals
  data.image1Url = input.image1Url ?? null
  data.image2Url = input.image2Url ?? null
  data.image3Url = input.image3Url ?? null

  if (
    input.hasOwnProperty('shareWithTrainer') &&
    input.shareWithTrainer !== null
  ) {
    data.shareWithTrainer = input.shareWithTrainer
  }

  // Update the database
  const updatedLog = await prisma.bodyProgressLog.update({
    where: { id },
    data,
  })

  // Delete removed images from S3 after successful DB update
  if (imagesToDelete.length > 0) {
    try {
      await ImageHandler.delete({ images: imagesToDelete })
    } catch (error) {
      console.error('Failed to delete images from S3:', error)
      // Don't throw error here - the DB update was successful
      // Log the error but continue, as the main operation succeeded
    }
  }

  return new BodyProgressLog(updatedLog)
}

export async function updateBodyProgressLogSharingStatus(
  userId: string,
  id: string,
  shareWithTrainer: boolean,
): Promise<BodyProgressLog> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  })

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Verify the progress log belongs to this user
  const existingLog = await prisma.bodyProgressLog.findFirst({
    where: {
      id,
      userProfileId: userProfile.id,
    },
  })

  if (!existingLog) {
    throw new Error('Progress log not found or does not belong to user')
  }

  const updatedLog = await prisma.bodyProgressLog.update({
    where: { id },
    data: { shareWithTrainer },
  })

  return new BodyProgressLog(updatedLog)
}

export async function deleteBodyProgressLogEntry(
  userId: string,
  id: string,
): Promise<boolean> {
  const userProfile = await prisma.userProfile.findUnique({
    where: { userId },
  })

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  // Verify the progress log belongs to this user
  const existingLog = await prisma.bodyProgressLog.findFirst({
    where: {
      id,
      userProfileId: userProfile.id,
    },
  })

  if (!existingLog) {
    throw new Error('Progress log not found or does not belong to user')
  }

  // Collect all images to delete from S3
  const imagesToDelete: string[] = []
  if (existingLog.image1Url) imagesToDelete.push(existingLog.image1Url)
  if (existingLog.image2Url) imagesToDelete.push(existingLog.image2Url)
  if (existingLog.image3Url) imagesToDelete.push(existingLog.image3Url)

  // Delete the log from database first
  await prisma.bodyProgressLog.delete({
    where: { id },
  })

  // Delete associated images from S3 after successful DB deletion
  if (imagesToDelete.length > 0) {
    try {
      await ImageHandler.delete({ images: imagesToDelete })
    } catch (error) {
      console.error('Failed to delete images from S3:', error)
      // Don't throw error here - the DB deletion was successful
      // Log the error but continue, as the main operation succeeded
    }
  }

  return true
}
