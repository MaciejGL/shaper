import Stripe from 'stripe'

import { GQLServiceType } from '@/generated/graphql-client'

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
 * Calculates the discounted amount based on bundle context
 *
 * Applies discount if:
 * 1. Package contains 'in_person_meeting' service type
 * 2. Bundle contains a 'coaching_complete' package with discount metadata
 */
export function getDiscountedAmount(
  pkg: PackageWithDiscount,
  originalAmount: number,
  bundleDiscount: number = 0,
): number {
  // Check if package has IN_PERSON_MEETING service type
  const hasInPersonService = pkg.serviceType === 'in_person_meeting'

  // Apply discount if package has in-person service and bundle has discount
  if (hasInPersonService && bundleDiscount > 0) {
    const discountMultiplier = (100 - bundleDiscount) / 100
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
  if (!pkg.stripePriceId) {
    throw new Error(`Package ${pkg.name} does not have a valid Stripe price ID`)
  }

  // Get original pricing info to preserve subscription details
  const originalPrice = await getStripePricingInfo(pkg.stripePriceId)

  if (!originalPrice) {
    throw new Error(`Could not retrieve pricing for ${pkg.stripePriceId}`)
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
 * Finds packages that are in-person sessions from checkout items
 */
export function findInPersonPackages(
  checkoutItems: CheckoutItem[],
): CheckoutItem[] {
  return checkoutItems.filter((item) => {
    const metadata = (item.package.metadata as Record<string, unknown>) || {}
    return metadata.service_type === 'in_person_meeting'
  })
}

/**
 * Gets Stripe product IDs from price IDs
 */
export async function getProductIdsFromPrices(
  priceIds: (string | null | undefined)[],
): Promise<string[]> {
  const productIds: string[] = []

  for (const priceId of priceIds) {
    if (priceId) {
      try {
        const price = await stripe.prices.retrieve(priceId)
        if (typeof price.product === 'string') {
          productIds.push(price.product)
        }
      } catch (error) {
        console.warn(`Failed to retrieve product for price ${priceId}:`, error)
      }
    }
  }

  return productIds
}

/**
 * Creates a coupon for 50% discount on in-person sessions when coaching combo is present
 */
export async function createInPersonCoachingComboCoupon(
  productIds: string[],
  offerToken: string,
): Promise<Stripe.Coupon> {
  return await stripe.coupons.create({
    percent_off: 50,
    duration: 'once',
    name: 'In-Person Sessions 50% Off',
    applies_to: {
      products: productIds,
    },
    metadata: {
      source: 'trainer_offer',
      discountType: 'in_person_coaching_combo',
      offerToken,
    },
  })
}

/**
 * Creates discount coupon for in-person sessions if coaching combo is present
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

  // Get product IDs from price IDs
  const priceIds = inPersonPackages
    .map((pkg) => pkg.package.stripePriceId)
    .filter(Boolean)

  const productIds = await getProductIdsFromPrices(priceIds)

  if (productIds.length === 0) {
    return null
  }

  // Create the coupon
  const coupon = await createInPersonCoachingComboCoupon(productIds, offerToken)

  return { coupon: coupon.id }
}
