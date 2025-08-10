// lib/loaders.ts
import DataLoader from 'dataloader'

import { prisma } from '@/lib/db'
import MealPlanCollaborator from '@/server/models/meal-plan-collaborator/model'
import TrainingPlanCollaborator from '@/server/models/training-plan-collaborator/model'
import { GQLContext } from '@/types/gql-context'

export const createPlanLoaders = (context: GQLContext) => ({
  trainingPlanById: new DataLoader(async (planIds: readonly string[]) => {
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

  mealPlanById: new DataLoader(async (planIds: readonly string[]) => {
    const plans = await prisma.mealPlan.findMany({
      where: { id: { in: planIds as string[] } },
      include: {
        weeks: {
          include: {
            days: {
              include: {
                meals: {
                  include: {
                    foods: true,
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

  collaboratorCountByTrainingPlanId: new DataLoader(
    async (planIds: readonly string[]) => {
      const counts = await prisma.trainingPlanCollaborator.groupBy({
        by: ['trainingPlanId'],
        where: {
          trainingPlanId: { in: planIds as string[] },
        },
        _count: { trainingPlanId: true },
      })

      const map = new Map(
        counts.map((item) => [item.trainingPlanId, item._count.trainingPlanId]),
      )

      return planIds.map((id) => map.get(id) ?? 0)
    },
  ),

  collaboratorCountByMealPlanId: new DataLoader(
    async (planIds: readonly string[]) => {
      const counts = await prisma.mealPlanCollaborator.groupBy({
        by: ['mealPlanId'],
        where: {
          mealPlanId: { in: planIds as string[] },
        },
        _count: { mealPlanId: true },
      })

      const map = new Map(
        counts.map((item) => [item.mealPlanId, item._count.mealPlanId]),
      )

      return planIds.map((id) => map.get(id) ?? 0)
    },
  ),

  collaboratorsByTrainingPlanId: new DataLoader(
    async (planIds: readonly string[]) => {
      const collaborators = await prisma.trainingPlanCollaborator.findMany({
        where: {
          trainingPlanId: { in: planIds as string[] },
        },
        include: {
          collaborator: {
            include: {
              profile: true,
            },
          },
        },
      })

      const grouped = planIds.map((planId) =>
        collaborators
          .filter((collab) => collab.trainingPlanId === planId)
          .map((collab) => new TrainingPlanCollaborator(collab, context)),
      )
      return grouped
    },
  ),

  collaboratorsByMealPlanId: new DataLoader(
    async (planIds: readonly string[]) => {
      const collaborators = await prisma.mealPlanCollaborator.findMany({
        where: {
          mealPlanId: { in: planIds as string[] },
        },
        include: {
          collaborator: {
            include: {
              profile: true,
            },
          },
        },
      })

      const grouped = planIds.map((planId) =>
        collaborators
          .filter((collab) => collab.mealPlanId === planId)
          .map((collab) => new MealPlanCollaborator(collab, context)),
      )
      return grouped
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
