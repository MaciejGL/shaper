import type { GQLResetUserLogsInput } from '@/generated/graphql-server'
import { SubscriptionStatus } from '@/generated/prisma/client'
import type { Prisma } from '@/generated/prisma/client'
import { ImageHandler } from '@/lib/aws/image-handler'
import { prisma } from '@/lib/db'
import { stripe } from '@/lib/stripe/stripe'

type TransactionClient = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>

export function calculateDateRange(input: GQLResetUserLogsInput): {
  fromDate: Date | null
  toDate: Date | null
} {
  if (input.timeframeType === 'DATE_RANGE') {
    let toDate: Date | null = null
    if (input.toDate) {
      // Set toDate to end of day (23:59:59.999) to include the entire selected day
      toDate = new Date(input.toDate)
      toDate.setHours(23, 59, 59, 999)
    }

    return {
      fromDate: input.fromDate ? new Date(input.fromDate) : null,
      toDate,
    }
  }

  if (input.relativePeriod === 'all' || !input.relativePeriod) {
    return { fromDate: null, toDate: null }
  }

  const now = new Date()
  let fromDate: Date

  switch (input.relativePeriod) {
    case '7d':
      fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case '1m':
      fromDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())
      break
    case '3m':
      fromDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())
      break
    case '1y':
      fromDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())
      break
    default:
      return { fromDate: null, toDate: null }
  }

  return { fromDate, toDate: now }
}

export function buildDateFilter(
  fromDate: Date | null,
  toDate: Date | null,
): Prisma.DateTimeFilter | undefined {
  if (!fromDate && !toDate) return undefined

  const filter: Prisma.DateTimeFilter = {}
  if (fromDate) filter.gte = fromDate
  if (toDate) filter.lte = toDate

  return filter
}

export async function collectUserImageUrls(
  userId: string,
  tx: TransactionClient,
): Promise<string[]> {
  const imageUrls: string[] = []

  const userProfile = await tx.userProfile.findUnique({
    where: { userId },
    select: { avatarUrl: true, id: true },
  })

  if (userProfile?.avatarUrl) {
    imageUrls.push(userProfile.avatarUrl)
  }

  if (userProfile?.id) {
    const progressLogs = await tx.bodyProgressLog.findMany({
      where: { userProfileId: userProfile.id },
      select: { image1Url: true, image2Url: true, image3Url: true },
    })

    for (const log of progressLogs) {
      if (log.image1Url) imageUrls.push(log.image1Url)
      if (log.image2Url) imageUrls.push(log.image2Url)
      if (log.image3Url) imageUrls.push(log.image3Url)
    }
  }

  const messages = await tx.message.findMany({
    where: {
      chat: {
        OR: [{ trainerId: userId }, { clientId: userId }],
      },
      imageUrl: { not: null },
    },
    select: { imageUrl: true },
  })

  for (const message of messages) {
    if (message.imageUrl) imageUrls.push(message.imageUrl)
  }

  return imageUrls
}

export async function deleteUserImages(imageUrls: string[]): Promise<void> {
  if (imageUrls.length === 0) return

  const result = await ImageHandler.delete({ images: imageUrls })
  if (!result.success) {
    console.error('Failed to delete some user images from S3:', result.error)
  }
}

export async function cancelUserStripeSubscriptionsImmediately(
  userId: string,
): Promise<void> {
  try {
    const activeSubscriptions = await prisma.userSubscription.findMany({
      where: {
        userId,
        status: {
          in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.CANCELLED_ACTIVE],
        },
        stripeSubscriptionId: { not: null },
      },
    })

    for (const subscription of activeSubscriptions) {
      if (subscription.stripeSubscriptionId) {
        try {
          await stripe.subscriptions.cancel(subscription.stripeSubscriptionId, {
            prorate: true,
          })
          console.info(
            `Cancelled Stripe subscription ${subscription.stripeSubscriptionId} immediately`,
          )
        } catch (stripeError) {
          console.error(
            `Failed to cancel Stripe subscription ${subscription.stripeSubscriptionId}:`,
            stripeError,
          )
        }
      }
    }
  } catch (error) {
    console.error('Error cancelling user Stripe subscriptions:', error)
  }
}
