import type { GQLGetExerciseProgressQuery } from '@/generated/graphql-client'

export type ExerciseProgressItem =
  GQLGetExerciseProgressQuery['exercisesProgressByUser'][number]

export type TimePeriod = '1month' | '3months' | '6months' | '1year' | 'all'

export type OneRmPointKg = {
  label: string
  oneRMKg: number
  timestamp: number
}

export type VolumePointKg = {
  label: string
  volumeKg: number
  sets: number
  timestamp: number
}

export type RepMaxConfidence = 'high' | 'medium' | 'low'

export type RepMaxSuggestionKg = {
  reps: number
  weightKg: number
  percentOf1RM: number
  confidence: RepMaxConfidence
}

