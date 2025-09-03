import { GQLQueryGetClientTrainerOffersArgs } from '@/generated/graphql-server'
import {
  Prisma,
  ServiceDelivery as PrismaServiceDelivery,
  ServiceTask as PrismaServiceTask,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

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

  if (status) {
    where.status = status
  }

  // For clients, only show paid offers (what they actually purchased)
  if (isClient && !status) {
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
