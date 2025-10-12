import Stripe from 'stripe'

import { GQLServiceType } from '@/generated/graphql-client'

import { DISCOUNT_CONFIG, DISCOUNT_TYPES } from './discount-config'
import { getStripePricingInfo } from './pricing-utils'
import { stripe } from './stripe'
import { CheckoutItem, PackageWithDiscount } from './types'

/**
 * Finds the in-person discount percentage from packages in a bundle
 * Looks for packages with 'coaching_complete' serviceType that have discount metadata
 */
export function findInPersonDiscountPercentage(
  packages: PackageWithDiscount[],
): number {
  for (const pkg of packages) {
    // Check if this is a coaching_complete package with discount metadata
    if (pkg.serviceType === 'coaching_complete') {
      const discountPercentage = pkg.metadata?.in_person_discount_percentage
      if (discountPercentage && Number(discountPercentage) > 0) {
        return Number(discountPercentage)
      }
    }
  }

  return 0
}

/**
 * Checks if bundle contains both meal plan and training plan packages
 * Returns configured bundle discount percentage if both are present
 */
export function findMealTrainingBundleDiscount(
  packages: PackageWithDiscount[],
): number {
  const hasMealPlan = packages.some((pkg) => pkg.serviceType === 'meal_plan')
  const hasTrainingPlan = packages.some(
    (pkg) => pkg.serviceType === 'workout_plan',
  )

  if (hasMealPlan && hasTrainingPlan) {
    return DISCOUNT_CONFIG.MEAL_TRAINING_BUNDLE
  }

  return 0
}

/**
 * Checks if a package qualifies for meal+training bundle discount
 */
export function isMealOrTrainingPackage(pkg: PackageWithDiscount): boolean {
  return pkg.serviceType === 'meal_plan' || pkg.serviceType === 'workout_plan'
}

/**
 * Calculates the discounted amount based on bundle context
 *
 * Applies discount if:
 * 1. Package contains 'in_person_meeting' service type + coaching_complete bundle
 * 2. Package is meal_plan or workout_plan + both are in bundle (20% off)
 */
export function getDiscountedAmount(
  pkg: PackageWithDiscount,
  originalAmount: number,
  bundleDiscount: number = 0,
  mealTrainingDiscount: number = 0,
): number {
  // Check if package has IN_PERSON_MEETING service type
  const hasInPersonService = pkg.serviceType === 'in_person_meeting'

  // Apply in-person discount if package has in-person service and bundle has discount
  if (hasInPersonService && bundleDiscount > 0) {
    const discountMultiplier = (100 - bundleDiscount) / 100
    return Math.round(originalAmount * discountMultiplier)
  }

  // Apply meal+training bundle discount
  if (isMealOrTrainingPackage(pkg) && mealTrainingDiscount > 0) {
    const discountMultiplier = (100 - mealTrainingDiscount) / 100
    return Math.round(originalAmount * discountMultiplier)
  }

  return originalAmount
}

/**
 * Checks if a package qualifies for in-person discount in the current bundle
 */
export function hasInPersonDiscount(
  pkg: PackageWithDiscount,
  bundleDiscount: number = 0,
): boolean {
  if (!pkg.serviceType) return false
  const hasInPersonService = pkg.serviceType === 'in_person_meeting'

  return hasInPersonService && bundleDiscount > 0
}

/**
 * Creates Stripe line item with dynamic pricing for discounted packages
 */
export async function createDiscountedLineItem(
  pkg: PackageWithDiscount,
  quantity: number,
  discountedAmount: number,
): Promise<Stripe.Checkout.SessionCreateParams.LineItem> {
  if (!pkg.stripeLookupKey) {
    throw new Error(
      `Package ${pkg.name} does not have a valid Stripe lookup key`,
    )
  }

  // Get original pricing info to preserve subscription details
  const originalPrice = await getStripePricingInfo(pkg.stripeLookupKey)

  if (!originalPrice) {
    throw new Error(`Could not retrieve pricing for ${pkg.stripeLookupKey}`)
  }

  return {
    price_data: {
      currency: originalPrice.currency.toLowerCase(),
      product_data: {
        name: `${pkg.name} (Discounted)`,
        description: `Special bundle pricing`,
      },
      unit_amount: discountedAmount,
      ...(originalPrice.type === 'subscription' &&
        originalPrice.recurring && {
          recurring: {
            interval: originalPrice.recurring.interval as 'month' | 'year',
            interval_count: originalPrice.recurring.interval_count,
          },
        }),
    },
    quantity,
  }
}

/**
 * Maps database service type to frontend GQL service type
 */
export function mapServiceType(
  serviceType: string | null,
): GQLServiceType | null {
  if (!serviceType) return null

  const mapping: Record<string, GQLServiceType> = {
    meal_plan: GQLServiceType.MealPlan,
    workout_plan: GQLServiceType.WorkoutPlan,
    coaching_complete: GQLServiceType.CoachingComplete,
    in_person_meeting: GQLServiceType.InPersonMeeting,
    premium_access: GQLServiceType.PremiumAccess,
  }

  return mapping[serviceType] || null
}

/**
 * Finds packages that are in-person sessions by lookup key
 */
export function findInPersonPackages(
  checkoutItems: CheckoutItem[],
): CheckoutItem[] {
  return checkoutItems.filter((item) => {
    return item.package.stripeLookupKey === 'in_person_session'
  })
}

/**
 * Finds packages that are meal or training plans by lookup key
 */
export function findMealAndTrainingPackages(
  checkoutItems: CheckoutItem[],
): CheckoutItem[] {
  return checkoutItems.filter((item) => {
    return (
      item.package.stripeLookupKey === 'nutrition_plan' ||
      item.package.stripeLookupKey === 'workout_plan'
    )
  })
}

/**
 * Gets Stripe product IDs from lookup keys
 */
export async function getProductIdsFromLookupKeys(
  lookupKeys: (string | null | undefined)[],
): Promise<string[]> {
  const productIds: string[] = []

  for (const lookupKey of lookupKeys) {
    if (lookupKey) {
      try {
        const prices = await stripe.prices.list({
          lookup_keys: [lookupKey],
          limit: 1,
        })

        if (prices.data.length > 0) {
          const price = prices.data[0]
          if (typeof price.product === 'string') {
            productIds.push(price.product)
          }
        }
      } catch (error) {
        console.warn(
          `Failed to retrieve product for lookup key ${lookupKey}:`,
          error,
        )
      }
    }
  }

  return productIds
}

/**
 * Creates a coupon for in-person sessions discount when premium coaching is present
 */
export async function createInPersonCoachingComboCoupon(
  productIds: string[],
  offerToken: string,
): Promise<Stripe.Coupon> {
  const discountPercent = DISCOUNT_CONFIG.IN_PERSON_COACHING_COMBO

  return await stripe.coupons.create({
    percent_off: discountPercent,
    duration: 'once',
    name: `In-Person Sessions ${discountPercent}% Off`,
    applies_to: {
      products: productIds,
    },
    metadata: {
      source: 'trainer_offer',
      discountType: DISCOUNT_TYPES.IN_PERSON_COACHING_COMBO,
      offerToken,
    },
  })
}

/**
 * Creates discount coupon for in-person sessions if premium coaching is present
 */
export async function createInPersonDiscountIfEligible(
  checkoutItems: CheckoutItem[],
  hasCoachingCombo: boolean,
  offerToken: string,
): Promise<{ coupon: string } | null> {
  if (!hasCoachingCombo) {
    return null
  }

  // Find in-person session packages
  const inPersonPackages = findInPersonPackages(checkoutItems)

  if (inPersonPackages.length === 0) {
    return null
  }

  // Get product IDs from lookup keys
  const lookupKeys = inPersonPackages
    .map((pkg) => pkg.package.stripeLookupKey)
    .filter(Boolean)

  const productIds = await getProductIdsFromLookupKeys(lookupKeys)

  if (productIds.length === 0) {
    return null
  }

  // Create the coupon
  const coupon = await createInPersonCoachingComboCoupon(productIds, offerToken)

  return { coupon: coupon.id }
}

/**
 * Creates a coupon for meal+training bundle with configured discount
 */
export async function createMealTrainingBundleCoupon(
  productIds: string[],
  offerToken: string,
): Promise<Stripe.Coupon> {
  const discountPercent = DISCOUNT_CONFIG.MEAL_TRAINING_BUNDLE

  return await stripe.coupons.create({
    percent_off: discountPercent,
    duration: 'once',
    name: `Meal + Training Bundle ${discountPercent}% Off`,
    applies_to: {
      products: productIds,
    },
    metadata: {
      source: 'trainer_offer',
      discountType: DISCOUNT_TYPES.MEAL_TRAINING_BUNDLE,
      offerToken,
    },
  })
}

/**
 * Creates discount coupon for meal+training bundle if both are present
 */
export async function createMealTrainingBundleDiscountIfEligible(
  checkoutItems: CheckoutItem[],
  offerToken: string,
): Promise<{ coupon: string } | null> {
  const mealAndTrainingPackages = findMealAndTrainingPackages(checkoutItems)

  // Check if we have both meal and training plans by lookup key
  const hasMealPlan = mealAndTrainingPackages.some(
    (item) => item.package.stripeLookupKey === 'nutrition_plan',
  )

  const hasTrainingPlan = mealAndTrainingPackages.some(
    (item) => item.package.stripeLookupKey === 'workout_plan',
  )

  if (!hasMealPlan || !hasTrainingPlan) {
    return null
  }

  // Get product IDs from lookup keys
  const lookupKeys = mealAndTrainingPackages
    .map((pkg) => pkg.package.stripeLookupKey)
    .filter(Boolean)

  const productIds = await getProductIdsFromLookupKeys(lookupKeys)

  if (productIds.length === 0) {
    return null
  }

  // Create the coupon
  const coupon = await createMealTrainingBundleCoupon(productIds, offerToken)

  return { coupon: coupon.id }
}
