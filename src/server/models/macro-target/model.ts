import { GQLMacroTarget } from '@/generated/graphql-server'
import { MacroTarget as PrismaMacroTarget } from '@/generated/prisma/client'
import { GQLContext } from '@/types/gql-context'

export default class MacroTarget implements GQLMacroTarget {
  constructor(
    protected data: PrismaMacroTarget,
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get clientId() {
    return this.data.clientId
  }

  get trainerId() {
    return this.data.trainerId
  }

  get calories() {
    return this.data.calories
  }

  get protein() {
    return this.data.protein
  }

  get carbs() {
    return this.data.carbs
  }

  get fat() {
    return this.data.fat
  }

  get notes() {
    return this.data.notes
  }

  get createdAt() {
    return this.data.createdAt.toISOString()
  }

  get updatedAt() {
    return this.data.updatedAt.toISOString()
  }
}
