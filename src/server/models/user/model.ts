import { User as PrismaUser } from '@prisma/client'

import { GQLUser, GQLUserRole } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

import Notification from '../notification/model'
import UserProfile from '../user-profile/model'
import UserPublic from '../user-public/model'

export default class User implements GQLUser {
  constructor(protected data: PrismaUser) {}

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
    const user = await getCurrentUser()
    // Restrict access to clients for only trainer requests
    if (user?.user?.id !== this.data.id) {
      return []
    }

    const clients = await prisma.user.findMany({
      where: {
        role: GQLUserRole.Client,
        trainerId: this.data.id,
      },
      include: {
        profile: true,
      },
    })

    return clients.map((client) => new UserPublic(client))
  }

  async trainer() {
    const user = await getCurrentUser()
    // Restrict access to trainer for only clients
    if (user?.user?.id !== this.data.id) {
      return null
    }

    const trainer = await prisma.user.findFirst({
      where: {
        role: GQLUserRole.Trainer,
        clients: {
          some: {
            id: this.data.id,
          },
        },
      },
      include: {
        profile: true,
      },
    })

    return trainer ? new UserPublic(trainer) : null
  }

  async profile() {
    const profile = await prisma.userProfile.findFirst({
      where: {
        userId: this.data.id,
      },
    })
    return profile ? new UserProfile(profile) : null
  }

  async sessions() {
    const sessions = await prisma.userSession.findMany({
      where: { userId: this.data.id },
    })
    return sessions.map((s) => ({
      id: s.id,
      user: this,
      otp: s.otp,
      expiresAt: s.expiresAt.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }))
  }

  async notifications() {
    const notifications = await prisma.notification.findMany({
      where: { userId: this.data.id },
    })
    return notifications.map((n) => new Notification(n))
  }

  async createdNotifications() {
    const notifications = await prisma.notification.findMany({
      where: { createdBy: this.data.id },
    })
    return notifications.map((n) => new Notification(n))
  }
}
