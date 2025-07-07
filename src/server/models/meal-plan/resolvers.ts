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
  duplicateMealPlan: async (_, args, context) => {
    return duplicateMealPlan(args, context)
  },
  // TODO: Implement other mutations
  updateMealPlan: async () => {
    throw new Error('Not implemented')
  },
  deleteMealPlan: async () => {
    throw new Error('Not implemented')
  },
  removeMealPlanFromClient: async () => {
    throw new Error('Not implemented')
  },
  activateMealPlan: async () => {
    throw new Error('Not implemented')
  },
  pauseMealPlan: async () => {
    throw new Error('Not implemented')
  },
  completeMealPlan: async () => {
    throw new Error('Not implemented')
  },
  logMealFood: async () => {
    throw new Error('Not implemented')
  },
  updateMealFoodLog: async () => {
    throw new Error('Not implemented')
  },
  deleteMealFoodLog: async () => {
    throw new Error('Not implemented')
  },
  updateMealPlanDetails: async () => {
    throw new Error('Not implemented')
  },
  updateMealWeekDetails: async () => {
    throw new Error('Not implemented')
  },
  updateMealDayData: async () => {
    throw new Error('Not implemented')
  },
  updateMeal: async () => {
    throw new Error('Not implemented')
  },
  updateMealFood: async () => {
    throw new Error('Not implemented')
  },
  addMealToDay: async () => {
    throw new Error('Not implemented')
  },
  removeMealFromDay: async () => {
    throw new Error('Not implemented')
  },
  addFoodToMeal: async () => {
    throw new Error('Not implemented')
  },
  removeFoodFromMeal: async () => {
    throw new Error('Not implemented')
  },
}
