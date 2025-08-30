import { GQLQueryResolvers } from '@/generated/graphql-server'
import { prisma } from '@/lib/db'
import { GQLContext } from '@/types/gql-context'

import Location from './model'

export const Query: GQLQueryResolvers<GQLContext> = {
  locations: async () => {
    const locations = await prisma.location.findMany({
      orderBy: [{ country: 'asc' }, { city: 'asc' }],
    })

    return locations.map((location) => new Location(location))
  },
}
