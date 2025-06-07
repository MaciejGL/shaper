import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

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
  getClientActivePlan: async (_, args) => {
    return getClientActivePlan(args)
  },
  getMyPlansOverview: async () => {
    return getMyPlansOverview()
  },
  getWorkout: async (_, args) => {
    return getWorkout(args)
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
  activatePlan: async (_, args) => {
    return activatePlan(args)
  },
  pausePlan: async (_, args) => {
    return pausePlan(args)
  },
  closePlan: async (_, args) => {
    return closePlan(args)
  },
  deletePlan: async (_, args) => {
    return deletePlan(args)
  },
}
