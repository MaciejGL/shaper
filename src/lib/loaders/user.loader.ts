import DataLoader from 'dataloader'

import { prisma } from '@/lib/db'

export const createUserLoaders = () => ({
  getCurrentUser: new DataLoader(async (emails: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { email: { in: emails as string[] } },
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
        notifications: true,
      },
    })

    const map = new Map(users.map((u) => [u.email, u]))
    return emails.map((email) => map.get(email) ?? null)
  }),

  authSession: new DataLoader(async (emails: readonly string[]) => {
    const user = await prisma.user.findMany({
      where: { email: { in: emails as string[] } },
      include: {
        sessions: {
          where: {
            expiresAt: { gte: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    const map = new Map(user.map((u) => [u.email, u]))
    return emails.map((email) => map.get(email) ?? null)
  }),

  userById: new DataLoader(async (ids: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { id: { in: ids as string[] } },
      include: {
        profile: {
          include: {
            bodyMeasures: true,
          },
        },
      },
    })
    const map = new Map(users.map((u) => [u.id, u]))
    return ids.map((id) => map.get(id) ?? null)
  }),
})
