import Stripe from 'stripe'

import { generateTasks } from '@/constants/task-templates'
import { PackageTemplate, Prisma, ServiceType } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { User } from '@/lib/getUser'
import { stripe } from '@/lib/stripe/stripe'

import { StripeServiceType } from '../../enums'
import {
  findPackageByStripePriceId,
  findUserByStripeCustomerId,
} from '../utils/shared'

export async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
) {
  try {
    console.info(`handleCheckoutCompleted`, session)

    if (!session.customer) {
      console.error(`No customer found in checkout session: ${session.id}`)
      return
    }

    const customerId = session.customer as string
    const user = await findUserByStripeCustomerId(customerId)

    if (!user) {
      console.error(`User not found for checkout session: ${session.id}`)
      return
    }

    const offerToken = session.metadata?.offerToken
    const trainerId = session.metadata?.trainerId

    // Use invoice-first approach for both subscription and payment modes
    if (session.invoice) {
      await handleInvoiceBasedCheckout(session, user, offerToken, trainerId)
    }
    // Fallback for payment mode without invoice (rare edge case)
    else if (session.mode === 'payment' && session.payment_intent) {
      await handlePaymentCheckout(session, user, offerToken, trainerId)
    } else {
      console.warn(
        `No invoice found and unsupported checkout mode: ${session.mode} for session ${session.id}`,
      )
    }
  } catch (error) {
    console.error('Error handling checkout completed:', error)
  }
}

async function handleInvoiceBasedCheckout(
  session: Stripe.Checkout.Session,
  user: User,
  offerToken?: string,
  trainerId?: string,
) {
  console.info(`📦 Processing invoice-based checkout: ${session.id}`)

  // Get payment intent ID based on mode
  const paymentIntentId =
    session.mode === 'subscription'
      ? session.id // Use session ID for subscription mode
      : (session.payment_intent as string)

  // Process all items from trainer offer (more reliable than parsing invoice)
  const deliveryTasks = await createDeliveriesFromTrainerOffer(
    session,
    { id: paymentIntentId },
    user,
    offerToken,
    trainerId,
  )

  // Mark offer as completed
  if (offerToken) {
    await markOfferCompleted(
      offerToken,
      session.id,
      session.mode as 'subscription' | 'payment',
      session.mode === 'payment' ? paymentIntentId : undefined,
    )
  }

  console.info(
    `✅ ${session.mode} processed: ${user.email} → ${deliveryTasks.length} delivery tasks created`,
  )
}

// Create deliveries from trainer offer package summary (most reliable approach)
async function createDeliveriesFromTrainerOffer(
  session: Stripe.Checkout.Session,
  paymentIntent: { id: string },
  user: User,
  offerToken?: string,
  trainerId?: string,
) {
  const deliveryTasks: Awaited<
    ReturnType<typeof createSingleServiceDelivery>
  >[] = []

  if (!offerToken) {
    console.error('No offer token provided for trainer offer lookup')
    return deliveryTasks
  }

  try {
    // Get trainer offer with package summary
    const trainerOffer = await prisma.trainerOffer.findUnique({
      where: { token: offerToken },
    })

    if (!trainerOffer) {
      console.error(`Trainer offer not found for token: ${offerToken}`)
      return deliveryTasks
    }

    // Parse package summary from offer
    const packageSummary = trainerOffer.packageSummary as {
      name: string
      quantity: number
      packageId: string
      description: string
      stripePriceId: string
    }[]

    if (!packageSummary || !Array.isArray(packageSummary)) {
      console.error('No package summary found in trainer offer metadata')
      return deliveryTasks
    }

    console.info(
      `📋 Processing ${packageSummary.length} packages from trainer offer`,
    )

    // Create deliveries for each package in the summary
    for (const packageItem of packageSummary) {
      const packageTemplate = await prisma.packageTemplate.findUnique({
        where: { id: packageItem.packageId },
      })

      if (!packageTemplate) {
        console.error(
          `Package template not found for ID: ${packageItem.packageId}`,
        )
        continue
      }

      const finalTrainerId = trainerId || packageTemplate.trainerId || undefined

      if (finalTrainerId) {
        // Create individual deliveries for each quantity
        for (let i = 0; i < packageItem.quantity; i++) {
          const deliveryNumber = packageItem.quantity > 1 ? i + 1 : undefined

          const deliveryTask = await createSingleServiceDelivery({
            stripePaymentIntentId: paymentIntent.id,
            trainerId: finalTrainerId,
            clientId: user.id,
            packageTemplate,
            deliveryNumber,
            metadata: {
              checkoutSessionId: session.id,
              offerToken: offerToken,
              packageId: packageItem.packageId,
              originalStripePriceId: packageItem.stripePriceId,
              mode: session.mode,
              fromTrainerOffer: true,
              deliveryIndex: i + 1,
              totalQuantity: packageItem.quantity,
            },
          })

          if (deliveryTask) {
            deliveryTasks.push(deliveryTask)
            console.info(
              `📋 Created delivery ${i + 1}/${packageItem.quantity}: ${deliveryTask.serviceType} for ${packageTemplate.name} (Trainer: ${finalTrainerId})`,
            )
          }
        }
      }
    }
  } catch (error) {
    console.error('Error processing trainer offer package summary:', error)
  }

  return deliveryTasks
}

async function handlePaymentCheckout(
  session: Stripe.Checkout.Session,
  user: User,
  offerToken?: string,
  trainerId?: string,
) {
  console.info(`📦 Processing payment mode checkout: ${session.id}`)

  // Get payment intent for reference
  const paymentIntent = await stripe.paymentIntents.retrieve(
    session.payment_intent as string,
  )

  // Use trainer offer approach for payment mode as well
  let deliveryTasks = []

  if (offerToken) {
    // Use trainer offer (most reliable)
    deliveryTasks = await createDeliveriesFromTrainerOffer(
      session,
      paymentIntent,
      user,
      offerToken,
      trainerId,
    )
  } else {
    // Fallback to session line items for non-offer purchases
    const lineItems = session.line_items?.data || []
    if (lineItems.length > 0) {
      deliveryTasks = await createServiceDeliveriesForPayment(
        lineItems,
        session,
        paymentIntent,
        user,
        offerToken,
        trainerId,
      )
    } else {
      console.error(
        'No offer token and no line items found in checkout session',
      )
      return
    }
  }

  // Mark offer as completed for payment mode
  if (offerToken) {
    await markOfferCompleted(
      offerToken,
      session.id,
      'payment',
      paymentIntent.id,
    )
  }

  console.info(
    `✅ Payment processed: ${user.email} → ${deliveryTasks.length} delivery tasks created (${paymentIntent.amount / 100} ${paymentIntent.currency.toUpperCase()})`,
  )
}

async function createServiceDeliveriesForPayment(
  lineItems: Stripe.LineItem[],
  session: Stripe.Checkout.Session,
  paymentIntent: Stripe.PaymentIntent,
  user: User,
  offerToken?: string,
  trainerId?: string,
) {
  const deliveryTasks: Awaited<
    ReturnType<typeof createSingleServiceDelivery>
  >[] = []

  for (const lineItem of lineItems) {
    const priceId = lineItem.price?.id
    const quantity = lineItem.quantity || 1

    if (!priceId) {
      console.error(`No price ID found for line item`)
      continue
    }

    const packageTemplate = await findPackageByStripePriceId(priceId)

    if (!packageTemplate) {
      console.error(`Package not found for price: ${priceId}`)
      continue
    }

    // Determine trainer ID (from offer or package)
    const finalTrainerId = trainerId || packageTemplate.trainerId || undefined

    if (finalTrainerId) {
      // Create individual deliveries for each quantity
      for (let i = 0; i < quantity; i++) {
        const deliveryNumber = quantity > 1 ? i + 1 : undefined

        const deliveryTask = await createSingleServiceDelivery({
          stripePaymentIntentId: paymentIntent.id,
          trainerId: finalTrainerId,
          clientId: user.id,
          packageTemplate,
          deliveryNumber,
          metadata: {
            checkoutSessionId: session.id,
            offerToken: offerToken || null,
            stripePriceId: priceId,
            lineItemIndex: lineItems.indexOf(lineItem),
            mode: 'payment',
            deliveryIndex: i + 1,
            totalQuantity: quantity,
          },
        })

        if (deliveryTask) {
          deliveryTasks.push(deliveryTask)
          console.info(
            `📋 Created payment delivery ${i + 1}/${quantity}: ${deliveryTask.serviceType} for ${packageTemplate.name} (Trainer: ${finalTrainerId})`,
          )
        }
      }
    }
  }

  return deliveryTasks
}

async function createSingleServiceDelivery({
  stripePaymentIntentId,
  trainerId,
  clientId,
  packageTemplate,
  metadata,
  deliveryNumber,
}: {
  stripePaymentIntentId: string
  trainerId: string
  clientId: string
  packageTemplate: PackageTemplate
  metadata: Record<string, unknown>
  deliveryNumber?: number
}) {
  try {
    // Get service types from package metadata
    const packageMetadata = packageTemplate.metadata as Record<string, unknown>
    const serviceTypeString = packageMetadata?.service_type as string

    // Map string to ServiceType enum
    const serviceType = (() => {
      switch (serviceTypeString) {
        case StripeServiceType.COACHING_COMPLETE:
          return ServiceType.COACHING_COMPLETE
        case StripeServiceType.WORKOUT_PLAN:
          return ServiceType.WORKOUT_PLAN
        case StripeServiceType.MEAL_PLAN:
          return ServiceType.MEAL_PLAN
        case StripeServiceType.IN_PERSON_MEETING:
          return ServiceType.IN_PERSON_MEETING
        case StripeServiceType.PREMIUM_ACCESS:
          return ServiceType.PREMIUM_ACCESS
        default:
          return null // Default service type
      }
    })()

    if (!serviceType) {
      console.error(
        `[createSingleServiceDelivery] No service type found for package: ${packageTemplate.name} variables: 
        {
        priceId: ${packageTemplate.stripePriceId}, 
        serviceTypeString: ${serviceTypeString}, 
        packageMetadata: ${JSON.stringify(packageMetadata)},
        stripePaymentIntentId: ${stripePaymentIntentId},
        trainerId: ${trainerId},
        clientId: ${clientId},
        packageTemplate: ${JSON.stringify(packageTemplate)},
        metadata: ${JSON.stringify(metadata)}
        }`,
      )
      return null
    }

    // Create delivery and tasks in transaction
    return await prisma.$transaction(async (tx) => {
      // Create service delivery (always quantity = 1)
      const packageName = deliveryNumber
        ? `${packageTemplate.name}`
        : packageTemplate.name

      const delivery = await tx.serviceDelivery.create({
        data: {
          stripePaymentIntentId,
          trainerId,
          clientId,
          serviceType,
          packageName,
          quantity: 1, // Always 1 for individual deliveries
          status: 'PENDING',
          metadata: metadata as Prisma.InputJsonValue,
        },
      })

      // Generate and create tasks (no quantity needed since it's always 1)
      const taskData = generateTasks(delivery.id, serviceType)
      if (taskData.length > 0) {
        await tx.serviceTask.createMany({ data: taskData })
        console.info(`📋 Generated ${taskData.length} tasks for ${serviceType}`)
      }

      return delivery
    })
  } catch (error) {
    console.error('Failed to create service delivery:', error)
    return null
  }
}

async function markOfferCompleted(
  offerToken: string,
  sessionId: string,
  mode: 'subscription' | 'payment',
  paymentIntentId?: string,
) {
  try {
    const updateData: Prisma.TrainerOfferUpdateInput = {
      status: 'PAID',
      completedAt: new Date(),
      stripeCheckoutSessionId: sessionId,
    }

    if (mode === 'payment' && paymentIntentId) {
      updateData.stripePaymentIntentId = paymentIntentId
    }

    await prisma.trainerOffer.update({
      where: { token: offerToken },
      data: updateData,
    })

    console.info(`🎯 Marked trainer offer ${offerToken} as PAID (${mode} mode)`)
  } catch (error) {
    console.error('Failed to mark offer as completed:', error)
  }
}
