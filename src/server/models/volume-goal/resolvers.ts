import { VOLUME_GOAL_PRESET_IDS } from '@/config/volume-goals'
import type {
  GQLMutationResolvers,
  GQLQueryResolvers,
  GQLUserProfileResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import type { GQLContext } from '@/types/gql-context'

import { toVolumeGoalDTO, toVolumeGoalDTOList } from './factory'

const VALID_COMMITMENTS = ['realistic', 'moderate', 'all-in'] as const

export const VolumeGoalQueries: Pick<
  GQLQueryResolvers<GQLContext>,
  'volumeGoalHistory' | 'volumeGoalAtDate'
> = {
  volumeGoalHistory: async (_parent, { limit }, context) => {
    const user = context.user?.user
    if (!user) {
      throw new Error('User not found')
    }

    const goals = await prisma.volumeGoalPeriod.findMany({
      where: { userId: user.id },
      orderBy: { startedAt: 'desc' },
      take: limit ?? 10,
    })

    return toVolumeGoalDTOList(goals)
  },

  volumeGoalAtDate: async (_parent, { targetDate }, context) => {
    const user = context.user?.user
    if (!user) {
      throw new Error('User not found')
    }

    const date = new Date(targetDate)

    const goal = await prisma.volumeGoalPeriod.findFirst({
      where: {
        userId: user.id,
        startedAt: { lte: date },
        OR: [{ endedAt: { gte: date } }, { endedAt: null }],
      },
      orderBy: { startedAt: 'desc' },
    })

    if (!goal) return null

    return toVolumeGoalDTO(goal)
  },
}

export const VolumeGoalMutations: Pick<
  GQLMutationResolvers<GQLContext>,
  'setVolumeGoal'
> = {
  setVolumeGoal: async (_parent, { focusPreset, commitment }, context) => {
    const user = context.user?.user
    if (!user) {
      throw new Error('User not found')
    }

    // Validate focus preset
    if (
      !VOLUME_GOAL_PRESET_IDS.includes(
        focusPreset as (typeof VOLUME_GOAL_PRESET_IDS)[number],
      )
    ) {
      throw new Error(`Invalid focus preset: ${focusPreset}`)
    }

    // Validate commitment level
    if (!VALID_COMMITMENTS.includes(commitment as (typeof VALID_COMMITMENTS)[number])) {
      throw new Error(`Invalid commitment level: ${commitment}`)
    }

    // Close any currently active goal
    await prisma.volumeGoalPeriod.updateMany({
      where: {
        userId: user.id,
        endedAt: null,
      },
      data: {
        endedAt: new Date(),
      },
    })

    // Create new goal period
    const newGoal = await prisma.volumeGoalPeriod.create({
      data: {
        userId: user.id,
        focusPreset,
        commitment,
      },
    })

    return toVolumeGoalDTO(newGoal)
  },
}

export const VolumeGoalFieldResolvers: Pick<
  GQLUserProfileResolvers<GQLContext>,
  'currentVolumeGoal'
> = {
  currentVolumeGoal: async (_parent, _args, context) => {
    const user = context.user?.user
    if (!user) return null

    const currentGoal = await prisma.volumeGoalPeriod.findFirst({
      where: {
        userId: user.id,
        endedAt: null,
      },
      orderBy: { startedAt: 'desc' },
    })

    if (!currentGoal) return null

    return toVolumeGoalDTO(currentGoal)
  },
}
