// lib/loaders.ts
import DataLoader from 'dataloader'

import { prisma } from '@/lib/db'

export const createPlanLoaders = () => ({
  // LIGHTWEIGHT: Basic plan info for listings and navigation
  trainingPlanBasic: new DataLoader(async (planIds: readonly string[]) => {
    const plans = await prisma.trainingPlan.findMany({
      where: { id: { in: planIds as string[] } },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        _count: {
          select: {
            weeks: true,
          },
        },
      },
    })

    const map = new Map(plans.map((plan) => [plan.id, plan]))
    return planIds.map((id) => map.get(id) ?? null)
  }),

  // HEAVY: Full plan data (only use when specifically needed)
  trainingPlanById: new DataLoader(async (planIds: readonly string[]) => {
    console.warn(
      '[PLAN-LOADER] Using heavy trainingPlanById - ensure this is necessary for plan:',
      planIds[0],
    )
    const plans = await prisma.trainingPlan.findMany({
      where: { id: { in: planIds as string[] } },
      include: {
        weeks: {
          include: {
            days: {
              include: {
                exercises: {
                  include: {
                    sets: true,
                    base: {
                      include: {
                        muscleGroups: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    const map = new Map(plans.map((plan) => [plan.id, plan]))
    return planIds.map((id) => map.get(id) ?? null)
  }),

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

  assignmentCountByTemplateId: new DataLoader(
    async (templateIds: readonly string[]) => {
      const counts = await prisma.trainingPlan.groupBy({
        by: ['templateId'],
        where: {
          templateId: { in: templateIds as string[] },
          isTemplate: false, // Only count assigned plans (duplicates)
          assignedToId: { not: null }, // Only count plans that are actually assigned to users
        },
        _count: {
          templateId: true,
        },
      })

      const map = new Map(
        counts.map((item) => [item.templateId, item._count.templateId]),
      )

      return templateIds.map((id) => map.get(id) ?? 0)
    },
  ),

  timesStartedByPlanId: new DataLoader(
    async (sourcePlanIds: readonly string[]) => {
      const counts = await prisma.trainingPlan.groupBy({
        by: ['sourceTrainingPlanId'],
        where: {
          sourceTrainingPlanId: { in: sourcePlanIds as string[] },
        },
        _count: {
          sourceTrainingPlanId: true,
        },
      })

      const map = new Map(
        counts.map((item) => [
          item.sourceTrainingPlanId,
          item._count.sourceTrainingPlanId,
        ]),
      )

      return sourcePlanIds.map((id) => map.get(id) ?? 0)
    },
  ),

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
