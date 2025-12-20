/**
 * Centralized Product Copy
 *
 * Marketing copy for all Hypertro products.
 * Used across pricing screens, upgrade prompts, and product descriptions.
 *
 * Note: Prices are fetched dynamically from Stripe, not stored here.
 */
import { FREEZE_CONFIG } from './freeze-config'
import { PREMIUM_BENEFITS_PRICING, PREMIUM_FEATURES } from './premium-features'
import { SUBSCRIPTION_CONFIG } from './subscription-config'

// Premium subscription benefits (marketing copy source of truth lives in premium-features.ts)
export const PREMIUM_BENEFITS = PREMIUM_BENEFITS_PRICING

export const PREMIUM_YEARLY_BENEFITS = [
  ...PREMIUM_BENEFITS,
  PREMIUM_FEATURES.find((f) => f.id === 'subscription_freeze_yearly')!.copy
    .medium,
] as const

// Product descriptions (prices are fetched dynamically from Stripe)
export const PRODUCT_COPY = {
  // Platform subscriptions
  premiumMonthly: {
    name: 'Hypertro Premium',
    shortDescription: 'Serious training plans and progress tracking.',
    benefits: PREMIUM_BENEFITS,
  },

  premiumYearly: {
    name: 'Hypertro Premium – Yearly',
    shortDescription: 'Same features as monthly, with an annual discount.',
    benefits: PREMIUM_YEARLY_BENEFITS,
  },

  // Trainer services
  onlineCoaching: {
    name: '1:1 Online Coaching',
    shortDescription:
      'Work directly with a coach who builds and adjusts your training around your life.',
    bestFor: 'Lifters who want accountability and a personalized plan',
    benefits: [
      'Fully personalized training around your goals and equipment',
      'Optional nutrition guidance to support your training',
      'Weekly check-ins to review progress and adjust your plan',
      'Chat with your coach directly inside the app',
      'Hypertro Premium features included',
    ],
  },

  ptSession: {
    name: 'PT Session (In-person)',
    shortDescription:
      'One focused session with a coach to fix form or reset your training.',
    priceType: 'one-time' as const,
    benefits: [
      '1 x 60-minute in-person session',
      'Technique checks and form corrections',
      'Clear next steps for your training',
      'Ideal as a form check or a reset',
    ],
  },

  trainingPlan: {
    name: 'Training Plan',
    shortDescription: 'A personalized program for 8–12 weeks.',
    priceType: 'one-time' as const,
    benefits: [
      'Personalized plan for 8–12 weeks',
      'Based on your goals, experience and equipment',
      'Delivered and tracked inside Hypertro',
      'One round of adjustments within the first 7 days',
    ],
  },

  nutritionPlan: {
    name: 'Nutrition Plan',
    shortDescription: 'Realistic nutrition matched to your training.',
    priceType: 'one-time' as const,
    benefits: [
      'Calorie and macro targets tailored to you',
      'Example meals and structure for a normal week',
      'Adjusted for your preferences and constraints',
      'Practical, not a "bodybuilding bro diet"',
    ],
  },
} as const

// Freeze feature copy
export const FREEZE_COPY = {
  shortBenefit: `Pause up to ${FREEZE_CONFIG.MAX_DAYS_PER_YEAR} days per year if you're sick or on vacation`,
  longDescription: `You can pause your Hypertro Premium subscription for up to ${FREEZE_CONFIG.MAX_DAYS_PER_YEAR} days per year if you're sick, injured or on vacation. While paused, you won't be charged, and your paid period is extended by the number of paused days. Minimum pause is ${FREEZE_CONFIG.MIN_DAYS_PER_PAUSE} days and maximum ${FREEZE_CONFIG.MAX_DAYS_PER_PAUSE} days per pause.`,
  notEligibleYet: 'Pausing is available after your first paid month.',
  quotaExhausted: `You've used all ${FREEZE_CONFIG.MAX_DAYS_PER_YEAR} pause days this year.`,
  currentlyPaused: 'Your subscription is paused until',
} as const

// Trial copy
export const TRIAL_COPY = {
  badge: `${SUBSCRIPTION_CONFIG.TRIAL_PERIOD_DAYS}-Day Free Trial`,
  bannerText: `Start your ${SUBSCRIPTION_CONFIG.TRIAL_PERIOD_DAYS}-day free trial. Cancel anytime.`,
  noCommitment: 'No commitment. Cancel before the trial ends.',
} as const

export type ProductKey = keyof typeof PRODUCT_COPY
