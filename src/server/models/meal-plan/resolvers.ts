import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  addCustomFoodToMeal,
  assignMealPlanToClient,
  batchLogMealFood,
  clientGetMealPlan,
  completeMeal,
  createDraftMealTemplate,
  createMealPlan,
  duplicateMealPlan,
  fitspaceActivateMealPlan,
  fitspaceDeactivateMealPlan,
  fitspaceDeleteMealPlan,
  getClientActiveMealPlan,
  getClientMealPlans,
  getCollaborationMealPlanTemplates,
  getMealPlanById,
  getMealPlanTemplates,
  getMyMealPlansOverview,
  removeMealLog,
  removeMealPlanFromClient,
  saveMeal,
  uncompleteMeal,
  updateMealFoodLog,
  updateMealPlanDetails,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  getMealPlanTemplates: async (_, args, context) => {
    return getMealPlanTemplates(args, context)
  },
  getCollaborationMealPlanTemplates: async (_, args, context) => {
    return getCollaborationMealPlanTemplates(args, context)
  },
  getMealPlanById: async (_, args, context) => {
    return getMealPlanById(args, context)
  },
  getClientMealPlans: async (_, args, context) => {
    return getClientMealPlans(args, context)
  },
  getClientActiveMealPlan: async (_, args, context) => {
    return getClientActiveMealPlan(args, context)
  },
  getMyMealPlansOverview: async (_, __, context) => {
    return getMyMealPlansOverview(context)
  },
  clientGetMealPlan: async (_, args, context) => {
    return clientGetMealPlan(args, context)
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createMealPlan: async (_, args, context) => {
    return createMealPlan(args, context)
  },
  createDraftMealTemplate: async (_, __, context) => {
    return createDraftMealTemplate(context)
  },
  duplicateMealPlan: async (_, args, context) => {
    return duplicateMealPlan(args, context)
  },
  assignMealPlanToClient: async (_, args, context) => {
    return assignMealPlanToClient(args, context)
  },
  removeMealPlanFromClient: async (_, args, context) => {
    return removeMealPlanFromClient(args, context)
  },
  saveMeal: async (_, args, context) => {
    return saveMeal(args, context)
  },
  updateMealPlanDetails: async (_, args, context) => {
    return updateMealPlanDetails(args, context)
  },
  fitspaceActivateMealPlan: async (_, args, context) => {
    return fitspaceActivateMealPlan(args, context)
  },
  fitspaceDeactivateMealPlan: async (_, args, context) => {
    return fitspaceDeactivateMealPlan(args, context)
  },
  fitspaceDeleteMealPlan: async (_, args, context) => {
    return fitspaceDeleteMealPlan(args, context)
  },
  completeMeal: async (_, args, context) => {
    return completeMeal(args, context)
  },
  uncompleteMeal: async (_, args, context) => {
    return uncompleteMeal(args, context)
  },

  batchLogMealFood: async (_, args, context) => {
    return batchLogMealFood(args, context)
  },
  updateMealFoodLog: async (_, args, context) => {
    return updateMealFoodLog(args, context)
  },
  addCustomFoodToMeal: async (_, args, context) => {
    return addCustomFoodToMeal(args, context)
  },
  removeMealLog: async (_, args, context) => {
    return removeMealLog(args, context)
  },
}
