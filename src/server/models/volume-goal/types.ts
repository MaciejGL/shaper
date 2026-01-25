import type { VolumeGoalPeriod } from '@/generated/prisma/client'

export interface VolumeGoalPeriodDTO {
  id: string
  focusPreset: string
  commitment: string
  startedAt: string
  endedAt: string | null
}

export type VolumeGoalPeriodRecord = VolumeGoalPeriod
