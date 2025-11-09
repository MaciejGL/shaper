import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import {
  addFreeWorkoutDay,
  getAdminFreeWorkoutDays,
  getFreeWorkoutDays,
  removeFreeWorkoutDay,
  startFreeWorkoutDay,
  updateFreeWorkoutDay,
} from './factory'

export const Query: GQLQueryResolvers = {
  async getFreeWorkoutDays(_, __, context) {
    return getFreeWorkoutDays(context)
  },

  async getAdminFreeWorkoutDays(_, __, context) {
    return getAdminFreeWorkoutDays(context)
  },
}

export const Mutation: GQLMutationResolvers = {
  async addFreeWorkoutDay(_, args, context) {
    return addFreeWorkoutDay(args, context)
  },

  async updateFreeWorkoutDay(_, args, context) {
    return updateFreeWorkoutDay(args, context)
  },

  async removeFreeWorkoutDay(_, args, context) {
    return removeFreeWorkoutDay(args, context)
  },

  async startFreeWorkoutDay(_, args, context) {
    return startFreeWorkoutDay(args, context)
  },
}
