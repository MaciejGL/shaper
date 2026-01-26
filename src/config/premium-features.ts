import { FREEZE_CONFIG } from './freeze-config'
import { SUBSCRIPTION_LIMITS } from './subscription-limits'

export const PREMIUM_FEATURES = [
  {
    id: 'unlimited_training_plans',
    category: 'training_plans',
    copy: {
      short: 'Unlimited plans',
      medium: 'Unlimited training plans',
      long: `Create and save unlimited training plans (free plan includes up to ${SUBSCRIPTION_LIMITS.FREE.FAVOURITE_WORKOUTS}).`,
    },
    includeIn: {
      email: true,
      pricing: true,
    },
  },
  {
    id: 'premium_training_plans_library',
    category: 'training_plans',
    copy: {
      short: 'Coach-made plans',
      medium: 'Coach-made premium plans library',
      long: 'Follow proven training plans designed by experienced coaches in Explore.',
    },
    includeIn: {
      email: true,
      pricing: true,
    },
  },
  {
    id: 'advanced_tracking_and_logging',
    category: 'progress',
    copy: {
      short: 'Advanced tracking',
      medium: 'Advanced progress tracking & analytics',
      long: 'See exactly how you are progressing with heatmaps, check-ins and detailed workout logs.',
    },
    includeIn: {
      email: true,
      pricing: true,
    },
  },
  {
    id: 'exercise_videos_and_instructions',
    category: 'exercise_content',
    copy: {
      short: 'Exercise videos',
      medium: 'Full exercise video library',
      long: 'Unlock the full exercise library with demo videos, cues and detailed instructions for every movement.',
    },
    includeIn: {
      email: true,
      pricing: true,
    },
  },
  {
    id: 'unlimited_favourites',
    category: 'training_plans',
    copy: {
      short: 'Unlimited favourites',
      medium: 'Unlimited favourite workouts & folders',
      long: `Save unlimited favourite workouts and folders (free plan includes up to ${SUBSCRIPTION_LIMITS.FREE.FAVOURITE_WORKOUTS} workouts and ${SUBSCRIPTION_LIMITS.FREE.FAVOURITE_FOLDERS} folders).`,
    },
    includeIn: {
      email: false,
      pricing: false,
    },
  },
  {
    id: 'ai_quick_workout_generation',
    category: 'ai',
    copy: {
      short: 'Smart workouts',
      medium: 'Smart workout generation',
      long: 'Instantly generate workouts tailored to your recovery status and muscle focus.',
    },
    includeIn: {
      email: false,
      pricing: false,
    },
  },
  {
    id: 'ai_exercise_suggestions',
    category: 'ai',
    copy: {
      short: 'Smart suggestions',
      medium: 'Smart exercise suggestions',
      long: 'Get AI-powered exercise suggestions as you build your workouts.',
    },
    includeIn: {
      email: false,
      pricing: false,
    },
  },
  {
    id: 'ai_training_analytics',
    category: 'ai',
    copy: {
      short: 'AI insights',
      medium: 'AI training insights',
      long: 'See where you are recovered and what to train next with AI-powered recovery and focus insights.',
    },
    includeIn: {
      email: false,
      pricing: false,
    },
  },
  {
    id: 'body_measurements_logging',
    category: 'progress',
    copy: {
      short: 'Body stats',
      medium: 'Track body measurements',
      long: 'Track weight and body measurements over time to see real changes.',
    },
    includeIn: {
      email: false,
      pricing: false,
    },
  },
  {
    id: 'progress_photos',
    category: 'progress',
    copy: {
      short: 'Progress photos',
      medium: 'Progress photo tracking',
      long: 'Upload, store and compare progress photos side by side.',
    },
    includeIn: {
      email: false,
      pricing: false,
    },
  },
  {
    id: 'muscle_heatmap',
    category: 'progress',
    copy: {
      short: 'Muscle heatmap',
      medium: 'Muscle training heatmap',
      long: 'See weekly training volume for each muscle group at a glance.',
    },
    includeIn: {
      email: false,
      pricing: false,
    },
  },
  {
    id: 'activity_heatmap',
    category: 'progress',
    copy: {
      short: 'Activity heatmap',
      medium: 'Training consistency heatmap',
      long: 'Visualize your training consistency across days and weeks so you never break the streak.',
    },
    includeIn: {
      email: false,
      pricing: false,
    },
  },
  {
    id: 'checkin_schedule',
    category: 'progress',
    copy: {
      short: 'Scheduled check-ins',
      medium: 'Recurring progress check-ins',
      long: 'Schedule recurring progress check-ins so you always remember to measure and adjust.',
    },
    includeIn: {
      email: false,
      pricing: false,
    },
  },
  {
    id: 'premium_exercises_access',
    category: 'exercise_content',
    copy: {
      short: 'Premium exercises',
      medium: 'Expanded exercise library',
      long: 'Unlock extra premium exercises to add more variety to your training.',
    },
    includeIn: {
      email: false,
      pricing: false,
    },
  },
  {
    id: 'subscription_freeze_yearly',
    category: 'subscription_perks',
    copy: {
      short: 'Pause subscription',
      medium: `Pause your subscription for up to ${FREEZE_CONFIG.MAX_DAYS_PER_YEAR} days per year`,
      long: `Yearly perk: pause your subscription for up to ${FREEZE_CONFIG.MAX_DAYS_PER_YEAR} days per year, perfect for holidays or time away from training.`,
    },
    includeIn: {
      email: false,
      pricing: false,
    },
  },
] as const

export type PremiumFeature = (typeof PREMIUM_FEATURES)[number]
export type PremiumFeatureId = PremiumFeature['id']
export type PremiumFeatureCategory = PremiumFeature['category']

export const PREMIUM_BENEFITS_EMAIL = PREMIUM_FEATURES.filter(
  (f) => f.includeIn.email,
).map((f) => f.copy.medium)

export const PREMIUM_BENEFITS_PRICING = PREMIUM_FEATURES.filter(
  (f) => f.includeIn.pricing,
).map((f) => f.copy.medium)
