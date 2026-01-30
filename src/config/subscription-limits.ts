export const SUBSCRIPTION_LIMITS = {
  FREE: {
    FAVOURITE_WORKOUTS: 6,
    FAVOURITE_FOLDERS: 2,
    CUSTOM_EXERCISES: 10,
    // Stats drawer limits (partial content gating)
    REP_MAX_ESTIMATES: 2,
    SET_SUGGESTIONS: 1,
  },
  PREMIUM: {
    TRAINING_PLANS: 30,
    FAVOURITE_WORKOUTS: 50,
    FAVOURITE_FOLDERS: 20,
  },
} as const
