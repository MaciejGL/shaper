import type { HighLevelGroup } from '@/config/muscles'
import type { GQLEquipment } from '@/generated/graphql-client'
import type { GQLFitspaceGetExercisesQuery } from '@/generated/graphql-client'

export type CustomExerciseDialogExercise = NonNullable<
  NonNullable<GQLFitspaceGetExercisesQuery['getExercises']>['userExercises']
>[number]

export type MuscleGroupCategories =
  GQLFitspaceGetExercisesQuery['muscleGroupCategories']

export type CustomExerciseFormState = {
  name: string
  highLevelGroup: HighLevelGroup | null
  equipment: GQLEquipment | null
}

