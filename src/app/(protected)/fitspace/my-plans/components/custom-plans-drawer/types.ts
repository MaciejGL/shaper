import type {
  GQLGetFavouriteWorkoutFoldersQuery,
  GQLGetFavouriteWorkoutsQuery,
} from '@/generated/graphql-client'

export type FavouriteWorkout = NonNullable<
  NonNullable<GQLGetFavouriteWorkoutsQuery>['getFavouriteWorkouts']
>[number]

export type FavouriteWorkoutFolder = NonNullable<
  NonNullable<GQLGetFavouriteWorkoutFoldersQuery>['getFavouriteWorkoutFolders']
>[number]

export type CustomPlan =
  | { kind: 'folder'; folder: FavouriteWorkoutFolder }
  | { kind: 'uncategorized' }

export function getCustomPlanTitle(plan: CustomPlan): string {
  if (plan.kind === 'uncategorized') return 'Uncategorized'
  return plan.folder.name
}

export function getCustomPlanFolderId(plan: CustomPlan): string | null {
  if (plan.kind === 'uncategorized') return null
  return plan.folder.id
}

