import {
  GQLMutationResolvers,
  GQLQueryResolvers,
  GQLUserRole,
} from '@/generated/graphql-server'
import { requireAuth } from '@/lib/getUser'
import { GQLContext } from '@/types/gql-context'

import {
  addDayToNutritionPlan,
  addMealToNutritionPlanDay,
  copyNutritionPlan,
  createNutritionPlan,
  deleteNutritionPlan,
  getClientNutritionPlans,
  getNutritionPlanById,
  getTrainerNutritionPlans,
  removeDayFromNutritionPlan,
  removeMealFromNutritionPlanDay,
  reorderNutritionPlanDayMeals,
  shareNutritionPlanWithClient,
  unshareNutritionPlanFromClient,
  updateNutritionPlan,
  updateNutritionPlanMealPortion,
} from './factory'
import NutritionPlan, { NutritionPlanDay, NutritionPlanMeal } from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  nutritionPlan: async (_, { id }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('Authentication required')
    }

    // Check if user is trainer or client
    if (
      user.user.role !== GQLUserRole.Trainer &&
      user.user.role !== GQLUserRole.Client
    ) {
      throw new Error('Access denied: Must be trainer or client')
    }

    const nutritionPlan = await getNutritionPlanById(id)

    // Access control: trainers can see their own plans, clients can see shared plans
    if (user.user.role === GQLUserRole.Trainer) {
      if (nutritionPlan.trainerId !== user.user.id) {
        throw new Error(
          'Access denied: You can only view nutrition plans you created',
        )
      }
    } else if (user.user.role === GQLUserRole.Client) {
      if (
        nutritionPlan.clientId !== user.user.id ||
        !nutritionPlan.isSharedWithClient
      ) {
        throw new Error(
          'Access denied: You can only view nutrition plans shared with you',
        )
      }
    }

    return new NutritionPlan(nutritionPlan, context)
  },

  trainerNutritionPlans: async (_, { clientId, sharedOnly }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const nutritionPlans = await getTrainerNutritionPlans(
      user.user.id,
      clientId || undefined,
      sharedOnly || undefined,
    )

    return nutritionPlans.map((plan) => new NutritionPlan(plan, context))
  },

  clientNutritionPlans: async (_, __, context) => {
    const user = requireAuth(GQLUserRole.Client, context.user)

    const nutritionPlans = await getClientNutritionPlans(user.user.id)

    return nutritionPlans.map((plan) => new NutritionPlan(plan, context))
  },

  getClientNutritionPlans: async (_, { clientId }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const nutritionPlans = await getTrainerNutritionPlans(
      user.user.id,
      clientId,
    )

    return nutritionPlans.map((plan) => new NutritionPlan(plan, context))
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createNutritionPlan: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const nutritionPlan = await createNutritionPlan(input, user.user.id)

    return {
      nutritionPlan: new NutritionPlan(nutritionPlan, context),
      success: true,
    }
  },

  updateNutritionPlan: async (_, { id, input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const nutritionPlan = await updateNutritionPlan(id, input, user.user.id)

    return new NutritionPlan(nutritionPlan, context)
  },

  deleteNutritionPlan: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    return await deleteNutritionPlan(id, user.user.id)
  },

  shareNutritionPlanWithClient: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const nutritionPlan = await shareNutritionPlanWithClient(id, user.user.id)

    // TODO: Trigger notification to client
    // await notifyNutritionPlanShared(nutritionPlan)

    return new NutritionPlan(nutritionPlan, context)
  },

  unshareNutritionPlanFromClient: async (_, { id }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const nutritionPlan = await unshareNutritionPlanFromClient(id, user.user.id)

    return new NutritionPlan(nutritionPlan, context)
  },

  copyNutritionPlan: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    // Convert input to factory options format
    const portionAdjustments: Record<string, number> = {}
    if (input.portionAdjustments) {
      input.portionAdjustments.forEach((adjustment) => {
        portionAdjustments[adjustment.mealId] = adjustment.portionMultiplier
      })
    }

    const nutritionPlan = await copyNutritionPlan({
      sourceNutritionPlanId: input.sourceNutritionPlanId,
      targetClientId: input.targetClientId,
      trainerId: user.user.id,
      name: input.name || undefined,
      description: input.description || undefined,
      portionAdjustments:
        Object.keys(portionAdjustments).length > 0
          ? portionAdjustments
          : undefined,
    })

    return {
      nutritionPlan: new NutritionPlan(nutritionPlan, context),
      success: true,
    }
  },

  addNutritionPlanDay: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const day = await addDayToNutritionPlan(
      input.nutritionPlanId,
      input.dayNumber,
      input.name,
      user.user.id,
    )

    return new NutritionPlanDay(day, context)
  },

  removeNutritionPlanDay: async (_, { dayId }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    return await removeDayFromNutritionPlan(dayId, user.user.id)
  },

  addMealToNutritionPlanDay: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const planMeal = await addMealToNutritionPlanDay(
      input.dayId,
      input.mealId,
      input.portionMultiplier,
      user.user.id,
    )

    return new NutritionPlanMeal(planMeal, context)
  },

  updateNutritionPlanMealPortion: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const planMeal = await updateNutritionPlanMealPortion(
      input.planMealId,
      input.portionMultiplier,
      user.user.id,
    )

    return new NutritionPlanMeal(planMeal, context)
  },

  removeMealFromNutritionPlanDay: async (_, { planMealId }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    return await removeMealFromNutritionPlanDay(planMealId, user.user.id)
  },

  reorderNutritionPlanDayMeals: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const planMeals = await reorderNutritionPlanDayMeals(
      input.dayId,
      input.mealIds,
      user.user.id,
    )

    return planMeals.map((planMeal) => new NutritionPlanMeal(planMeal, context))
  },
}
