import {
  Notification as PrismaNotification,
  User as PrismaUser,
  UserProfile as PrismaUserProfile,
  UserSession as PrismaUserSession,
} from '@prisma/client'

import { GQLUser, GQLUserRole } from '@/generated/graphql-server'
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
      notifications?:
        | (PrismaNotification & {
            creator?: PrismaUser | null
          })[]
        | null
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
    const clients = this.data.clients
    if (clients) {
      return clients.map((client) => new UserPublic(client, this.context))
    } else {
      console.error(
        `[User] No clients found for user ${this.id}. Loading from database.`,
      )
      return []
    }
  }

  async trainer() {
    const trainer = this.data.trainer
    if (trainer) {
      return new UserPublic(trainer, this.context)
    } else {
      console.error(
        `[User] No trainer found for user ${this.id}. Loading from database.`,
      )
      return null
    }
  }

  async profile() {
    const profile = this.data.profile
    if (profile) {
      return new UserProfile(profile)
    } else {
      console.error(
        `[User] No profile found for user ${this.id}. Loading from database.`,
      )
      return null
    }
  }

  async sessions() {
    const sessions = this.data.sessions
    if (sessions) {
      return sessions.map((s) => ({
        id: s.id,
        user: this,
        otp: s.otp,
        expiresAt: s.expiresAt.toISOString(),
        createdAt: s.createdAt.toISOString(),
      }))
    } else {
      console.error(
        `[User] No sessions found for user ${this.id}. Loading from database.`,
      )
      return []
    }
  }

  async notifications() {
    const notifications = this.data.notifications
    if (notifications) {
      return notifications.map((n) => new Notification(n, this.context))
    } else {
      console.error(
        `[User] No notifications found for user ${this.id}. Loading from database.`,
      )
      return []
    }
  }

  async createdNotifications() {
    const notifications = this.data.notifications
    if (notifications) {
      return notifications.map((n) => new Notification(n, this.context))
    } else {
      console.error(
        `[User] No notifications found for user ${this.id}. Loading from database.`,
      )
      return []
    }
  }
}
