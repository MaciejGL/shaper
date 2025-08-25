import {
  GQLDeliveryStatus,
  GQLQueryGetActivePackageTemplatesArgs,
  GQLQueryGetAllUsersWithSubscriptionsArgs,
  GQLQueryGetMyServiceDeliveriesArgs,
  GQLQueryGetTrainerDeliveriesArgs,
} from '@/generated/graphql-server'
import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
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
    return await subscriptionValidator.hasPremiumAccess(
      context.user.user.id,
      context,
    )
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
    ...(args.status && { status: args.status }),
  }

  const deliveries = await prisma.serviceDelivery.findMany({
    where,
    include: {
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

  // Only allow trainers to view their own deliveries (or admin)
  if (requestingUserId !== args.trainerId) {
    // TODO: Add admin check here if needed
    throw new Error('Unauthorized: Can only view your own deliveries')
  }

  const where = {
    trainerId: args.trainerId,
    ...(args.status && { status: args.status }),
  }

  const deliveries = await prisma.serviceDelivery.findMany({
    where,
    include: {
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

  const updatedDelivery = await prisma.serviceDelivery.update({
    where: { id: deliveryId },
    data: updateData,
    include: {
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
  context: GQLContext,
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
        ? new UserSubscription(activeSubscription, context)
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
export async function giveLifetimePremium(userId: string, context: GQLContext) {
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

  return new UserSubscription(newSubscription, context)
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
