export interface Exercise {
  id: string
  name: string
  description?: string | null
  instructions?: string[]
  tips?: string[]
  equipment: string
  isPublic: boolean
  isPremium: boolean
  verified: boolean
  version: number
  createdAt: string
  updatedAt: string
  videoUrl?: string | null
  tempImageUrls?: string[]
  createdBy?: {
    id: string
    email: string
    profile?: {
      firstName: string | null
      lastName: string | null
    } | null
  } | null
  images?: {
    id: string
    url: string
    order: number
  }[]
  muscleGroups?: {
    id: string
    name: string
    alias?: string | null
    groupSlug: string
  }[]
  secondaryMuscleGroups?: {
    id: string
    name: string
    alias?: string | null
    groupSlug: string
  }[]
  substitutes?: {
    id: string
    name: string
    equipment: string
  }[]
  relatedCount?: number
}

export interface ExerciseUpdate {
  id: string
  name?: string
  description?: string | null
  instructions?: string[]
  tips?: string[]
  equipment?: string
  isPublic?: boolean
  isPremium?: boolean
  verified?: boolean
  version?: number
  videoUrl?: string | null
  images?: {
    id: string
    url: string
    order: number
  }[]
  tempImageUrls?: string[] // Temp images before save
  muscleGroupIds?: string[]
  secondaryMuscleGroupIds?: string[]
  substituteIds?: string[]
}

export interface ExerciseUpdateHandler {
  (
    id: string,
    field: keyof ExerciseUpdate,
    value:
      | string
      | boolean
      | number
      | null
      | string[]
      | {
          id: string
          url: string
          order: number
        }[],
  ): void
}
