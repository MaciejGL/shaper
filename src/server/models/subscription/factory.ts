import {
  GQLDeliveryStatus,
  GQLQueryGetActivePackageTemplatesArgs,
  GQLQueryGetAllUsersWithSubscriptionsArgs,
  GQLQueryGetMyServiceDeliveriesArgs,
  GQLQueryGetTrainerDeliveriesArgs,
} from '@/generated/graphql-server'
import { ensureTrainerClientAccess } from '@/lib/access-control'
import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { sendEmail } from '@/lib/email/send-mail'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'
import { subscriptionValidator } from '@/lib/subscription/subscription-validator'
import { GQLContext } from '@/types/gql-context'

import UserSubscription from '../user-subscription/model'

import { PackageTemplate, ServiceDelivery } from './model'

// Service type priority for sorting (lower number = higher priority)
const SERVICE_TYPE_PRIORITY = {
  COACHING_COMPLETE: 1,
  WORKOUT_PLAN: 2,
  MEAL_PLAN: 3,
  IN_PERSON_MEETING: 4,
  PREMIUM_ACCESS: 5,
} as const

/**
 * Fast premium access check - uses local cache
 * Use this for UI/content access checks
 */
export async function checkPremiumAccess(
  context: GQLContext,
): Promise<boolean> {
  if (!context.user?.user) {
    return false
  }

  try {
    return await subscriptionValidator.hasPremiumAccess(context.user.user.id)
  } catch (error) {
    console.error('Error checking premium access:', error)
    return false
  }
}

/**
 * Critical premium access check - validates with Stripe
 * Use this for purchases, admin actions, etc.
 */
export async function checkCriticalPremiumAccess(
  context: GQLContext,
): Promise<boolean> {
  if (!context.user?.user) {
    return false
  }

  try {
    return await subscriptionValidator.validateCriticalAccess(
      context.user.user.id,
    )
  } catch (error) {
    console.error('Error checking critical premium access:', error)
    // Fallback to regular check if Stripe validation fails
    return checkPremiumAccess(context)
  }
}

/**
 * Get user's service deliveries (what trainers need to deliver to them)
 */
export async function getMyServiceDeliveries(
  args: GQLQueryGetMyServiceDeliveriesArgs,
  context: GQLContext,
) {
  if (!context.user?.user) {
    throw new Error('Authentication required')
  }

  const where = {
    clientId: context.user.user.id,
    // If statuses array is provided, filter by those statuses
    ...(args.statuses && args.statuses.length > 0
      ? { status: { in: args.statuses } }
      : {}),
  }

  const deliveries = await prisma.serviceDelivery.findMany({
    where,
    include: {
      tasks: true,
      trainer: {
        include: {
          profile: true,
        },
      },
    },
  })

  // Sort by service type priority, then by creation date (newest first)
  const sortedDeliveries = deliveries.sort((a, b) => {
    const priorityA = SERVICE_TYPE_PRIORITY[a.serviceType] || 999
    const priorityB = SERVICE_TYPE_PRIORITY[b.serviceType] || 999

    // Primary sort: by service type priority (lower number = higher priority)
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    // Secondary sort: by creation date (newest first)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })

  return sortedDeliveries.map(
    (delivery) => new ServiceDelivery(delivery, context),
  )
}

/**
 * Get trainer's deliveries to manage
 */
export async function getTrainerDeliveries(
  args: GQLQueryGetTrainerDeliveriesArgs,
  context: GQLContext,
) {
  // Verify trainer access
  const requestingUserId = context.user?.user.id
  if (!requestingUserId) {
    throw new Error('Authentication required')
  }

  // Allow trainers to view their own deliveries or team members' deliveries
  if (requestingUserId !== args.trainerId) {
    // Check if requesting user is a team owner and the trainerId is a team member
    const teamMembership = await prisma.teamMember.findFirst({
      where: {
        userId: args.trainerId,
        team: {
          members: {
            some: {
              userId: requestingUserId,
            },
          },
        },
      },
    })

    if (!teamMembership) {
      throw new Error(
        'Unauthorized: Can only view your own deliveries or team members deliveries',
      )
    }
  }

  const where = {
    trainerId: args.trainerId,
    // If statuses array is provided, filter by those statuses
    ...(args.statuses && args.statuses.length > 0
      ? { status: { in: args.statuses } }
      : {}),
  }

  const deliveries = await prisma.serviceDelivery.findMany({
    where,
    include: {
      tasks: {
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      },
      client: {
        include: {
          profile: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' }, // Initial sort by creation date
  })

  // Sort by service type priority, then by creation date (newest first)
  const sortedDeliveries = deliveries.sort((a, b) => {
    const priorityA = SERVICE_TYPE_PRIORITY[a.serviceType] || 999
    const priorityB = SERVICE_TYPE_PRIORITY[b.serviceType] || 999

    // Primary sort: by service type priority (lower number = higher priority)
    if (priorityA !== priorityB) {
      return priorityA - priorityB
    }

    // Secondary sort: by creation date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return sortedDeliveries.map(
    (delivery) => new ServiceDelivery(delivery, context),
  )
}

/**
 * Update service delivery status
 */
export async function updateServiceDelivery(
  deliveryId: string,
  status: GQLDeliveryStatus,
  notes: string | undefined | null,
  context: GQLContext,
) {
  if (!context.user?.user) {
    throw new Error('Authentication required')
  }

  // Find the delivery and verify trainer ownership
  const delivery = await prisma.serviceDelivery.findUnique({
    where: { id: deliveryId },
    include: { tasks: true },
  })

  if (!delivery) {
    throw new Error('Service delivery not found')
  }

  // Only the assigned trainer can update the delivery
  if (delivery.trainerId !== context.user.user.id) {
    throw new Error(
      'Unauthorized: Only the assigned trainer can update this delivery',
    )
  }

  const updateData: {
    status: GQLDeliveryStatus
    updatedAt: Date
    deliveredAt?: Date
    deliveryNotes?: string | null
  } = {
    status,
    updatedAt: new Date(),
  }

  // Set deliveredAt when marking as completed
  if (status === 'COMPLETED') {
    updateData.deliveredAt = new Date()
  }

  // Update notes if provided
  if (notes !== undefined) {
    updateData.deliveryNotes = notes
  }

  // When marking delivery as completed, also complete all pending tasks
  if (status === 'COMPLETED' && delivery.tasks.length > 0) {
    const pendingTaskIds = delivery.tasks
      .filter((t) => t.status !== 'COMPLETED' && t.status !== 'CANCELLED')
      .map((t) => t.id)

    if (pendingTaskIds.length > 0) {
      await prisma.serviceTask.updateMany({
        where: { id: { in: pendingTaskIds } },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      })

      console.info(
        `✅ Auto-completed ${pendingTaskIds.length} tasks for delivery ${deliveryId}`,
      )
    }
  }

  const updatedDelivery = await prisma.serviceDelivery.update({
    where: { id: deliveryId },
    data: updateData,
    include: {
      tasks: {
        orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
      },
      trainer: {
        include: {
          profile: true,
        },
      },
      client: {
        include: {
          profile: true,
        },
      },
    },
  })

  return new ServiceDelivery(updatedDelivery, context)
}

/**
 * Get active package templates for subscription options
 */
export async function getActivePackageTemplates(
  args: GQLQueryGetActivePackageTemplatesArgs,
  context: GQLContext,
) {
  const where = {
    isActive: true,
    ...(args.trainerId && { trainerId: args.trainerId }),
  }

  const packages = await prisma.packageTemplate.findMany({
    where,
    orderBy: [
      { duration: 'asc' }, // Monthly first, then yearly
      { createdAt: 'desc' },
    ],
  })

  // Map packages to include computed serviceType from metadata
  return packages.map((pkg) => new PackageTemplate(pkg, context))
}

/**
 * Admin: Get all users with their subscription status
 */
export async function getAllUsersWithSubscriptions(
  args: GQLQueryGetAllUsersWithSubscriptionsArgs,
) {
  // Require admin access
  await requireAdminUser()

  const limit = args.limit || 50
  const offset = args.offset || 0

  // Build search filter
  const searchFilter = args.searchQuery
    ? {
        OR: [
          {
            email: { contains: args.searchQuery, mode: 'insensitive' as const },
          },
          {
            name: { contains: args.searchQuery, mode: 'insensitive' as const },
          },
        ],
      }
    : {}

  // Get users with their active subscriptions
  const [users, totalCount] = await Promise.all([
    prisma.user.findMany({
      where: searchFilter,
      include: {
        subscriptions: {
          where: { status: 'ACTIVE' },
          orderBy: { createdAt: 'desc' },
          take: 1, // Get the most recent active subscription
        },
        profile: true,
      },
      take: limit,
      skip: offset,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where: searchFilter }),
  ])

  const usersWithSubscriptions = users.map((user) => {
    const activeSubscription = user.subscriptions[0] || null

    return {
      id: user.id,
      email: user.email,
      name: user.name || user.profile?.firstName || null,
      role: user.role,
      hasActiveSubscription: !!activeSubscription,
      subscription: activeSubscription
        ? new UserSubscription(activeSubscription)
        : null,
      createdAt: user.createdAt.toISOString(),
    }
  })

  return {
    users: usersWithSubscriptions,
    totalCount,
  }
}

/**
 * Admin: Get subscription statistics
 */
export async function getSubscriptionStats() {
  // Require admin access
  await requireAdminUser()

  const [
    totalUsers,
    usersWithActiveSubscriptions,
    usersWithExpiredSubscriptions,
    totalLifetimeSubscriptions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        subscriptions: {
          some: {
            status: 'ACTIVE',
            endDate: { gt: new Date() },
          },
        },
      },
    }),
    prisma.user.count({
      where: {
        subscriptions: {
          some: {
            OR: [{ status: 'EXPIRED' }, { endDate: { lt: new Date() } }],
          },
        },
      },
    }),
    prisma.userSubscription.count({
      where: {
        endDate: { gt: new Date('2099-01-01') }, // Lifetime subs have far future end date
        status: 'ACTIVE',
      },
    }),
  ])

  const usersWithoutSubscriptions =
    totalUsers - usersWithActiveSubscriptions - usersWithExpiredSubscriptions

  return {
    totalUsers,
    usersWithActiveSubscriptions,
    usersWithExpiredSubscriptions,
    usersWithoutSubscriptions,
    totalLifetimeSubscriptions,
  }
}

/**
 * Admin: Give lifetime premium subscription to a user
 */
export async function giveLifetimePremium(
  userId: string,
  _context: GQLContext,
) {
  // Require admin access
  await requireAdminUser()

  // Check if user exists
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    throw new Error('User not found')
  }

  // Get or create a premium package template
  let premiumPackage = await prisma.packageTemplate.findFirst({
    where: {
      name: 'Lifetime Premium',
      isActive: true,
    },
  })

  if (!premiumPackage) {
    // Create a lifetime premium package
    premiumPackage = await prisma.packageTemplate.create({
      data: {
        name: 'Lifetime Premium',
        description: 'Lifetime premium access - Admin granted',
        duration: 'YEARLY', // Doesn't matter for lifetime
        isActive: true,
        metadata: {
          serviceType: 'PREMIUM_ACCESS',
          isLifetime: true,
        },
      },
    })
  }

  // Cancel any existing active subscriptions
  await prisma.userSubscription.updateMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
    data: {
      status: 'CANCELLED',
    },
  })

  // Create lifetime subscription (far future end date)
  const lifetimeEndDate = new Date('2099-12-31T23:59:59.999Z')

  const newSubscription = await prisma.userSubscription.create({
    data: {
      userId,
      packageId: premiumPackage.id,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: lifetimeEndDate,
      mockPaymentStatus: 'COMPLETED',
      mockTransactionId: `admin-lifetime-${Date.now()}`,
    },
  })

  return new UserSubscription(newSubscription)
}

/**
 * Admin: Remove user subscription
 */
export async function removeUserSubscription(userId: string) {
  // Require admin access
  await requireAdminUser()

  // Cancel all active subscriptions for the user
  const result = await prisma.userSubscription.updateMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
    data: {
      status: 'CANCELLED',
    },
  })

  return result.count > 0
}

/**
 * Trainer: Pause client's coaching subscription
 *
 * Stores `pausedAt` and `pausedPeriodEnd` in Stripe metadata so we can
 * compute shifted billing on resume (credit the paused days).
 */
export async function pauseClientCoachingSubscription(
  clientId: string,
  context: GQLContext,
) {
  const userId = context.user?.user.id
  if (!userId) {
    throw new Error('Authentication required')
  }

  // Verify trainer has permission to pause this client's subscription
  await ensureTrainerClientAccess(userId, clientId)

  // Find client's coaching subscription
  const coachingSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId: clientId,
      trainerId: userId,
      status: 'ACTIVE',
      package: {
        stripeLookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
      },
    },
    include: { package: true },
  })

  if (!coachingSubscription?.stripeSubscriptionId) {
    throw new Error('No active coaching subscription found for this client')
  }

  // Check if already paused in Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    coachingSubscription.stripeSubscriptionId,
  )

  // Idempotent: if already paused, return success
  if (stripeSubscription.pause_collection) {
    console.info(
      `ℹ️ Coaching subscription ${coachingSubscription.stripeSubscriptionId} is already paused (idempotent return)`,
    )
    return {
      success: true,
      message: 'Coaching subscription is already paused',
      pausedUntil: null,
      subscription: new UserSubscription(coachingSubscription),
    }
  }

  // Get current_period_end from subscription items to store for shifted billing
  const subscriptionItem = stripeSubscription.items.data[0]
  const currentPeriodEnd = subscriptionItem?.current_period_end
    ? new Date(subscriptionItem.current_period_end * 1000).toISOString()
    : null

  const pausedAt = new Date().toISOString()

  // Pause the coaching subscription in Stripe
  await stripe.subscriptions.update(coachingSubscription.stripeSubscriptionId, {
    pause_collection: {
      behavior: 'mark_uncollectible', // Don't charge during pause
    },
    metadata: {
      ...stripeSubscription.metadata,
      manuallyPausedByTrainer: 'true',
      pausedAt,
      pausedPeriodEnd: currentPeriodEnd, // Store for shifted billing on resume
      trainerId: userId,
    },
  })

  console.info(
    `✅ Trainer ${userId} paused coaching subscription ${coachingSubscription.stripeSubscriptionId} for client ${clientId} (periodEnd: ${currentPeriodEnd})`,
  )

  return {
    success: true,
    message: 'Coaching subscription paused successfully',
    pausedUntil: null, // Indefinite pause
    subscription: new UserSubscription(coachingSubscription),
  }
}

/**
 * Compute the number of whole days paused (rounded up).
 */
function computePausedDays(pausedAt: string, resumedAt: Date): number {
  const pausedDate = new Date(pausedAt)
  const diffMs = resumedAt.getTime() - pausedDate.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return Math.ceil(diffDays) // Round up to whole days
}

/**
 * Trainer: Resume client's coaching subscription
 *
 * Implements shifted billing: the next charge is pushed forward by the number
 * of paused days (rounded up) so the client is credited for the pause period.
 *
 * - If shiftTarget > now: set trial_end to shiftTarget (no charge until then)
 * - If shiftTarget <= now: bill immediately with billing_cycle_anchor=now
 */
export async function resumeClientCoachingSubscription(
  clientId: string,
  context: GQLContext,
) {
  const userId = context.user?.user.id
  if (!userId) {
    throw new Error('Authentication required')
  }

  // Verify trainer has permission
  await ensureTrainerClientAccess(userId, clientId)

  // Find client's coaching subscription
  const coachingSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId: clientId,
      trainerId: userId,
      status: 'ACTIVE',
      package: {
        stripeLookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
      },
    },
    include: { package: true },
  })

  if (!coachingSubscription?.stripeSubscriptionId) {
    throw new Error('No active coaching subscription found for this client')
  }

  // Check if paused in Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    coachingSubscription.stripeSubscriptionId,
  )

  // Idempotent: if already active (not paused), return success
  if (!stripeSubscription.pause_collection) {
    console.info(
      `ℹ️ Coaching subscription ${coachingSubscription.stripeSubscriptionId} is already active (idempotent return)`,
    )
    return {
      success: true,
      message: 'Coaching subscription is already active',
      subscription: new UserSubscription(coachingSubscription),
    }
  }

  const now = new Date()
  const resumedAt = now.toISOString()
  const metadata = stripeSubscription.metadata || {}
  const pausedAt = metadata.pausedAt
  const pausedPeriodEndStr = metadata.pausedPeriodEnd

  // Compute shifted billing target
  let shiftTarget: Date | null = null
  let pausedDays = 0

  if (pausedAt && pausedPeriodEndStr) {
    pausedDays = computePausedDays(pausedAt, now)
    const pausedPeriodEnd = new Date(pausedPeriodEndStr)
    shiftTarget = new Date(
      pausedPeriodEnd.getTime() + pausedDays * 24 * 60 * 60 * 1000,
    )

    console.info(
      `📅 Shifted billing: pausedAt=${pausedAt}, pausedDays=${pausedDays}, pausedPeriodEnd=${pausedPeriodEndStr}, shiftTarget=${shiftTarget.toISOString()}`,
    )
  } else {
    console.warn(
      `⚠️ Missing pausedAt or pausedPeriodEnd metadata for subscription ${coachingSubscription.stripeSubscriptionId}; cannot compute shifted billing`,
    )
  }

  // Prepare update params
  const updateParams: Parameters<typeof stripe.subscriptions.update>[1] = {
    pause_collection: null, // Resume billing
    metadata: {
      ...metadata,
      manuallyPausedByTrainer: null, // Remove pause flag
      pausedAt: null, // Clear pause metadata
      pausedPeriodEnd: null,
      resumedAt,
      shiftedBillingDays: pausedDays > 0 ? String(pausedDays) : null,
    },
  }

  // Apply shifted billing via trial_end if shiftTarget is in the future
  if (shiftTarget && shiftTarget > now) {
    // Set trial_end to push the next charge to shiftTarget
    // proration_behavior=none to avoid proration charges
    updateParams.trial_end = Math.floor(shiftTarget.getTime() / 1000)
    updateParams.proration_behavior = 'none'

    console.info(
      `⏳ Setting trial_end to ${shiftTarget.toISOString()} to shift next billing`,
    )
  } else if (shiftTarget && shiftTarget <= now) {
    // shiftTarget is in the past; bill immediately by resetting billing cycle anchor
    // Note: For flexible billing mode subscriptions, this may be restricted.
    // We'll attempt it and log the result.
    updateParams.billing_cycle_anchor = 'now'
    updateParams.proration_behavior = 'none'

    console.info(
      `💳 shiftTarget ${shiftTarget.toISOString()} is in the past; setting billing_cycle_anchor=now for immediate billing`,
    )
  }

  // Resume the coaching subscription in Stripe
  const updatedSubscription = await stripe.subscriptions.update(
    coachingSubscription.stripeSubscriptionId,
    updateParams,
  )

  // Sync DB endDate from updated subscription
  const subscriptionItem = updatedSubscription.items.data[0]
  let newEndDate: Date | null = null

  if (subscriptionItem?.current_period_end) {
    newEndDate = new Date(subscriptionItem.current_period_end * 1000)
  } else if (updatedSubscription.trial_end) {
    // If trial_end was set, the effective "period end" is the trial end
    newEndDate = new Date(updatedSubscription.trial_end * 1000)
  }

  if (newEndDate) {
    await prisma.userSubscription.update({
      where: { id: coachingSubscription.id },
      data: { endDate: newEndDate },
    })
    console.info(
      `📆 Updated DB endDate to ${newEndDate.toISOString()} for subscription ${coachingSubscription.id}`,
    )
  }

  console.info(
    `✅ Trainer ${userId} resumed coaching subscription ${coachingSubscription.stripeSubscriptionId} for client ${clientId} (shifted ${pausedDays} days)`,
  )

  return {
    success: true,
    message:
      pausedDays > 0
        ? `Coaching subscription resumed. Next billing shifted by ${pausedDays} day${pausedDays > 1 ? 's' : ''}.`
        : 'Coaching subscription resumed successfully',
    subscription: new UserSubscription(coachingSubscription),
  }
}

/**
 * Trainer: Cancel client's coaching subscription at a specific date
 */
export async function cancelClientCoachingSubscription(
  clientId: string,
  cancelAt: string,
  context: GQLContext,
) {
  const userId = context.user?.user.id
  if (!userId) {
    throw new Error('Authentication required')
  }

  // Verify trainer has permission
  await ensureTrainerClientAccess(userId, clientId)

  // Parse and validate the cancelAt date
  let cancelAtDate = new Date(cancelAt)
  if (isNaN(cancelAtDate.getTime())) {
    throw new Error('Invalid cancellation date')
  }

  if (cancelAtDate <= new Date()) {
    throw new Error('Cancellation date must be in the future')
  }

  // Find client's coaching subscription
  const coachingSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId: clientId,
      trainerId: userId,
      status: 'ACTIVE',
      package: {
        stripeLookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
      },
    },
    include: { package: true, user: true },
  })

  if (!coachingSubscription?.stripeSubscriptionId) {
    throw new Error('No active coaching subscription found for this client')
  }

  // Fetch current Stripe subscription to validate cancel date against billing cycle
  const stripeSubscription = await stripe.subscriptions.retrieve(
    coachingSubscription.stripeSubscriptionId,
  )

  const currentPeriodEnd =
    stripeSubscription.items.data[0]?.current_period_end ||
    Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60

  // Ensure cancel_at is set to end of day (23:59:59) to prevent edge cases
  // where the subscription might renew just before the cancel time
  cancelAtDate.setHours(23, 59, 59, 999)

  // Validate that cancel date is at or after the current period end
  // This prevents setting cancel_at in the middle of a billing period
  const currentPeriodEndDate = new Date(currentPeriodEnd * 1000)
  if (cancelAtDate < currentPeriodEndDate) {
    // If the selected date is before current period end, use current period end
    // This ensures we don't accidentally set cancel_at to a time that's already passed
    // in the current billing cycle
    cancelAtDate = new Date(currentPeriodEnd * 1000)
    cancelAtDate.setHours(23, 59, 59, 999)
  }

  // Get trainer info for email
  const trainer = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  })

  const trainerName =
    trainer?.name || trainer?.profile?.firstName || 'Your trainer'

  // Update Stripe subscription with cancel_at
  // Adding a small buffer (1 hour after end of day) to be absolutely safe
  const cancelAtTimestamp = Math.floor(cancelAtDate.getTime() / 1000)
  await stripe.subscriptions.update(coachingSubscription.stripeSubscriptionId, {
    cancel_at: cancelAtTimestamp,
    metadata: {
      scheduledCancelByTrainer: 'true',
      scheduledCancelAt: cancelAtDate.toISOString(),
      trainerId: userId,
    },
  })

  // Update database status to CANCELLED_ACTIVE
  await prisma.userSubscription.update({
    where: { id: coachingSubscription.id },
    data: {
      status: 'CANCELLED_ACTIVE',
      endDate: cancelAtDate,
    },
  })

  // Send email notification to client
  const clientEmail = coachingSubscription.user.email
  const clientName =
    coachingSubscription.user.name ||
    (coachingSubscription.user as { profile?: { firstName?: string } })?.profile
      ?.firstName ||
    null

  try {
    await sendEmail.coachingScheduledToEnd(clientEmail, {
      clientName,
      trainerName,
      endDate: cancelAtDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      packageName: coachingSubscription.package.name,
    })
  } catch (emailError) {
    console.error('Failed to send cancellation email:', emailError)
    // Don't throw - the cancellation succeeded
  }

  console.info(
    `✅ Trainer ${userId} scheduled coaching subscription ${coachingSubscription.stripeSubscriptionId} to end on ${cancelAtDate.toISOString()} for client ${clientId}`,
  )

  return {
    success: true,
    message: `Coaching subscription scheduled to end on ${cancelAtDate.toLocaleDateString()}`,
    cancelAt: cancelAtDate.toISOString(),
    subscription: new UserSubscription(coachingSubscription),
  }
}

/**
 * Trainer: Undo cancellation of client's coaching subscription
 */
export async function undoCancelClientCoachingSubscription(
  clientId: string,
  context: GQLContext,
) {
  const userId = context.user?.user.id
  if (!userId) {
    throw new Error('Authentication required')
  }

  // Verify trainer has permission
  await ensureTrainerClientAccess(userId, clientId)

  // Find client's coaching subscription that's scheduled to cancel
  const coachingSubscription = await prisma.userSubscription.findFirst({
    where: {
      userId: clientId,
      trainerId: userId,
      status: 'CANCELLED_ACTIVE',
      package: {
        stripeLookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
      },
    },
    include: { package: true },
  })

  if (!coachingSubscription?.stripeSubscriptionId) {
    throw new Error(
      'No coaching subscription scheduled to cancel found for this client',
    )
  }

  // Check if subscription is actually scheduled to cancel in Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    coachingSubscription.stripeSubscriptionId,
  )

  if (!stripeSubscription.cancel_at) {
    throw new Error('Subscription is not scheduled for cancellation')
  }

  // Remove the cancel_at from Stripe subscription
  await stripe.subscriptions.update(coachingSubscription.stripeSubscriptionId, {
    cancel_at: null,
    metadata: {
      scheduledCancelByTrainer: null,
      scheduledCancelAt: null,
      undoCancelAt: new Date().toISOString(),
    },
  })

  // Update database status back to ACTIVE
  // Set endDate to current_period_end from Stripe
  const currentPeriodEnd =
    stripeSubscription.items.data[0]?.current_period_end ||
    Math.floor(Date.now() / 1000) + 86400 * 30 // fallback to 30 days
  const newEndDate = new Date(currentPeriodEnd * 1000)
  await prisma.userSubscription.update({
    where: { id: coachingSubscription.id },
    data: {
      status: 'ACTIVE',
      endDate: newEndDate,
    },
  })

  console.info(
    `✅ Trainer ${userId} undid cancellation of coaching subscription ${coachingSubscription.stripeSubscriptionId} for client ${clientId}`,
  )

  return {
    success: true,
    message: 'Subscription cancellation has been undone',
    subscription: new UserSubscription(coachingSubscription),
  }
}
