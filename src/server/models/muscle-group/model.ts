import { DisplayGroup } from '@/constants/muscles'
import { GQLMuscleGroup } from '@/generated/graphql-server'
import { GQLContext } from '@/types/gql-context'

// Accepts both Prisma model and static muscle data
export interface MuscleGroupData {
  id: string
  name: string
  alias: string | null
  displayGroup: DisplayGroup | string | null
}

export default class MuscleGroup implements GQLMuscleGroup {
  constructor(
    protected data: MuscleGroupData,
    protected context: GQLContext,
  ) {}

  get id() {
    return this.data.id
  }

  get name() {
    return this.data.name
  }

  get alias() {
    return this.data.alias
  }

  get displayGroup() {
    // Provide fallback for legacy data - will be 'Other' if null
    return this.data.displayGroup ?? 'Other'
  }
}
