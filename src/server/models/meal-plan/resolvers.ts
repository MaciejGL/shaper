import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  assignMealPlanToClient,
  createDraftMealTemplate,
  createMealPlan,
  duplicateMealPlan,
  getClientActiveMealPlan,
  getClientMealPlans,
  getMealPlanById,
  getMealPlanTemplates,
  getMyMealPlansOverview,
  removeMealPlanFromClient,
  saveMeal,
  updateMealPlanDetails,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  getMealPlanTemplates: async (_, args, context) => {
    return getMealPlanTemplates(args, context)
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
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createMealPlan: async (_, args, context) => {
    return createMealPlan(args, context)
  },
  createDraftMealTemplate: async (_, __, context) => {
    return createDraftMealTemplate(context)
  },
  assignMealPlanToClient: async (_, args, context) => {
    return assignMealPlanToClient(args, context)
  },
  removeMealPlanFromClient: async (_, args, context) => {
    return removeMealPlanFromClient(args, context)
  },
  duplicateMealPlan: async (_, args, context) => {
    return duplicateMealPlan(args, context)
  },
  updateMealPlanDetails: async (_, args, context) => {
    return updateMealPlanDetails(args, context)
  },
  // New batch meal operation
  saveMeal: async (_, args, context) => {
    return saveMeal(args, context)
  },
  // Food logging mutations (kept for future use)
  logMealFood: async () => {
    throw new Error('Not implemented')
  },
  updateMealFoodLog: async () => {
    throw new Error('Not implemented')
  },
  deleteMealFoodLog: async () => {
    throw new Error('Not implemented')
  },
}
