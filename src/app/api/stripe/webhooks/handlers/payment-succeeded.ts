import Stripe from 'stripe'

import { generateTasks } from '@/constants/task-templates'
import {
  Prisma,
  ServiceType,
  SubscriptionStatus,
  UserSubscription,
} from '@/generated/prisma/client'
import { prisma } from '@/lib/db'

import { StripeServiceType } from '../../enums'

// Extend Stripe Invoice type to include subscription field that exists in API
interface InvoiceWithSubscription extends Stripe.Invoice {
  subscription?: string | null
}

export async function handlePaymentSucceeded(invoice: InvoiceWithSubscription) {
  try {
    // Extract subscription ID from invoice
    let subscriptionId: string | null = null

    // Method 1: Direct subscription field (most common for subscription invoices)
    if (invoice.subscription) {
      subscriptionId = invoice.subscription
    }

    // Method 2: Fallback to line items if subscription not directly on invoice
    if (!subscriptionId && invoice.lines?.data?.length > 0) {
      for (const lineItem of invoice.lines.data) {
        if (lineItem.subscription) {
          subscriptionId =
            typeof lineItem.subscription === 'string'
              ? lineItem.subscription
              : lineItem.subscription.id
          break
        }
      }
    }

    if (!subscriptionId) {
      console.info(
        `No subscription found in invoice ${invoice.id} - this is likely a manual invoice`,
      )
      return
    }

    const subscription = await findSubscriptionById(subscriptionId)

    if (!subscription) {
      console.warn(`Subscription not found in database: ${subscriptionId}`)
      return
    }

    await updateSubscriptionAfterPayment(subscription, invoice)

    // Create new service delivery for COACHING_COMPLETE subscriptions
    await createRecurringServiceDelivery(subscription, invoice)

    console.info(
      `✅ Payment processed for subscription ${subscriptionId} (invoice: ${invoice.id})`,
    )
  } catch (error) {
    console.error('Error handling payment succeeded:', error)
  }
}

async function findSubscriptionById(stripeSubscriptionId: string) {
  return await prisma.userSubscription.findFirst({
    where: { stripeSubscriptionId },
  })
}

async function updateSubscriptionAfterPayment(
  subscription: UserSubscription,
  invoice: Stripe.Invoice,
) {
  // Prepare update data
  const updateData: Prisma.UserSubscriptionUpdateInput = {
    status: SubscriptionStatus.ACTIVE,

    // Clear grace period and reset retry count
    isInGracePeriod: false,
    gracePeriodEnd: null,
    failedPaymentRetries: 0,
    lastPaymentAttempt: new Date(),
  }

  // DON'T update endDate for trial subscriptions
  // Trial invoice period_end is the same as period_start (setup date)
  // The subscription.created webhook already set the correct trial endDate
  const invoicePeriodEnd = invoice.period_end
  if (!subscription.isTrialActive && invoicePeriodEnd) {
    updateData.endDate = new Date(invoicePeriodEnd * 1000)
  }

  await prisma.userSubscription.update({
    where: { id: subscription.id },
    data: updateData,
  })
}

/**
 * Creates a new service delivery for recurring COACHING_COMPLETE subscriptions
 * when a monthly payment succeeds
 */
async function createRecurringServiceDelivery(
  subscription: UserSubscription,
  invoice: Stripe.Invoice,
) {
  try {
    // Only create deliveries for COACHING_COMPLETE services
    const packageTemplate = await prisma.packageTemplate.findUnique({
      where: { id: subscription.packageId },
    })

    if (!packageTemplate) {
      console.error(
        `Package template not found for subscription: ${subscription.id}`,
      )
      return
    }

    // Check if this package is COACHING_COMPLETE
    const packageMetadata = packageTemplate.metadata as Record<string, unknown>
    const serviceTypeString = packageMetadata?.service_type as string

    if (serviceTypeString !== StripeServiceType.COACHING_COMPLETE) {
      // Not a COACHING_COMPLETE service, no recurring delivery needed
      return
    }

    // Don't create delivery for the first payment (already handled by checkout.session.completed)
    // Check if this is a recurring payment by looking at billing reason
    if (invoice.billing_reason === 'subscription_create') {
      console.info(
        `Skipping delivery creation for initial subscription payment: ${subscription.id}`,
      )
      return
    }

    if (!subscription.trainerId) {
      console.error(
        `No trainer ID found for COACHING_COMPLETE subscription: ${subscription.id}`,
      )
      return
    }

    // Get current month/year for delivery naming
    const currentDate = new Date()
    const monthYear = currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    })

    // Create new service delivery and tasks in transaction
    await prisma.$transaction(async (tx) => {
      const delivery = await tx.serviceDelivery.create({
        data: {
          stripePaymentIntentId: invoice.id!, // Use invoice ID for recurring payments
          trainerId: subscription.trainerId!,
          clientId: subscription.userId,
          serviceType: ServiceType.COACHING_COMPLETE,
          packageName: `${packageTemplate.name} - ${monthYear}`,
          quantity: 1,
          status: 'PENDING',
          metadata: {
            subscriptionId: subscription.id,
            stripeSubscriptionId: subscription.stripeSubscriptionId,
            invoiceId: invoice.id,
            billingPeriodStart: invoice.period_start,
            billingPeriodEnd: invoice.period_end,
            recurringPayment: true,
            monthYear,
          } as Prisma.InputJsonValue,
        },
      })

      // Generate and create tasks for this delivery
      const taskData = generateTasks(delivery.id, ServiceType.COACHING_COMPLETE)
      if (taskData.length > 0) {
        await tx.serviceTask.createMany({ data: taskData })
        console.info(
          `📋 Generated ${taskData.length} tasks for recurring COACHING_COMPLETE delivery`,
        )
      }

      console.info(
        `✅ Created recurring service delivery for ${monthYear}: ${delivery.id} (Client: ${subscription.userId}, Trainer: ${subscription.trainerId})`,
      )
    })
  } catch (error) {
    console.error('Failed to create recurring service delivery:', error)
  }
}
