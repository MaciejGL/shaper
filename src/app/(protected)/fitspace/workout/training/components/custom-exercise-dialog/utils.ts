import {
  HIGH_LEVEL_TO_DISPLAY_GROUPS,
  type HighLevelGroup,
} from '@/config/muscles'

import type { MuscleGroupCategories } from './types'

export function mapHighLevelGroupToMuscleIds({
  categories,
  highLevelGroup,
}: {
  categories: MuscleGroupCategories | undefined
  highLevelGroup: HighLevelGroup
}): string[] {
  const displayGroups = HIGH_LEVEL_TO_DISPLAY_GROUPS[highLevelGroup]
  const muscles = categories?.flatMap((c) => c?.muscles ?? []) ?? []

  return muscles
    .filter((m) => (m?.id ? displayGroups.includes(m.displayGroup) : false))
    .map((m) => m.id)
}

