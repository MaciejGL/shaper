export interface FreezeEligibility {
  canFreeze: boolean
  reason: string | null
  daysRemaining: number
  minDays: number
  maxDays: number
  availableFrom: string | null
  isPaused: boolean
  pauseEndsAt: string | null
}
