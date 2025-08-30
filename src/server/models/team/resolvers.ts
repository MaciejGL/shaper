import { GQLUserRole } from '@/generated/graphql-client'
import {
  GQLMutationResolvers,
  GQLQueryResolvers,
} from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/getUser'
import { GQLContext } from '@/types/gql-context'

import Team from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  myTeams: async (_, __, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    const teams = await prisma.team.findMany({
      where: {
        members: {
          some: {
            userId: user.user.id,
          },
        },
      },
      include: {
        location: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    })

    return teams.map((team) => new Team(team))
  },
}

export const Mutation: GQLMutationResolvers<GQLContext> = {
  createTeam: async (_, { input }, context) => {
    const user = requireAuth(GQLUserRole.Trainer, context.user)

    // Create or find location
    const location = await prisma.location.upsert({
      where: {
        city_country: {
          city: input.city,
          country: input.country,
        },
      },
      update: {},
      create: {
        city: input.city,
        country: input.country,
        countryCode: input.countryCode,
      },
    })

    // Create team with user as admin
    const team = await prisma.team.create({
      data: {
        name: input.name,
        locationId: location.id,
        members: {
          create: {
            userId: user.user.id,
            role: 'ADMIN',
          },
        },
      },
      include: {
        location: true,
        _count: {
          select: {
            members: true,
          },
        },
      },
    })

    return new Team(team)
  },
}
