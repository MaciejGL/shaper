import {
  GQLCoachingRequestStatus,
  GQLMutationResolvers,
  GQLNotificationType,
  GQLQueryResolvers,
  GQLUserRole,
} from '@/generated/graphql-server'
import {
  Prisma,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
  UserSession as PrismaUserSession,
  SubscriptionStatus,
} from '@/generated/prisma/client'
import {
  invalidateClientAccessCache,
  invalidateTrainerAccessCache,
} from '@/lib/access-control'
import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { notifyCoachingCancelled } from '@/lib/notifications/push-notification-service'
import { getFromCache, setInCache } from '@/lib/redis'
import { STRIPE_LOOKUP_KEYS } from '@/lib/stripe/lookup-keys'
import { stripe } from '@/lib/stripe/stripe'
import { GQLContext } from '@/types/gql-context'

import { createNotification } from '../notification/factory'
import UserPublic from '../user-public/model'

import AdminUserListItem from './admin-user-list-item'
import User from './model'
import PublicTrainer from './public-trainer'

// Type for cached trainer data
type UserWithIncludes = PrismaUser & {
  profile?: PrismaUserProfile | null
  sessions?: PrismaUserSession[]
  _count?: {
    sessions: number
    clients: number
  }
}

// Helper function to cancel user's Stripe subscriptions at period end
async function cancelUserStripeSubscriptions(userId: string) {
  try {
    // Find active subscriptions with Stripe subscription IDs
    const activeSubscriptions = await prisma.userSubscription.findMany({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
        stripeSubscriptionId: { not: null },
      },
    })

    // Cancel each subscription at period end
    for (const subscription of activeSubscriptions) {
      if (subscription.stripeSubscriptionId) {
        try {
          // Cancel at period end - user keeps access until current period ends
          await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
            cancel_at_period_end: true,
          })

          console.info(
            `✅ Scheduled Stripe subscription ${subscription.stripeSubscriptionId} for cancellation at period end`,
          )
        } catch (stripeError) {
          console.error(
            `Failed to cancel Stripe subscription ${subscription.stripeSubscriptionId}:`,
            stripeError,
          )
          // Don't throw - we don't want to fail the entire coaching cancellation if Stripe fails
        }
      }
    }
  } catch (error) {
    console.error('Error cancelling user Stripe subscriptions:', error)
    // Don't throw - we don't want to fail the entire coaching cancellation
  }
}

export const Query: GQLQueryResolvers<GQLContext> = {
  user: async (_, __, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    // Use DataLoader to batch user queries and prevent N+1 queries
    const user = await context.loaders.user.userById.load(userSession.user.id)

    if (!user) {
      throw new Error('User not found')
    }

    return new User(user, context)
  },

  // Lightweight resolver for global context - only essential data
  userBasic: async (_, __, context: GQLContext) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    // Use DataLoader to batch basic user queries and prevent N+1 queries
    const user = await context.loaders.user.userBasic.load(userSession.user.id)

    if (!user) {
      throw new Error('User not found')
    }

    return new User(user, context)
  },
  myClients: async (_, { limit, offset, trainerId }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // If trainerId is provided, verify team membership first
    if (trainerId && trainerId !== user.user.id) {
      const sharedTeam = await prisma.team.findFirst({
        where: {
          members: {
            some: {
              userId: user.user.id,
            },
          },
          AND: {
            members: {
              some: {
                userId: trainerId,
              },
            },
          },
        },
      })

      if (!sharedTeam) {
        throw new Error('You can only view clients of trainers on your team')
      }
    }

    const targetTrainerId = trainerId || user.user.id

    const clients = await prisma.user.findMany({
      where: { trainerId: targetTrainerId },
      include: {
        profile: true,
        assignedPlans: {
          include: {
            weeks: {
              include: {
                days: {
                  include: {
                    events: true,
                  },
                },
              },
            },
          },
        },
      },
      take: limit || undefined,
      skip: offset || undefined,
    })

    if (!clients) {
      throw new Error('User not found')
    }

    return clients
      .map((client) => new UserPublic(client, context))
      .sort(
        (a, b) =>
          (b.activePlan?.updatedAt
            ? new Date(b.activePlan.updatedAt).getTime()
            : 0) -
          (a.activePlan?.updatedAt
            ? new Date(a.activePlan.updatedAt).getTime()
            : 0),
      )
  },

  searchUsers: async (
    _,
    { email, limit = 10 }: { email: string; limit?: number | null },
    context,
  ) => {
    const user = context.user
    if (!user) {
      throw new Error('User not authenticated')
    }

    if (user.user.role !== 'TRAINER') {
      throw new Error('Only trainers can search for users')
    }

    // Search for users by email (case-insensitive)
    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        trainerId: true,
      },
      take: limit ?? 10,
      orderBy: {
        email: 'asc',
      },
    })

    return users.map((u) => {
      const gqlRole: GQLUserRole =
        u.role === 'TRAINER'
          ? GQLUserRole.Trainer
          : u.role === 'ADMIN'
            ? GQLUserRole.Admin
            : GQLUserRole.Client

      return {
        id: u.id,
        email: u.email,
        name: u.name,
        image: u.image,
        role: gqlRole,
        hasTrainer: !!u.trainerId,
      }
    })
  },

  // Public queries
  getFeaturedTrainers: async (_, { limit = 10 }, context) => {
    const cacheKey = `featured-trainers:${limit}`

    const cachedTrainers = await getFromCache<UserWithIncludes[]>(cacheKey)
    if (cachedTrainers) {
      return cachedTrainers.map(
        (trainer) => new PublicTrainer(trainer, context),
      )
    }

    const featuredTrainers = await prisma.user.findMany({
      where: {
        role: 'TRAINER',
        featured: true,
      },
      include: {
        profile: true,
        _count: {
          select: {
            clients: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit ?? 20,
    })

    await setInCache(cacheKey, featuredTrainers, 60 * 60 * 1) // 1 hour
    return featuredTrainers.map(
      (trainer) => new PublicTrainer(trainer, context),
    )
  },

  clientHasActiveCoachingSubscription: async (_, { clientId }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not authenticated')
    }

    const trainerId = user.user.id

    // Check if there's an active coaching subscription
    const activeSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: clientId,
        trainerId: trainerId,
        status: 'ACTIVE',
        package: {
          stripeLookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
        },
      },
    })

    return !!activeSubscription
  },

  getMyTrainer: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Fetch fresh user data from DB to get latest trainerId
    // Context user may have stale trainerId from session
    const currentUser = await prisma.user.findUnique({
      where: { id: user.user.id },
      select: { trainerId: true },
    })

    if (!currentUser?.trainerId) {
      return null
    }

    const trainerId = currentUser.trainerId

    const cacheKey = `my-trainer:user-id:${user.user.id}:user-trainer-id:${trainerId}`
    const cachedTrainer = await getFromCache<UserWithIncludes>(cacheKey)
    if (cachedTrainer) {
      return new PublicTrainer(cachedTrainer, context)
    }

    const trainer = await prisma.user.findUnique({
      where: { id: trainerId },
      include: {
        profile: true,
        _count: {
          select: {
            clients: true,
          },
        },
      },
    })

    if (!trainer) {
      return null
    }

    await setInCache(cacheKey, trainer, 60 * 60 * 1) // 1 hour

    return new PublicTrainer(trainer, context)
  },

  // Admin-only queries
  adminUserStats: async () => {
    await requireAdminUser()

    const cacheKey = 'admin-user-stats'
    const ttlSeconds = 5 * 60 // 5 minutes

    const cachedStats = await getFromCache<{
      totalUsers: number
      totalClients: number
      totalTrainers: number
      totalAdmins: number
      activeUsers: number
      inactiveUsers: number
      usersWithoutProfiles: number
      recentSignups: number
    }>(cacheKey)
    if (cachedStats) {
      return cachedStats
    }

    const [
      totalUsers,
      totalClients,
      totalTrainers,
      totalAdmins,
      usersWithoutProfiles,
      recentSignups,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.user.count({ where: { role: 'TRAINER' } }),
      prisma.user.count({ where: { role: 'ADMIN' } }),
      prisma.user.count({ where: { profile: null } }),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    ])

    // Calculate active users (users with recent sessions or activity)
    const activeUsers = await prisma.user.count({
      where: {
        OR: [
          {
            sessions: {
              some: {
                createdAt: {
                  gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                },
              },
            },
          },
          {
            updatedAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            },
          },
        ],
      },
    })

    const stats = {
      totalUsers,
      totalClients,
      totalTrainers,
      totalAdmins,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersWithoutProfiles,
      recentSignups,
    }

    await setInCache(cacheKey, stats, ttlSeconds)
    return stats
  },

  adminUserList: async (_, { filters, limit = 50, offset = 0 }, context) => {
    await requireAdminUser()

    // Create cache key based on filters
    const cacheKey = `admin-user-list:${JSON.stringify({ filters, limit, offset })}`
    const ttlSeconds = 2 * 60 // 2 minutes (shorter TTL due to frequent updates)

    const cachedResult = await getFromCache<{
      users: UserWithIncludes[]
      total: number
      hasMore: boolean
    }>(cacheKey)
    if (cachedResult) {
      // Convert cached data back to AdminUserListItem instances
      const userListItems = cachedResult.users.map(
        (userData) => new AdminUserListItem(userData, context),
      )
      return {
        users: userListItems,
        total: cachedResult.total,
        hasMore: cachedResult.hasMore,
      }
    }

    const whereClause: Prisma.UserWhereInput = {}

    if (filters?.role) {
      whereClause.role = filters.role
    }

    if (filters?.search) {
      whereClause.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { name: { contains: filters.search, mode: 'insensitive' } },
        {
          profile: {
            OR: [
              { firstName: { contains: filters.search, mode: 'insensitive' } },
              { lastName: { contains: filters.search, mode: 'insensitive' } },
            ],
          },
        },
      ]
    }

    if (filters?.hasProfile !== undefined) {
      whereClause.profile = filters.hasProfile ? { isNot: null } : null
    }

    if (filters?.dateFrom || filters?.dateTo) {
      whereClause.createdAt = {}
      if (filters.dateFrom) {
        whereClause.createdAt.gte = new Date(filters.dateFrom)
      }
      if (filters.dateTo) {
        whereClause.createdAt.lte = new Date(filters.dateTo)
      }
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: whereClause,
        include: {
          profile: true,
          trainer: {
            include: { profile: true },
          },
          sessions: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          _count: {
            select: {
              sessions: true,
              clients: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: limit ?? 50,
        skip: offset ?? 0,
      }),
      prisma.user.count({ where: whereClause }),
    ])

    const userListItems = users.map(
      (user) => new AdminUserListItem(user, context),
    )

    const result = {
      users: userListItems,
      total,
      hasMore: (offset ?? 0) + (limit ?? 50) < total,
    }

    // Cache the raw user data (not the AdminUserListItem instances)
    const cacheData = {
      users: users, // Store raw Prisma data
      total,
      hasMore: (offset ?? 0) + (limit ?? 50) < total,
    }
    await setInCache(cacheKey, cacheData, ttlSeconds)

    return result
  },

  adminUserById: async (_, { id }, context) => {
    await requireAdminUser()

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        trainer: {
          include: { profile: true },
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            sessions: true,
            clients: true,
          },
        },
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return new AdminUserListItem(user, context)
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  updateTrainerCapacity: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    if (user.user.role !== 'TRAINER') {
      throw new Error('Only trainers can set their capacity')
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.user.id },
      data: {
        capacity: input.capacity,
      },
      include: {
        profile: true,
        sessions: true,
        notifications: true,
        createdNotifications: true,
      },
    })

    return new User(updatedUser, context)
  },

  updateUserRole: async (_, { input }, context) => {
    const adminUser = await requireAdminUser()

    if (input.userId === adminUser.user.id) {
      throw new Error('Cannot modify your own role')
    }

    const user = await prisma.user.update({
      where: { id: input.userId },
      data: { role: input.newRole },
      include: {
        profile: true,
        trainer: {
          include: { profile: true },
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            sessions: true,
            clients: true,
          },
        },
      },
    })

    return new AdminUserListItem(user, context)
  },

  updateUserFeatured: async (_, { input }, context) => {
    await requireAdminUser()

    const user = await prisma.user.update({
      where: { id: input.userId },
      data: { featured: input.featured },
      include: {
        profile: true,
        trainer: {
          include: { profile: true },
        },
        sessions: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
        _count: {
          select: {
            sessions: true,
            clients: true,
          },
        },
      },
    })

    // Invalidate relevant caches by setting them to expire immediately
    try {
      // Clear stats cache since featured count changed
      await setInCache('admin-user-stats', null, 0)

      // Clear featured trainers cache since featured status changed
      await setInCache('featured-trainers:10', null, 0) // Default limit
      await setInCache('featured-trainers:5', null, 0) // Common limits
      await setInCache('featured-trainers:20', null, 0)

      // Note: In a production environment, you might want to implement
      // pattern-based cache invalidation for admin-user-list:* keys
      // For now, the 2-minute TTL will ensure relatively fresh data
    } catch (error) {
      console.error('Cache invalidation error:', error)
      // Don't fail the mutation if cache invalidation fails
    }

    return new AdminUserListItem(user, context)
  },

  deactivateUser: async (_, { userId }) => {
    const adminUser = await requireAdminUser()

    if (userId === adminUser.user.id) {
      throw new Error('Cannot deactivate your own account')
    }

    // Clear all sessions to effectively "deactivate" the user
    await prisma.userSession.deleteMany({
      where: { userId },
    })

    return true
  },

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  activateUser: async (_, { userId }) => {
    await requireAdminUser()

    // For now, activation just means the user can log in normally
    // In the future, we might add an "active" field to the User model
    return true
  },

  clearUserSessions: async (_, { userId }) => {
    const adminUser = await requireAdminUser()

    if (userId === adminUser.user.id) {
      throw new Error('Cannot clear your own sessions')
    }

    await prisma.userSession.deleteMany({
      where: { userId },
    })

    return true
  },

  resetUserLogs: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not authenticated')
    }

    const userId = user.user.id

    try {
      // Use a transaction to ensure all deletions succeed or fail together
      await prisma.$transaction(async (tx) => {
        // Delete exercise logs
        await tx.exerciseLog.deleteMany({
          where: { userId },
        })

        // Delete exercise set logs for user's exercises (bulk operation)
        // First get all set IDs for user's exercises, then delete their logs
        const userSetIds = await tx.exerciseSet.findMany({
          where: {
            exercise: {
              day: {
                week: {
                  plan: {
                    assignedToId: userId,
                  },
                },
              },
            },
          },
          select: { logId: true },
        })

        const logIds = userSetIds
          .map((set) => set.logId)
          .filter((id): id is string => id !== null)

        if (logIds.length > 0) {
          await tx.exerciseSetLog.deleteMany({
            where: { id: { in: logIds } },
          })
        }

        // Delete workout session events for user's days (bulk operation)
        await tx.workoutSessionEvent.deleteMany({
          where: {
            day: {
              week: {
                plan: {
                  assignedToId: userId,
                },
              },
            },
          },
        })

        // Delete body measurements (keep profile)
        if (user.user.profile?.id) {
          await tx.userBodyMeasure.deleteMany({
            where: { userProfileId: user.user.profile.id },
          })
        }

        // Delete reviews
        await tx.review.deleteMany({
          where: { createdById: userId },
        })

        // Clear completion status for user's training plans (bulk operations)
        await tx.exerciseSet.updateMany({
          where: {
            exercise: {
              day: {
                week: {
                  plan: {
                    assignedToId: userId,
                  },
                },
              },
            },
          },
          data: {
            completedAt: null,
            logId: null,
          },
        })

        await tx.trainingExercise.updateMany({
          where: {
            day: {
              week: {
                plan: {
                  assignedToId: userId,
                },
              },
            },
          },
          data: { completedAt: null },
        })

        await tx.trainingDay.updateMany({
          where: {
            week: {
              plan: {
                assignedToId: userId,
              },
            },
          },
          data: { completedAt: null },
        })

        await tx.trainingWeek.updateMany({
          where: {
            plan: {
              assignedToId: userId,
            },
          },
          data: { completedAt: null },
        })

        await tx.trainingPlan.updateMany({
          where: { assignedToId: userId },
          data: { completedAt: null },
        })
      })

      return true
    } catch (error) {
      console.error('Failed to reset user logs:', error)
      throw new Error('Failed to reset user logs')
    }
  },

  deleteUserAccount: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not authenticated')
    }

    const userId = user.user.id

    try {
      // Use a transaction to ensure all deletions succeed or fail together
      await prisma.$transaction(async (tx) => {
        // Remove user from any trainer relationships
        await tx.user.updateMany({
          where: { trainerId: userId },
          data: { trainerId: null },
        })

        // Delete all related data in efficient bulk operations
        const deleteOperations = [
          // User sessions and notifications
          tx.userSession.deleteMany({ where: { userId } }),
          tx.notification.deleteMany({
            where: { OR: [{ userId }, { createdBy: userId }] },
          }),

          // Coaching requests
          tx.coachingRequest.deleteMany({
            where: { OR: [{ senderId: userId }, { recipientId: userId }] },
          }),

          // User-generated content and logs
          tx.exerciseLog.deleteMany({ where: { userId } }),
          tx.review.deleteMany({ where: { createdById: userId } }),
          tx.note.deleteMany({ where: { createdById: userId } }),

          // Plans (cascade will handle related data)
          tx.trainingPlan.deleteMany({
            where: { OR: [{ assignedToId: userId }, { createdById: userId }] },
          }),

          // Other user-created content
          tx.favouriteWorkout.deleteMany({ where: { createdById: userId } }),
          tx.baseExercise.deleteMany({ where: { createdById: userId } }),
        ]

        // Execute all deletions in parallel for better performance
        await Promise.all(deleteOperations)

        // Finally, delete the user (profile and body measures will cascade due to onDelete: Cascade)
        await tx.user.delete({
          where: { id: userId },
        })
      })

      return true
    } catch (error) {
      console.error('Failed to delete user account:', error)
      throw new Error('Failed to delete user account')
    }
  },

  cancelCoaching: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not authenticated')
    }

    const userId = user.user.id

    try {
      // Get current user with trainer and profile info
      const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          trainer: {
            include: {
              profile: true,
            },
          },
          profile: true,
        },
      })

      if (!currentUser?.trainerId) {
        throw new Error('No active coaching relationship to cancel')
      }

      const trainerId = currentUser.trainerId
      const clientName =
        currentUser.profile?.firstName && currentUser.profile?.lastName
          ? `${currentUser.profile.firstName} ${currentUser.profile.lastName}`
          : currentUser.name || 'Client'

      // Use transaction to ensure all operations succeed or fail together
      await prisma.$transaction(async (tx) => {
        // Disconnect trainer from client
        await tx.user.update({
          where: { id: userId },
          data: { trainerId: null },
        })

        // Remove client from trainer's clients list (if needed by the relation setup)
        await tx.user.update({
          where: { id: trainerId },
          data: {
            clients: {
              disconnect: { id: userId },
            },
          },
        })

        // Find the latest coaching request between user and trainer to maintain audit trail
        const latestCoachingRequest = await tx.coachingRequest.findFirst({
          where: {
            OR: [
              { senderId: userId, recipientId: trainerId },
              { senderId: trainerId, recipientId: userId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        })

        // Create CANCELLED coaching request record for audit trail
        if (latestCoachingRequest) {
          await tx.coachingRequest.create({
            data: {
              senderId: latestCoachingRequest.senderId,
              recipientId: latestCoachingRequest.recipientId,
              message: latestCoachingRequest.message,
              interestedServices: latestCoachingRequest.interestedServices,
              status: GQLCoachingRequestStatus.Cancelled,
            },
          })
        }
      })

      // Create notification for the trainer

      await createNotification(
        {
          userId: trainerId,
          message: `${clientName} has cancelled their coaching relationship with you.`,
          type: GQLNotificationType.CoachingCancelled,
          createdBy: userId,
          link: '/fitspace/clients',
        },
        context,
      )

      await notifyCoachingCancelled(trainerId, clientName)

      // Cancel any active Stripe subscriptions at period end
      await cancelUserStripeSubscriptions(userId)

      // Invalidate access control cache for both users since their relationship ended
      await Promise.all([
        invalidateTrainerAccessCache(trainerId),
        invalidateClientAccessCache(userId),
      ])

      return true
    } catch (error) {
      console.error('Failed to cancel coaching:', error)
      throw new Error('Failed to cancel coaching relationship')
    }
  },

  removeClient: async (_, { clientId }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not authenticated')
    }

    const trainerId = user.user.id

    try {
      // Verify client exists and belongs to this trainer
      const client = await prisma.user.findUnique({
        where: { id: clientId },
        include: {
          profile: true,
        },
      })

      if (!client) {
        throw new Error('Client not found')
      }

      if (client.trainerId !== trainerId) {
        throw new Error('This client does not belong to you')
      }

      // Check for active coaching subscription
      const activeSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId: clientId,
          trainerId: trainerId,
          status: {
            in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.PENDING],
          },
          package: {
            stripeLookupKey: STRIPE_LOOKUP_KEYS.PREMIUM_COACHING,
          },
        },
      })

      if (activeSubscription) {
        throw new Error(
          'Cannot remove client with active coaching subscription. Please wait for their subscription to end or cancel their subscription first.',
        )
      }

      // Get trainer info for notification
      const trainer = await prisma.user.findUnique({
        where: { id: trainerId },
        include: { profile: true },
      })

      const trainerName =
        trainer?.profile?.firstName && trainer?.profile?.lastName
          ? `${trainer.profile.firstName} ${trainer.profile.lastName}`
          : trainer?.name || 'Your trainer'

      // Use transaction to ensure all operations succeed or fail together
      await prisma.$transaction(async (tx) => {
        // Disconnect trainer from client
        await tx.user.update({
          where: { id: clientId },
          data: { trainerId: null },
        })

        // Remove client from trainer's clients list
        await tx.user.update({
          where: { id: trainerId },
          data: {
            clients: {
              disconnect: { id: clientId },
            },
          },
        })

        // Find the latest coaching request between trainer and client for audit trail
        const latestCoachingRequest = await tx.coachingRequest.findFirst({
          where: {
            OR: [
              { senderId: clientId, recipientId: trainerId },
              { senderId: trainerId, recipientId: clientId },
            ],
          },
          orderBy: { createdAt: 'desc' },
        })

        // Create CANCELLED coaching request record for audit trail
        if (latestCoachingRequest) {
          await tx.coachingRequest.update({
            where: { id: latestCoachingRequest.id },
            data: {
              status: GQLCoachingRequestStatus.Cancelled,
            },
          })
        }
      })

      // Create notification for the client
      await createNotification(
        {
          userId: clientId,
          message: `${trainerName} has ended your coaching relationship. You still have access to all your training plans and data.`,
          type: GQLNotificationType.CoachingCancelled,
          createdBy: trainerId,
        },
        context,
      )

      // Invalidate access control cache for both users since their relationship ended
      await Promise.all([
        invalidateTrainerAccessCache(trainerId),
        invalidateClientAccessCache(clientId),
      ])

      return true
    } catch (error) {
      console.error('Failed to remove client:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Failed to remove client')
    }
  },
}
