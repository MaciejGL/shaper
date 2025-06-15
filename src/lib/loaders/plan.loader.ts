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

  assignedCountByPlanId: new DataLoader(async (planIds: readonly string[]) => {
    const counts = await prisma.trainingPlan.groupBy({
      by: ['templateId'],
      where: {
        templateId: { in: planIds as string[] },
        isTemplate: false, // Only count assigned plans, not templates
      },
      _count: {
        templateId: true,
      },
    })

    const map = new Map(
      counts.map((item) => [item.templateId, item._count.templateId]),
    )

    return planIds.map((id) => map.get(id) ?? 0)
  }),
  weeksByPlanId: new DataLoader(async (planIds: readonly string[]) => {
    const allWeeks = await prisma.trainingWeek.findMany({
      where: {
        planId: { in: planIds as string[] },
      },
      include: { days: true },
    })

    const grouped = planIds.map((planId) =>
      allWeeks.filter((w) => w.planId === planId),
    )
    return grouped
  }),
  reviewsByPlanId: new DataLoader(async (planIds: readonly string[]) => {
    const reviews = await prisma.review.findMany({
      where: { trainingPlanId: { in: planIds as string[] } },
      include: { createdBy: { include: { profile: true } } },
    })

    const grouped = planIds.map((planId) =>
      reviews.filter((r) => r.trainingPlanId === planId),
    )
    return grouped
  }),
})
