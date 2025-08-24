import { GQLServiceType } from '@/generated/graphql-client'

import { SelectedPackageItem, TrainerPackage } from './types'

/**
 * Finds the in-person discount percentage from packages in a bundle
 * Looks for packages with 'coaching_complete' serviceType that have discount metadata
 */
export const findInPersonDiscountPercentage = (
  packages: TrainerPackage[],
): number => {
  for (const pkg of packages) {
    // Check if this is a coaching_complete package with discount metadata
    if (pkg.serviceType === 'coaching_complete') {
      const discountPercentage = pkg.packageSummary?.addon_discount_in_person
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
 * 1. Package contains 'IN_PERSON_MEETING' service type
 * 2. Bundle contains a 'coaching_complete' package with discount metadata
 */
export const getDiscountedAmount = (
  pkg: TrainerPackage,
  bundleDiscount: number = 0,
): number => {
  if (!pkg.pricing) return 0

  // Check if package has IN_PERSON_MEETING service type
  const hasInPersonService = pkg.serviceType === 'in_person_meeting'

  // Apply discount if package has in-person service and bundle has discount
  if (hasInPersonService && bundleDiscount > 0) {
    const discountMultiplier = (100 - bundleDiscount) / 100
    return Math.round(pkg.pricing.amount * discountMultiplier)
  }

  return pkg.pricing.amount
}

/**
 * Formats a price with currency symbol and handles different pricing types
 * Applies in-person discount based on bundle context
 */
export const formatPrice = (
  pkg: TrainerPackage,
  quantity: number = 1,
  bundleDiscount: number = 0,
): string => {
  if (!pkg.pricing) return 'Price TBD'

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    NOK: 'kr',
    GBP: '£',
  }

  const symbol = symbols[pkg.pricing.currency] || pkg.pricing.currency
  const discountedAmount = getDiscountedAmount(pkg, bundleDiscount)
  const baseValue = (discountedAmount / 100).toFixed(2)
  const totalValue = ((discountedAmount * quantity) / 100).toFixed(2)

  const basePrice =
    pkg.pricing.currency === 'NOK'
      ? `${baseValue} ${symbol}`
      : `${symbol}${baseValue}`
  const totalPrice =
    pkg.pricing.currency === 'NOK'
      ? `${totalValue} ${symbol}`
      : `${symbol}${totalValue}`

  if (pkg.pricing.type === 'subscription' && pkg.pricing.recurring) {
    const interval =
      pkg.pricing.recurring.interval_count > 1
        ? `${pkg.pricing.recurring.interval_count} ${pkg.pricing.recurring.interval}s`
        : pkg.pricing.recurring.interval
    return `${basePrice}/${interval}`
  }

  // For one-time purchases, show quantity calculation if quantity > 1
  if (quantity > 1) {
    return `${basePrice} × ${quantity} = ${totalPrice}`
  }

  return basePrice
}

/**
 * Gets a human-readable description for service types
 */
export const getServiceDescription = (serviceType: GQLServiceType): string => {
  const descriptions: Record<GQLServiceType, string> = {
    meal_plan: 'Custom Meal Plan',
    workout_plan: 'Personalized Workout Plan',
    coaching_complete: 'Personal Coaching Sessions',
    in_person_meeting: 'In-Person Training',
    premium_access: 'Premium Platform Access',
  }

  return descriptions[serviceType] || serviceType
}

/**
 * Checks if a package allows quantity selection (only one-time services)
 */
export const allowsQuantitySelection = (pkg: TrainerPackage): boolean => {
  return pkg.pricing?.type === 'one-time'
}

/**
 * Checks if a package qualifies for in-person discount in the current bundle
 */
export const hasInPersonDiscount = (
  pkg: TrainerPackage,
  bundleDiscount: number = 0,
): boolean => {
  if (!pkg.serviceType) return false
  const hasInPersonService = pkg.serviceType === 'in_person_meeting'

  return hasInPersonService && bundleDiscount > 0
}

/**
 * Gets the applicable discount percentage for a package in the bundle context
 */
export const getDiscountPercentage = (
  pkg: TrainerPackage,
  bundleDiscount: number = 0,
): number => {
  // Check if package has IN_PERSON_MEETING service type
  const hasInPersonService = pkg.serviceType === 'in_person_meeting'

  return hasInPersonService && bundleDiscount > 0 ? bundleDiscount : 0
}

/**
 * Formats the original (non-discounted) price for display
 */
export const formatOriginalPrice = (
  pkg: TrainerPackage,
  quantity: number = 1,
): string => {
  if (!pkg.pricing) return 'Price TBD'

  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    NOK: 'kr',
    GBP: '£',
  }

  const symbol = symbols[pkg.pricing.currency] || pkg.pricing.currency
  const baseValue = (pkg.pricing.amount / 100).toFixed(2)
  const totalValue = ((pkg.pricing.amount * quantity) / 100).toFixed(2)

  const basePrice =
    pkg.pricing.currency === 'NOK'
      ? `${baseValue} ${symbol}`
      : `${symbol}${baseValue}`
  const totalPrice =
    pkg.pricing.currency === 'NOK'
      ? `${totalValue} ${symbol}`
      : `${symbol}${totalValue}`

  if (pkg.pricing.type === 'subscription' && pkg.pricing.recurring) {
    const interval =
      pkg.pricing.recurring.interval_count > 1
        ? `${pkg.pricing.recurring.interval_count} ${pkg.pricing.recurring.interval}s`
        : pkg.pricing.recurring.interval
    return `${basePrice}/${interval}`
  }

  // For one-time purchases, show quantity calculation if quantity > 1
  if (quantity > 1) {
    return `${basePrice} × ${quantity} = ${totalPrice}`
  }

  return basePrice
}

/**
 * Calculates the total cost breakdown for a bundle of selected packages
 * Applies in-person discount from coaching_complete packages to in_person_meeting packages
 */
export const calculateBundleTotal = (
  selectedPackages: SelectedPackageItem[],
) => {
  let oneTimeTotal = 0
  let monthlyTotal = 0
  const hasSubscriptions = selectedPackages.some(
    (item) => item.package.pricing?.type === 'subscription',
  )

  // Find the discount percentage from coaching_complete packages in the bundle
  const bundleDiscount = findInPersonDiscountPercentage(
    selectedPackages.map((item) => item.package),
  )

  selectedPackages.forEach((item) => {
    const pricing = item.package.pricing
    if (!pricing) return

    // Apply discount based on bundle context
    const discountedAmount = getDiscountedAmount(item.package, bundleDiscount)
    const itemTotal = (discountedAmount * item.quantity) / 100 // Convert from cents

    if (pricing.type === 'one-time') {
      oneTimeTotal += itemTotal
    } else if (pricing.type === 'subscription') {
      monthlyTotal += itemTotal
    }
  })

  return {
    oneTimeTotal,
    monthlyTotal,
    hasSubscriptions,
    currency: selectedPackages[0]?.package.pricing?.currency || 'USD',
  }
}

/**
 * Calculates the total discount amount (savings) in currency for a bundle
 * Returns the difference between original price and discounted price
 */
export const calculateDiscountAmount = (
  selectedPackages: SelectedPackageItem[],
): number => {
  let originalTotal = 0
  let discountedTotal = 0

  // Find the discount percentage from coaching_complete packages in the bundle
  const bundleDiscount = findInPersonDiscountPercentage(
    selectedPackages.map((item) => item.package),
  )

  selectedPackages.forEach((item) => {
    const pricing = item.package.pricing
    if (!pricing) return

    // Calculate original amount (no discount)
    const originalAmount = (pricing.amount * item.quantity) / 100
    originalTotal += originalAmount

    // Calculate discounted amount
    const discountedAmount = getDiscountedAmount(item.package, bundleDiscount)
    const discountedAmountTotal = (discountedAmount * item.quantity) / 100
    discountedTotal += discountedAmountTotal
  })

  // Return the savings amount
  return originalTotal - discountedTotal
}

/**
 * Gets the appropriate currency symbol for display
 */
export const getCurrencySymbol = (currency: string): string => {
  const symbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    NOK: 'kr',
    GBP: '£',
  }
  return symbols[currency] || currency
}
