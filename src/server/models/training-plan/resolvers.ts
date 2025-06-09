import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

import {
  activatePlan,
  assignTrainingPlanToClient,
  closePlan,
  createTrainingPlan,
  deletePlan,
  deleteTrainingPlan,
  duplicateTrainingPlan,
  getClientActivePlan,
  getClientTrainingPlans,
  getMyPlansOverview,
  getTemplates,
  getTrainingPlanById,
  getWorkout,
  pausePlan,
  removeTrainingPlanFromClient,
  updateTrainingPlan,
} from './factory'

export const Query: GQLQueryResolvers<GQLContext> = {
  getTrainingPlanById: async (_, args, context) => {
    return getTrainingPlanById(args, context)
  },
  getTemplates: async (_, args, context) => {
    return getTemplates(args, context)
  },
  getClientTrainingPlans: async (_, args, context) => {
    return getClientTrainingPlans(args, context)
  },
  getClientActivePlan: async (_, args, context) => {
    return getClientActivePlan(args, context)
  },
  getMyPlansOverview: async (_, __, context) => {
    return getMyPlansOverview(context)
  },
  getWorkout: async (_, args, context) => {
    return getWorkout(args, context)
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createTrainingPlan: async (_, args, context) => {
    return createTrainingPlan(args, context)
  },
  updateTrainingPlan: async (_, args, context) => {
    return updateTrainingPlan(args, context)
  },
  duplicateTrainingPlan: async (_, args, context) => {
    return duplicateTrainingPlan(args, context)
  },
  deleteTrainingPlan: async (_, args, context) => {
    return deleteTrainingPlan(args, context)
  },
  assignTrainingPlanToClient: async (_, args, context) => {
    return assignTrainingPlanToClient(args, context)
  },
  removeTrainingPlanFromClient: async (_, args, context) => {
    return removeTrainingPlanFromClient(args, context)
  },
  activatePlan: async (_, args, context) => {
    return activatePlan(args, context)
  },
  pausePlan: async (_, args, context) => {
    return pausePlan(args, context)
  },
  closePlan: async (_, args, context) => {
    return closePlan(args, context)
  },
  deletePlan: async (_, args, context) => {
    return deletePlan(args, context)
  },
}
