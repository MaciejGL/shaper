import { User as PrismaUser } from '@prisma/client'

import { GQLUser, GQLUserRole } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/getUser'

import Notification from '../notification/model'

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
    })

    return clients.map((client) => new User(client))
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
    })

    return trainer ? new User(trainer) : null
  }

  get profile() {
    return null // TODO: Fetch related profile if needed
  }

  get sessions() {
    return [] // TODO: Fetch related sessions if needed
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
