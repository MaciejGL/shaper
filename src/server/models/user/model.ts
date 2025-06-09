import {
  Notification as PrismaNotification,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
  UserSession as PrismaUserSession,
} from '@prisma/client'

import { GQLUser, GQLUserRole } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import Notification from '../notification/model'
import UserProfile from '../user-profile/model'
import UserPublic from '../user-public/model'

export default class User implements GQLUser {
  constructor(
    protected data: PrismaUser & {
      profile?: PrismaUserProfile | null
      sessions?: PrismaUserSession[] | null
      clients?: PrismaUser[] | null
      trainer?: PrismaUser | null
      notifications?: PrismaNotification[] | null
    },
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get email() {
    return this.data.email
  }

  get name() {
    return this.data.name
  }

  get image() {
    return this.data.image
  }

  get role() {
    return this.data.role as GQLUserRole // Cast if needed to match GQLUser's enum
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }

  // Placeholder for relations, implement as needed
  async clients() {
    let clients = this.data.clients ?? null
    if (!clients) {
      console.warn(
        `[User] No clients found for user ${this.id}. Loading from database.`,
      )
      clients = await prisma.user.findMany({
        where: {
          role: GQLUserRole.Client,
          trainerId: this.data.id,
        },
      })
    }

    if (!clients) {
      return []
    }

    return clients.map((client) => new UserPublic(client, this.context))
  }

  async trainer() {
    let trainer = this.data.trainer ?? null
    if (!trainer) {
      console.warn(
        `[User] No trainer found for user ${this.id}. Loading from database.`,
      )
      trainer = await prisma.user.findFirst({
        where: {
          role: GQLUserRole.Trainer,
          clients: {
            some: { id: this.data.id },
          },
        },
      })
    }

    if (!trainer) {
      return null
    }

    return new UserPublic(trainer, this.context)
  }

  async profile() {
    let profile = this.data.profile ?? null
    if (!profile) {
      console.warn(
        `[User] No profile found for user ${this.id}. Loading from database.`,
      )

      profile = await prisma.userProfile.findFirst({
        where: {
          userId: this.data.id,
        },
        include: {
          user: true,
          bodyMeasures: true,
        },
      })
    }

    return profile ? new UserProfile(profile) : null
  }

  async sessions() {
    let sessions = this.data.sessions ?? null
    if (!sessions) {
      console.warn(
        `[User] No sessions found for user ${this.id}. Loading from database.`,
      )
      sessions = await prisma.userSession.findMany({
        where: { userId: this.data.id },
      })
    }

    if (!sessions) {
      return []
    }

    return sessions.map((s) => ({
      id: s.id,
      user: this,
      otp: s.otp,
      expiresAt: s.expiresAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }))
  }

  async notifications() {
    let notifications = this.data.notifications ?? null
    if (!notifications) {
      console.warn(
        `[User] No notifications found for user ${this.id}. Loading from database.`,
      )
      notifications = await prisma.notification.findMany({
        where: { userId: this.data.id },
      })
    }

    if (!notifications) {
      return []
    }

    return notifications
      .filter((n) => n.userId === this.data.id)
      .map((n) => new Notification(n, this.context))
  }

  async createdNotifications() {
    let notifications = this.data.notifications ?? null
    if (!notifications) {
      console.warn(
        `[User] No notifications found for user ${this.id}. Loading from database.`,
      )
      notifications = await prisma.notification.findMany({
        where: { createdBy: this.data.id },
      })
    }

    if (!notifications) {
      return []
    }

    return notifications
      .filter((n) => n.createdBy === this.data.id)
      .map((n) => new Notification(n, this.context))
  }
}
