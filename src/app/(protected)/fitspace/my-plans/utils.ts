import { UnifiedPlan } from './types'

/**
 * Gets the first available image from a training plan.
 * Searches in priority order:
 * 1. Plan's heroImageUrl
 * 2. First exercise image found in any week/day/exercise
 *
 * @param plan - The training plan to search for images
 * @returns URL of the first available image, or null if none found
 */
export function getPlanImage(plan: UnifiedPlan): string | null {
  if (!plan) return null

  // Priority 1: Check hero image
  if ('heroImageUrl' in plan && plan.heroImageUrl) {
    return plan.heroImageUrl
  }

  // Priority 2: Search through all weeks, days, and exercises
  if ('weeks' in plan && plan.weeks && plan.weeks.length > 0) {
    for (const week of plan.weeks) {
      if (!week?.days || week.days.length === 0) continue

      for (const day of week.days) {
        if (!day?.exercises || day.exercises.length === 0) continue

        for (const exercise of day.exercises) {
          if (!exercise?.images || exercise.images.length === 0) continue

          const firstImage = exercise.images[1]
          if (firstImage) {
            return firstImage.url || null
          }
        }
      }
    }
  }

  return null
}
