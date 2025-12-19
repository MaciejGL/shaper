import Stripe from 'stripe'

import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { captureServerException } from '@/lib/posthog-server'

/**
 * Handles checkout.session.expired webhook
 * When client doesn't complete payment, mark offer as expired and notify trainer
 */
export async function handleCheckoutExpired(session: Stripe.Checkout.Session) {
  try {
    const offerToken = session.metadata?.offerToken

    if (!offerToken) {
      console.info('No offer token found in expired checkout session metadata')
      return
    }

    const offer = await prisma.trainerOffer.findUnique({
      where: { token: offerToken },
      include: {
        trainer: { include: { profile: true } },
      },
    })

    if (!offer) {
      console.warn(`Offer not found for token: ${offerToken}`)
      return
    }

    // Only mark as expired if the offer is currently in processing status
    if (offer.status === 'PROCESSING') {
      await prisma.trainerOffer.update({
        where: { id: offer.id },
        data: {
          status: 'EXPIRED',
          updatedAt: new Date(),
        },
      })

      console.info(
        `⏰ Marked offer ${offerToken} as EXPIRED - checkout session expired without payment`,
      )

      // Notify trainer that their offer expired unpaid
      if (offer.trainer.email) {
        try {
          const packageSummary = offer.packageSummary as
            | {
                packageId: string
                quantity: number
                name: string
              }[]
            | null

          const bundleDescription =
            packageSummary && packageSummary.length > 0
              ? packageSummary.map((p) => `${p.quantity}x ${p.name}`).join(', ')
              : 'Training package'

          // Note: Add this email template or skip notification for now
          console.info(
            `📧 TODO: Send offer expired notification to trainer ${offer.trainer.email}`,
            {
              clientEmail: offer.clientEmail,
              bundleDescription,
              expiresAt: offer.expiresAt,
            },
          )

          await sendEmail.offerExpired(offer.trainer.email, {
            trainerName:
              offer.trainer.profile?.firstName ||
              offer.trainer.name ||
              'Trainer',
            clientEmail: offer.clientEmail,
            bundleDescription,
            expiresAt: offer.expiresAt.toLocaleDateString(),
          })
        } catch (emailError) {
          console.error(
            'Failed to send offer expired notification:',
            emailError,
          )
        }
      }
    } else {
      console.info(
        `Offer ${offerToken} status is ${offer.status}, no action needed`,
      )
    }
  } catch (error) {
    console.error('Error handling checkout expired:', error)
    const err = error instanceof Error ? error : new Error(String(error))
    captureServerException(err, undefined, {
      webhook: 'checkout-expired',
      sessionId: session.id,
    })
  }
}
