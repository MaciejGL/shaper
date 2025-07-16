import { Prisma } from '@prisma/client'

import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { requireAdminUser } from '@/lib/admin-auth'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import UserPublic from '../user-public/model'

import AdminUserListItem from './admin-user-list-item'
import User from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  user: async (_, __, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    // Preload commonly requested data to prevent N+1 queries
    // Other relations (trainer, clients, sessions) are lazy-loaded as needed
    const user = await prisma.user.findUnique({
      where: { id: userSession.user.id },
      include: {
        profile: {
          include: {
            bodyMeasures: true,
          },
        },
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return new User(user, context)
  },
  // Comprehensive resolver for when all user data is needed (trainer dashboard)
  userWithAllData: async (_, __, context) => {
    const userSession = context.user
    if (!userSession) {
      throw new Error('User not found')
    }

    // Preload ALL related data to prevent N+1 queries
    const user = await prisma.user.findUnique({
      where: { id: userSession.user.id },
      include: {
        profile: {
          include: {
            bodyMeasures: true,
          },
        },
        trainer: {
          include: {
            profile: true,
          },
        },
        clients: {
          include: {
            profile: true,
          },
        },
        sessions: true,
        notifications: {
          include: {
            creator: {
              include: {
                profile: true,
              },
            },
          },
        },
      },
    })

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

    // Only fetch essential data for global context
    const user = await prisma.user.findUnique({
      where: { id: userSession.user.id },
      include: {
        profile: true, // Include full profile (bodyMeasures will be lazy-loaded if needed)
        // Exclude trainer, clients, sessions, notifications, and other heavy data
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return new User(user, context)
  },
  myClients: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const clients = await prisma.user.findMany({
      where: { trainerId: user.user.id },
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
    })

    if (!clients) {
      throw new Error('User not found')
    }

    return clients.map((client) => new UserPublic(client, context))
  },

  // Admin-only queries
  adminUserStats: async () => {
    await requireAdminUser()

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

    return {
      totalUsers,
      totalClients,
      totalTrainers,
      totalAdmins,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      usersWithoutProfiles,
      recentSignups,
    }
  },

  adminUserList: async (_, { filters, limit = 50, offset = 0 }, context) => {
    await requireAdminUser()

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

    return {
      users: userListItems,
      total,
      hasMore: (offset ?? 0) + (limit ?? 50) < total,
    }
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

export const Mutation: GQLMutationResolvers = {
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
}
