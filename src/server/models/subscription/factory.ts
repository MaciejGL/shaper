import {
  GQLPackageStats,
  GQLQueryGetTrainerRevenueArgs,
  GQLSubscriptionStats,
} from '@/generated/graphql-server'
import { isAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'
import { SubscriptionStatus } from '@/types/subscription'

import PackageTemplate, {
  PackageTemplateWithIncludes,
} from '../package-template/model'

/**
 * Get comprehensive subscription statistics (admin only)
 */
export async function getSubscriptionStats(
  context: GQLContext,
): Promise<GQLSubscriptionStats> {
  if (!(await isAdminUser())) {
    throw new Error('Unauthorized')
  }

  // Get current date for monthly calculations
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  // Get total active subscriptions
  const totalActiveSubscriptions = await prisma.userSubscription.count({
    where: {
      status: SubscriptionStatus.ACTIVE,
      endDate: {
        gte: now,
      },
    },
  })

  // Get all active subscriptions with packages for revenue calculation
  const activeSubscriptions = await prisma.userSubscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
      endDate: {
        gte: now,
      },
    },
    include: {
      package: true,
    },
  })

  // Calculate total revenue from active subscriptions
  const totalRevenue = activeSubscriptions.reduce((sum, sub) => {
    return sum + (sub.package.priceNOK || 0)
  }, 0)

  // Get monthly revenue (subscriptions created this month)
  const monthlySubscriptions = await prisma.userSubscription.findMany({
    where: {
      status: SubscriptionStatus.ACTIVE,
      createdAt: {
        gte: startOfMonth,
        lte: endOfMonth,
      },
    },
    include: {
      package: true,
    },
  })

  const monthlyRevenue = monthlySubscriptions.reduce((sum, sub) => {
    return sum + (sub.package.priceNOK || 0)
  }, 0)

  // Get unique premium users (users with active subscriptions)
  const premiumUsers = await prisma.userSubscription.groupBy({
    by: ['userId'],
    where: {
      status: SubscriptionStatus.ACTIVE,
      endDate: {
        gte: now,
      },
    },
  })

  // Get trainer-specific subscriptions
  const trainerSubscriptions = await prisma.userSubscription.count({
    where: {
      status: SubscriptionStatus.ACTIVE,
      trainerId: {
        not: null,
      },
      endDate: {
        gte: now,
      },
    },
  })

  // Get package statistics
  const packageStats = await getPackageStats(context)

  return {
    totalActiveSubscriptions,
    totalRevenue,
    monthlyRevenue,
    premiumUsers: premiumUsers.length,
    trainerSubscriptions,
    packageStats,
  }
}

/**
 * Get statistics for each package template
 */
export async function getPackageStats(
  context: GQLContext,
): Promise<GQLPackageStats[]> {
  const now = new Date()

  // Get all package templates with their subscription counts
  const packages = await prisma.packageTemplate.findMany({
    include: {
      services: true,
      trainer: true,
      subscriptions: {
        where: {
          status: SubscriptionStatus.ACTIVE,
          endDate: {
            gte: now,
          },
        },
      },
      _count: {
        select: {
          subscriptions: {
            where: {
              createdAt: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
              },
            },
          },
        },
      },
    },
  })

  return packages.map((pkg) => {
    const activeSubscriptions = pkg.subscriptions.length
    const totalRevenue = activeSubscriptions * (pkg.priceNOK || 0)

    // Calculate conversion rate (simplified)
    // This could be enhanced with more sophisticated tracking
    const totalTrials = pkg._count.subscriptions
    const conversionRate =
      totalTrials > 0 ? (activeSubscriptions / totalTrials) * 100 : 0

    return {
      package: new PackageTemplate(pkg, context),
      activeSubscriptions,
      totalRevenue,
      conversionRate,
    }
  })
}

/**
 * Get trainer revenue statistics
 */
export async function getTrainerRevenue(
  args: GQLQueryGetTrainerRevenueArgs,
  context: GQLContext,
) {
  const trainerId = args.trainerId

  // Verify access - user can only view their own stats unless admin
  if (context.user?.user.id !== trainerId && !(await isAdminUser())) {
    throw new Error('Unauthorized')
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  // Get all trainer subscriptions
  const allSubscriptions = await prisma.userSubscription.findMany({
    where: {
      trainerId,
    },
    include: {
      package: {
        include: {
          services: true,
        },
      },
    },
  })

  // Get active subscriptions
  const activeSubscriptions = allSubscriptions.filter(
    (sub) => sub.status === SubscriptionStatus.ACTIVE && sub.endDate >= now,
  )

  // Get monthly subscriptions
  const monthlySubscriptions = allSubscriptions.filter(
    (sub) => sub.createdAt >= startOfMonth,
  )

  // Calculate revenues
  const totalRevenue = allSubscriptions.reduce((sum, sub) => {
    return sum + (sub.package.priceNOK || 0)
  }, 0)

  const monthlyRevenue = monthlySubscriptions.reduce((sum, sub) => {
    return sum + (sub.package.priceNOK || 0)
  }, 0)

  // Get package popularity stats
  const packageCounts = allSubscriptions.reduce(
    (acc, sub) => {
      const packageId = sub.packageId
      if (!acc[packageId]) {
        acc[packageId] = {
          package: sub.package,
          count: 0,
          revenue: 0,
        }
      }
      acc[packageId].count++
      acc[packageId].revenue += sub.package.priceNOK || 0
      return acc
    },
    {} as Record<
      string,
      { package: PackageTemplateWithIncludes; count: number; revenue: number }
    >,
  )

  const popularPackages = Object.values(packageCounts)
    .map((stats) => ({
      package: new PackageTemplate(stats.package, context),
      subscriptionCount: stats.count,
      revenue: stats.revenue,
    }))
    .sort((a, b) => b.subscriptionCount - a.subscriptionCount)
    .slice(0, 5) // Top 5 packages

  return {
    totalRevenue,
    monthlyRevenue,
    activeSubscriptions: activeSubscriptions.length,
    totalSubscriptions: allSubscriptions.length,
    popularPackages,
  }
}
