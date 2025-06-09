// lib/loaders.ts
import DataLoader from 'dataloader'

import { prisma } from '@/lib/db'

export const createPlanLoaders = () => ({
  weekCountByPlanId: new DataLoader(async (planIds: readonly string[]) => {
    const counts = await prisma.trainingWeek.groupBy({
      by: ['planId'],
      where: {
        planId: { in: planIds as string[] },
      },
      _count: { planId: true },
    })

    const map = new Map(counts.map((item) => [item.planId, item._count.planId]))

    return planIds.map((id) => map.get(id) ?? 0)
  }),
})
