import {
  getCurrentTermsVersion,
  getTermsByVersion,
} from '@/constants/terms-versions'
import { prisma } from '@/lib/db'

/**
 * Record user's agreement to current terms
 */
export async function recordTermsAgreement({
  userId,
  offerId,
}: {
  userId: string
  offerId?: string
}) {
  const version = getCurrentTermsVersion()

  try {
    const existingAgreement = await prisma.userTermsAgreement.findFirst({
      where: {
        userId,
        version,
        offerId,
      },
    })

    if (existingAgreement) {
      return existingAgreement
    }

    const agreement = await prisma.userTermsAgreement.create({
      data: {
        userId,
        version,
        offerId,
      },
    })

    console.info(
      `📋 Terms agreement recorded: user ${userId} agreed to ${version}`,
    )
    return agreement
  } catch (error) {
    console.error('Failed to record terms agreement:', error)
    throw error
  }
}

/**
 * Check if user has agreed to current terms version
 */
export async function hasUserAgreedToCurrentTerms(
  userId: string,
): Promise<boolean> {
  const currentVersion = getCurrentTermsVersion()

  const agreement = await prisma.userTermsAgreement.findFirst({
    where: {
      userId,
      version: currentVersion,
    },
  })

  return !!agreement
}

/**
 * Get user's terms agreement history
 */
export async function getUserTermsHistory(userId: string) {
  return prisma.userTermsAgreement.findMany({
    where: { userId },
    orderBy: { agreedAt: 'desc' },
  })
}

/**
 * Get terms content for a specific version
 */
export function getTermsContentByVersion(version: string) {
  return getTermsByVersion(version)
}

/**
 * Check if a user has agreed to a specific version
 */
export async function hasUserAgreedToVersion(
  userId: string,
  version: string,
): Promise<boolean> {
  const agreement = await prisma.userTermsAgreement.findFirst({
    where: {
      userId,
      version,
    },
  })

  return !!agreement
}

/**
 * Get the latest terms version a user has agreed to
 */
export async function getUserLatestAgreedVersion(
  userId: string,
): Promise<string | null> {
  const latestAgreement = await prisma.userTermsAgreement.findFirst({
    where: { userId },
    orderBy: { agreedAt: 'desc' },
    select: { version: true },
  })

  return latestAgreement?.version || null
}

/**
 * Check if user needs to agree to updated terms
 */
export async function doesUserNeedTermsUpdate(
  userId: string,
): Promise<boolean> {
  const hasAgreedToCurrent = await hasUserAgreedToCurrentTerms(userId)

  return !hasAgreedToCurrent
}
