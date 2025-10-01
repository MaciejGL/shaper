import { GQLCheckinFrequency } from '@/generated/graphql-client'

export interface CheckinScheduleFormData {
  frequency: GQLCheckinFrequency
  dayOfWeek?: number
  dayOfMonth?: number
}

export interface CheckinCompletionData {
  measurementData?: {
    weight?: number
    chest?: number
    waist?: number
    hips?: number
    neck?: number
    bicepsLeft?: number
    bicepsRight?: number
    thighLeft?: number
    thighRight?: number
    calfLeft?: number
    calfRight?: number
    bodyFat?: number
    notes?: string
  }
  progressLogData?: {
    notes?: string
    image1Url?: string
    image2Url?: string
    image3Url?: string
    shareWithTrainer?: boolean
  }
}

export const FREQUENCY_LABELS = {
  [GQLCheckinFrequency.Weekly]: 'Weekly',
  [GQLCheckinFrequency.Biweekly]: 'Every 2 weeks',
  [GQLCheckinFrequency.Monthly]: 'Monthly',
} as const

export const DAY_OF_WEEK_LABELS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const
