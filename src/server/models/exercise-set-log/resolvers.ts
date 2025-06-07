import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'

import { markSetAsCompleted, updateSetLog } from './factory'

export const Query: GQLQueryResolvers = {}

export const Mutation: GQLMutationResolvers = {
  updateSetLog: async (_, input) => {
    return updateSetLog(input)
  },
  markSetAsCompleted: async (_, args) => {
    console.log(args)
    return markSetAsCompleted(args)
  },
}
