interface CalorieInput {
  durationMinutes: number
  weightKg: number
  heightCm: number
  age: number
  gender: 'male' | 'female'
  intensity?: 'low' | 'moderate' | 'high'
}

/**
 * Estimates total calories burned during workout using BMR × intensity-based multiplier.
 *
 * @param durationMinutes - How long the workout lasted
 * @param weightKg - User's weight
 * @param heightCm - User's height
 * @param age - User's age
 * @param gender - Biological sex
 * @param intensity - Workout intensity level
 * @returns Calories burned during workout
 */
export function calculateCaloriesBurned({
  durationMinutes,
  weightKg,
  heightCm,
  age,
  gender,
}: CalorieInput): {
  low: number
  moderate: number
  high: number
  caloriesPerMinuteLow: number
  caloriesPerMinuteModerate: number
  caloriesPerMinuteHigh: number
} {
  if (!durationMinutes || !weightKg || !age || !heightCm)
    return {
      low: 0,
      moderate: 0,
      high: 0,
      caloriesPerMinuteLow: 0,
      caloriesPerMinuteModerate: 0,
      caloriesPerMinuteHigh: 0,
    }

  const bmr = calculateBMR({ weightKg, heightCm, age, gender })

  /**
   * Explanation:
   * - BMR is per day → divide by 1440 to get per minute
   * - Intensity multiplier simulates how much above resting level you burn
   */
  const intensityMultiplier = {
    low: 0.035,
    moderate: 0.055,
    high: 0.08,
  }

  const caloriesPerMinuteLow = (bmr / 1440) * (intensityMultiplier.low * 100)
  const caloriesPerMinuteModerate =
    (bmr / 1440) * (intensityMultiplier.moderate * 100)
  const caloriesPerMinuteHigh = (bmr / 1440) * (intensityMultiplier.high * 100)

  return {
    low: Math.round(caloriesPerMinuteLow * durationMinutes),
    moderate: Math.round(caloriesPerMinuteModerate * durationMinutes),
    high: Math.round(caloriesPerMinuteHigh * durationMinutes),
    caloriesPerMinuteLow: Math.round(caloriesPerMinuteLow),
    caloriesPerMinuteModerate: Math.round(caloriesPerMinuteModerate),
    caloriesPerMinuteHigh: Math.round(caloriesPerMinuteHigh),
  }
}
/**
 * Calculates Basal Metabolic Rate (BMR) using the Mifflin-St Jeor equation.
 *
 * @param weightKg - Body weight in kilograms
 * @param heightCm - Height in centimeters
 * @param age - Age in years
 * @param gender - Biological sex
 * @returns BMR in kcal/day
 */
export function calculateBMR({
  weightKg,
  heightCm,
  age,
  gender,
}: {
  weightKg: number
  heightCm: number
  age: number
  gender: string
}): number {
  return gender.toLowerCase() === 'male'
    ? 10 * weightKg + 6.25 * heightCm - 5 * age + 5
    : 10 * weightKg + 6.25 * heightCm - 5 * age - 161
}
