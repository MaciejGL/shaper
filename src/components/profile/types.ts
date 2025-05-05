import { GQLProfileQuery } from '@/generated/graphql-client'

export type Profile = Pick<
  NonNullable<GQLProfileQuery['profile']>,
  | 'firstName'
  | 'lastName'
  | 'phone'
  | 'email'
  | 'birthday'
  | 'sex'
  | 'avatarUrl'
  | 'height'
  | 'weight'
  | 'fitnessLevel'
  | 'activityLevel'
  | 'goal'
  | 'allergies'
  | 'bio'
>
