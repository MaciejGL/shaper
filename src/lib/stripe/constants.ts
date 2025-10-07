/**
 * Client-safe Stripe constants
 * These can be imported in both client and server components
 */

// Stripe Product Price IDs (from environment variables)
export const STRIPE_PRODUCTS = {
  // Platform subscriptions
  PREMIUM_MONTHLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_MONTHLY,
  PREMIUM_YEARLY: process.env.NEXT_PUBLIC_STRIPE_PRICE_PREMIUM_YEARLY,

  // Trainer recurring services
  COACHING_COMBO: process.env.NEXT_PUBLIC_STRIPE_PRICE_COACHING_COMBO,

  // Trainer one-time services
  MEAL_PLAN: process.env.NEXT_PUBLIC_STRIPE_PRICE_MEAL_PLAN,
  WORKOUT_PLAN: process.env.NEXT_PUBLIC_STRIPE_PRICE_WORKOUT_PLAN,

  // Add-on services
  IN_PERSON_SESSION: process.env.NEXT_PUBLIC_STRIPE_PRICE_IN_PERSON_SESSION,
} as const
