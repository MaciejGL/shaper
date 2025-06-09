import DataLoader from 'dataloader'

import { prisma } from '@/lib/db'

export const createUserLoaders = () => ({
  getCurrentUser: new DataLoader(async (emails: readonly string[]) => {
    const users = await prisma.user.findMany({
      where: { email: { in: emails as string[] } },
      include: {
        profile: true,
        trainer: true,
        clients: true,
        sessions: true,
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
            expiresAt: { gt: new Date() },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    const map = new Map(user.map((u) => [u.email, u]))
    return emails.map((email) => map.get(email) ?? null)
  }),
})
