import { GraphQLError } from 'graphql'

import { sendPushNotificationToUsers } from '@/app/actions/push-notifications'
import {
  GQLNotificationType,
  GQLQueryGetClientTrainerOffersArgs,
  GQLTrainerOfferStatus,
} from '@/generated/graphql-server'
import {
  Prisma,
  ServiceDelivery as PrismaServiceDelivery,
  ServiceTask as PrismaServiceTask,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import { createNotification } from '../notification/factory'

import TrainerOffer from './model'

/**
 * Get trainer offers for a specific client and trainer relationship
 */
export async function getClientTrainerOffers(
  args: GQLQueryGetClientTrainerOffersArgs,
  context: GQLContext,
) {
  if (!context.user?.user) {
    throw new Error('Authentication required')
  }

  const { clientEmail, trainerId, status } = args
  const currentUserId = context.user.user.id

  // Only allow access if the current user is the client (by email match)
  // or if they're the trainer
  const currentUser = await prisma.user.findUnique({
    where: { id: currentUserId },
    select: { email: true },
  })

  if (!currentUser) {
    throw new Error('User not found')
  }

  const isClient = currentUser.email === clientEmail
  const isTrainer = currentUserId === trainerId

  if (!isClient && !isTrainer) {
    throw new Error('Unauthorized: Can only access your own offers')
  }

  // Build where clause
  const where: Prisma.TrainerOfferWhereInput = {
    trainerId,
    clientEmail,
  }

  // Handle status filter - can be array of statuses
  if (status && Array.isArray(status) && status.length > 0) {
    if (status.length === 1) {
      where.status = status[0] as string
    } else {
      // For multiple statuses, use OR condition
      where.OR = status.map((s: string) => ({ status: s }))
    }
  } else if (isClient) {
    // For clients without status filter, only show paid offers
    where.status = 'PAID'
  }

  const offers = await prisma.trainerOffer.findMany({
    where,
    include: {
      trainer: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // For paid offers, we need to manually link service deliveries via stripePaymentIntentId
  const enrichedOffers = await Promise.all(
    offers.map(async (offer) => {
      if (offer.status === 'PAID') {
        let serviceDeliveries: (PrismaServiceDelivery & {
          tasks: PrismaServiceTask[]
        })[] = []

        if (offer.stripePaymentIntentId) {
          // Try to find service deliveries by payment intent ID (payment mode)
          serviceDeliveries = await prisma.serviceDelivery.findMany({
            where: {
              stripePaymentIntentId: offer.stripePaymentIntentId,
            },
            include: {
              tasks: {
                orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
              },
            },
          })
        }

        // If no deliveries found with payment intent, try with checkout session ID (subscription mode)
        if (serviceDeliveries.length === 0 && offer.stripeCheckoutSessionId) {
          serviceDeliveries = await prisma.serviceDelivery.findMany({
            where: {
              stripePaymentIntentId: offer.stripeCheckoutSessionId,
            },
            include: {
              tasks: {
                orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
              },
            },
          })
        }

        return {
          ...offer,
          serviceDeliveries,
        }
      }

      return {
        ...offer,
        serviceDeliveries: [],
      }
    }),
  )

  return enrichedOffers.map((offer) => new TrainerOffer(offer, context))
}

/**
 * Reject a trainer offer (client declines the offer)
 */
export async function rejectTrainerOffer(
  offerId: string,
  reason: string | null,
  context: GQLContext,
) {
  if (!context.user?.user) {
    throw new GraphQLError('Authentication required')
  }

  const currentUserId = context.user.user.id

  try {
    // Find the offer
    const offer = await prisma.trainerOffer.findUnique({
      where: { id: offerId },
      include: {
        trainer: {
          include: {
            profile: true,
          },
        },
      },
    })

    if (!offer) {
      throw new GraphQLError('Offer not found')
    }

    // Verify the current user is the client (by email match)
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      select: { email: true, profile: true },
    })

    if (!currentUser) {
      throw new GraphQLError('User not found')
    }

    if (currentUser.email !== offer.clientEmail) {
      throw new GraphQLError(
        'Unauthorized: You can only decline your own offers',
      )
    }

    // Verify offer is in a state that can be declined
    if (
      offer.status !== GQLTrainerOfferStatus.Pending &&
      offer.status !== GQLTrainerOfferStatus.Processing
    ) {
      throw new GraphQLError(
        'This offer cannot be declined - it has already been processed or cancelled',
      )
    }

    // Update offer status to CANCELLED
    const updatedOffer = await prisma.trainerOffer.update({
      where: { id: offerId },
      data: {
        status: GQLTrainerOfferStatus.Cancelled,
      },
      include: {
        trainer: {
          include: {
            profile: true,
          },
        },
      },
    })

    // Get client name for notification
    const clientName =
      currentUser.profile?.firstName && currentUser.profile?.lastName
        ? `${currentUser.profile.firstName} ${currentUser.profile.lastName}`
        : currentUser.email

    // Determine notification message
    const notificationMessage = reason
      ? `${clientName} has declined your training offer. Reason: "${reason}"`
      : `${clientName} has declined your training offer.`

    // Create in-app notification for trainer
    await createNotification(
      {
        userId: offer.trainerId,
        createdBy: currentUserId,
        type: GQLNotificationType.System, // Using SYSTEM for now, could add OFFER_DECLINED
        message: notificationMessage,
        link: '/trainer/dashboard',
        relatedItemId: offerId,
      },
      context,
    )

    // Send push notification to trainer
    const pushTitle = 'Offer Declined'
    const pushBody = reason
      ? `${clientName} declined your offer: ${reason}`
      : `${clientName} declined your training offer`

    await sendPushNotificationToUsers(
      [offer.trainerId],
      pushTitle,
      pushBody,
      '/trainer/dashboard',
    )

    return new TrainerOffer(updatedOffer, context)
  } catch (error) {
    console.error(`[TrainerOffer] Error rejecting offer: ${error}`)
    throw new GraphQLError(
      error instanceof GraphQLError
        ? error.message
        : 'Something went wrong while declining the offer. Please try again.',
    )
  }
}
