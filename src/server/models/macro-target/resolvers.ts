import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { ensureTrainerClientAccess } from '@/lib/access-control'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import MacroTarget from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  getClientMacroTargets: async (_, { clientId }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Ensure trainer has access to this client
    await ensureTrainerClientAccess(user.user.id, clientId)

    const macroTarget = await prisma.macroTarget.findUnique({
      where: { clientId },
    })

    return macroTarget ? new MacroTarget(macroTarget, context) : null
  },

  getMyMacroTargets: async (_, __, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    const macroTarget = await prisma.macroTarget.findUnique({
      where: { clientId: user.user.id },
    })

    return macroTarget ? new MacroTarget(macroTarget, context) : null
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  setMacroTargets: async (_, { input }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Ensure trainer has access to this client
    await ensureTrainerClientAccess(user.user.id, input.clientId)

    const macroTarget = await prisma.macroTarget.upsert({
      where: { clientId: input.clientId },
      update: {
        calories: input.calories,
        protein: input.protein,
        carbs: input.carbs,
        fat: input.fat,
        notes: input.notes,
      },
      create: {
        clientId: input.clientId,
        trainerId: user.user.id,
        calories: input.calories,
        protein: input.protein,
        carbs: input.carbs,
        fat: input.fat,
        notes: input.notes,
      },
    })

    return new MacroTarget(macroTarget, context)
  },

  deleteMacroTargets: async (_, { clientId }, context) => {
    const user = context.user
    if (!user) {
      throw new Error('User not found')
    }

    // Ensure trainer has access to this client
    await ensureTrainerClientAccess(user.user.id, clientId)

    await prisma.macroTarget.delete({
      where: { clientId },
    })

    return true
  },
}
