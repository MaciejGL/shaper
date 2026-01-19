/**
 * Centralized discount configuration for all bundle types
 * Update these values to change discounts across the entire app
 */

export const DISCOUNT_CONFIG = {
  /**
   * In-Person Sessions discount when Premium Coaching package is present
   * Default: 50%
   */
  IN_PERSON_COACHING_COMBO: 50,

  /**
   * Meal Plan + Training Plan bundle discount
   * Applied when both packages are selected together
   * Default: 20%
   */
  MEAL_TRAINING_BUNDLE: 20,
} as const

export const TRAINER_CUSTOM_DISCOUNT_LIMITS = {
  minPercent: 1,
  maxPercent: 90,
  minMonths: 1,
  maxMonths: 12,
} as const

/**
 * Discount metadata types for Stripe coupons
 */
export const DISCOUNT_TYPES = {
  IN_PERSON_COACHING_COMBO: 'in_person_coaching_combo',
  MEAL_TRAINING_BUNDLE: 'meal_training_bundle',
  TRAINER_CUSTOM_DISCOUNT: 'trainer_custom_discount',
} as const

/**
 * Human-readable discount labels for UI display
 */
export const DISCOUNT_LABELS = {
  IN_PERSON_COACHING_COMBO: `${DISCOUNT_CONFIG.IN_PERSON_COACHING_COMBO}% off with Premium Coaching`,
  MEAL_TRAINING_BUNDLE: `Save ${DISCOUNT_CONFIG.MEAL_TRAINING_BUNDLE}%`,
  MEAL_TRAINING_BUNDLE_SHORT: `${DISCOUNT_CONFIG.MEAL_TRAINING_BUNDLE}% off`,
} as const

/**
 * Helper to get discount percentage by type
 */
export function getDiscountPercentage(
  discountType: keyof typeof DISCOUNT_CONFIG,
): number {
  return DISCOUNT_CONFIG[discountType]
}

/**
 * Helper to format discount percentage for display
 */
export function formatDiscountLabel(
  discountType: keyof typeof DISCOUNT_CONFIG,
  format: 'short' | 'full' = 'short',
): string {
  const percentage = DISCOUNT_CONFIG[discountType]

  if (format === 'full') {
    switch (discountType) {
      case 'IN_PERSON_COACHING_COMBO':
        return `${percentage}% discount on in-person sessions`
      case 'MEAL_TRAINING_BUNDLE':
        return `${percentage}% bundle discount`
      default:
        return `${percentage}% off`
    }
  }

  return `${percentage}% off`
}
