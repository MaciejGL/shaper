import Stripe from 'stripe'

import { prisma } from '@/lib/db'

export async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  try {
    const offerToken = session.metadata?.offerToken

    if (!offerToken) {
      console.info('No offer token found in expired checkout session metadata')
      return
    }

    const offer = await findOfferByToken(offerToken)

    if (!offer) {
      console.warn(`Offer not found for token: ${offerToken}`)
      return
    }

    // Only reset if the offer is currently in processing status
    if (offer.status === 'PROCESSING') {
      await resetOfferToPending(offer.id, offerToken)
    } else {
      console.info(
        `Offer ${offerToken} status is ${offer.status}, no reset needed`,
      )
    }
  } catch (error) {
    console.error('Error handling checkout expired:', error)
  }
}

async function findOfferByToken(token: string) {
  return await prisma.trainerOffer.findUnique({
    where: { token },
  })
}

async function resetOfferToPending(offerId: string, offerToken: string) {
  console.info(
    `🔄 Resetting offer ${offerToken} back to PENDING after checkout session expired`,
  )

  await prisma.trainerOffer.update({
    where: { id: offerId },
    data: {
      status: 'PENDING',
      updatedAt: new Date(),
    },
  })

  console.info(
    `🔄 Reset offer ${offerToken} back to PENDING after checkout session expired`,
  )
}
