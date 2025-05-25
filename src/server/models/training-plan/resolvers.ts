import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  assignTrainingPlanToClient,
  createTrainingPlan,
  deleteTrainingPlan,
  duplicateTrainingPlan,
  getClientTrainingPlans,
  getTemplates,
  getTrainingPlanById,
  removeTrainingPlanFromClient,
  updateTrainingPlan,
} from './factory'

export const Query: GQLQueryResolvers = {
  getTrainingPlanById: async (_, args) => {
    return getTrainingPlanById(args)
  },
  getTemplates: async (_, args) => {
    return getTemplates(args)
  },
  getClientTrainingPlans: async (_, args) => {
    return getClientTrainingPlans(args)
  },
}

export const Mutation: GQLMutationResolvers = {
  createTrainingPlan: async (_, args) => {
    return createTrainingPlan(args)
  },
  updateTrainingPlan: async (_, args) => {
    return updateTrainingPlan(args)
  },
  duplicateTrainingPlan: async (_, args) => {
    return duplicateTrainingPlan(args)
  },
  deleteTrainingPlan: async (_, args) => {
    return deleteTrainingPlan(args)
  },
  assignTrainingPlanToClient: async (_, args) => {
    return assignTrainingPlanToClient(args)
  },
  removeTrainingPlanFromClient: async (_, args) => {
    return removeTrainingPlanFromClient(args)
  },
}
