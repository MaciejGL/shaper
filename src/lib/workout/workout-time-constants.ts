// Centralized workout duration constants (in seconds)
// Used across client and server for consistent time calculations

export const WORKOUT_TIME_CONSTANTS = {
  /** Time to perform one set (seconds) */
  SET_EXECUTION: 45,
  /** Time per set for equipment handling and moving (seconds) */
  EQUIPMENT_OVERHEAD: 10,
  /** Default rest between sets (seconds) */
  DEFAULT_REST: 90,
  /** Time to change/setup between exercises - 2 minutes (seconds) */
  EXERCISE_TRANSITION: 120,
} as const

/** Combined time per set: execution + equipment overhead */
export const TIME_PER_SET =
  WORKOUT_TIME_CONSTANTS.SET_EXECUTION + WORKOUT_TIME_CONSTANTS.EQUIPMENT_OVERHEAD




