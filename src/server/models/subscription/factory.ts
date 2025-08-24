import {
  GQLDeliveryStatus,
  GQLQueryGetActivePackageTemplatesArgs,
  GQLQueryGetMyServiceDeliveriesArgs,
  GQLQueryGetTrainerDeliveriesArgs,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { subscriptionValidator } from '@/lib/subscription/subscription-validator'
import { GQLContext } from '@/types/gql-context'

import { PackageTemplate, ServiceDelivery } from './model'

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
    orderBy: { createdAt: 'desc' },
  })

  return deliveries.map((delivery) => new ServiceDelivery(delivery, context))
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
    orderBy: { createdAt: 'desc' },
  })

  return deliveries.map((delivery) => new ServiceDelivery(delivery, context))
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
