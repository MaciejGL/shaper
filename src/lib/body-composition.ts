interface BodyCompositionInput {
  weight: number // kg
  height: number // cm
  age: number // years
  sex: 'male' | 'female'
  waist?: number // cm
  neck?: number // cm
  hips?: number // cm (required for women)
  chest?: number // cm
}

interface BodyFatResult {
  percentage: number
  method: string
  confidence: 'high' | 'medium' | 'low'
  missingMeasurements: string[]
}

/**
 * Estimates body fat percentage using the Navy Method (most accurate for general population)
 *
 * Men: Uses waist and neck circumferences
 * Women: Uses waist, neck, and hip circumferences
 *
 * @param input - Body measurements and user info
 * @returns Estimated body fat percentage with confidence level
 */
export function estimateBodyFatNavyMethod(
  input: BodyCompositionInput,
): BodyFatResult {
  const { height, waist, neck, hips, sex } = input
  const missingMeasurements: string[] = []

  // Normalize sex to lowercase for comparison
  const normalizedSex = sex.toLowerCase()

  // Check required measurements
  if (!waist) missingMeasurements.push('waist')
  if (!neck) missingMeasurements.push('neck')
  if (normalizedSex === 'female' && !hips) missingMeasurements.push('hips')

  if (missingMeasurements.length > 0) {
    return {
      percentage: 0,
      method: 'Navy Method',
      confidence: 'low',
      missingMeasurements,
    }
  }

  let bodyFat: number

  if (normalizedSex === 'male') {
    // Navy formula for men: 495 / (1.0324 - 0.19077 * log10(waist - neck) + 0.15456 * log10(height)) - 450
    bodyFat =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waist! - neck!) +
          0.15456 * Math.log10(height)) -
      450
  } else {
    // Navy formula for women: 495 / (1.29579 - 0.35004 * log10(waist + hips - neck) + 0.22100 * log10(height)) - 450
    bodyFat =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waist! + hips! - neck!) +
          0.221 * Math.log10(height)) -
      450
  }

  // Ensure reasonable bounds (3-50% body fat)
  bodyFat = Math.max(3, Math.min(50, bodyFat))

  return {
    percentage: Math.round(bodyFat * 10) / 10, // Round to 1 decimal place
    method: 'Navy Method',
    confidence: 'high',
    missingMeasurements: [],
  }
}

/**
 * Estimates body fat percentage using the Army Method (alternative to Navy)
 * Similar to Navy but with slight formula adjustments
 */
export function estimateBodyFatArmyMethod(
  input: BodyCompositionInput,
): BodyFatResult {
  const { height, waist, neck, hips, sex } = input
  const missingMeasurements: string[] = []

  // Normalize sex to lowercase for comparison
  const normalizedSex = sex.toLowerCase()

  if (!waist) missingMeasurements.push('waist')
  if (!neck) missingMeasurements.push('neck')
  if (normalizedSex === 'female' && !hips) missingMeasurements.push('hips')

  if (missingMeasurements.length > 0) {
    return {
      percentage: 0,
      method: 'Army Method',
      confidence: 'low',
      missingMeasurements,
    }
  }

  let bodyFat: number

  if (normalizedSex === 'male') {
    // Army formula for men (slightly different coefficients)
    bodyFat =
      495 /
        (1.0324 -
          0.19077 * Math.log10(waist! - neck!) +
          0.15456 * Math.log10(height)) -
      450
  } else {
    // Army formula for women
    bodyFat =
      495 /
        (1.29579 -
          0.35004 * Math.log10(waist! + hips! - neck!) +
          0.221 * Math.log10(height)) -
      450
  }

  bodyFat = Math.max(3, Math.min(50, bodyFat))

  return {
    percentage: Math.round(bodyFat * 10) / 10,
    method: 'Army Method',
    confidence: 'high',
    missingMeasurements: [],
  }
}

/**
 * Estimates body fat percentage using BMI and demographics
 * Less accurate but works when circumference measurements are missing
 */
export function estimateBodyFatFromBMI(
  input: BodyCompositionInput,
): BodyFatResult {
  const { weight, height, age, sex } = input
  const missingMeasurements: string[] = []

  // Normalize sex to lowercase for comparison
  const normalizedSex = sex.toLowerCase()

  if (!weight || !height || !age) {
    if (!weight) missingMeasurements.push('weight')
    if (!height) missingMeasurements.push('height')
    if (!age) missingMeasurements.push('age')

    return {
      percentage: 0,
      method: 'BMI Method',
      confidence: 'low',
      missingMeasurements,
    }
  }

  const bmi = weight / Math.pow(height / 100, 2)

  let bodyFat: number

  if (normalizedSex === 'male') {
    // Deurenberg formula for men
    bodyFat = 1.2 * bmi + 0.23 * age - 16.2
  } else {
    // Deurenberg formula for women
    bodyFat = 1.2 * bmi + 0.23 * age - 5.4
  }

  bodyFat = Math.max(3, Math.min(50, bodyFat))

  return {
    percentage: Math.round(bodyFat * 10) / 10,
    method: 'BMI Method (Deurenberg)',
    confidence: 'medium',
    missingMeasurements: [],
  }
}

/**
 * Estimates body fat percentage using waist-to-height ratio
 * Simple method that works reasonably well
 */
export function estimateBodyFatFromWaistToHeight(
  input: BodyCompositionInput,
): BodyFatResult {
  const { waist, height, sex } = input
  const missingMeasurements: string[] = []

  // Normalize sex to lowercase for comparison
  const normalizedSex = sex.toLowerCase()

  if (!waist || !height) {
    if (!waist) missingMeasurements.push('waist')
    if (!height) missingMeasurements.push('height')

    return {
      percentage: 0,
      method: 'Waist-to-Height Method',
      confidence: 'low',
      missingMeasurements,
    }
  }

  const waistToHeightRatio = waist / height

  let bodyFat: number

  if (normalizedSex === 'male') {
    // Approximation for men based on waist-to-height ratio
    bodyFat = (waistToHeightRatio - 0.43) * 100 + 5
  } else {
    // Approximation for women based on waist-to-height ratio
    bodyFat = (waistToHeightRatio - 0.42) * 100 + 8
  }

  bodyFat = Math.max(3, Math.min(50, bodyFat))

  return {
    percentage: Math.round(bodyFat * 10) / 10,
    method: 'Waist-to-Height Method',
    confidence: 'medium',
    missingMeasurements: [],
  }
}

/**
 * Gets the best available body fat estimate based on available measurements
 * Returns the most accurate method possible with the given data
 */
export function getBestBodyFatEstimate(
  input: BodyCompositionInput,
): BodyFatResult {
  // Try Navy method first (most accurate)
  const navyResult = estimateBodyFatNavyMethod(input)
  if (navyResult.confidence === 'high') {
    return navyResult
  }

  // Try waist-to-height method if we have waist
  if (input.waist && input.height) {
    return estimateBodyFatFromWaistToHeight(input)
  }

  // Fall back to BMI method
  return estimateBodyFatFromBMI(input)
}

/**
 * Provides body fat percentage categories and health ranges
 */
export function getBodyFatCategory(
  bodyFatPercentage: number,
  sex: 'male' | 'female',
): {
  category: string
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor' | 'very_poor'
  description: string
} {
  // Normalize sex to lowercase for comparison
  const normalizedSex = sex.toLowerCase()

  if (normalizedSex === 'male') {
    if (bodyFatPercentage <= 6)
      return {
        category: 'Essential Fat',
        healthStatus: 'poor',
        description: 'Dangerously low - only essential fat',
      }
    if (bodyFatPercentage <= 13)
      return {
        category: 'Athletic',
        healthStatus: 'excellent',
        description: 'Very fit athletes',
      }
    if (bodyFatPercentage <= 17)
      return {
        category: 'Fitness',
        healthStatus: 'good',
        description: 'Fit and healthy',
      }
    if (bodyFatPercentage <= 25)
      return {
        category: 'Average',
        healthStatus: 'fair',
        description: 'Average for men',
      }
    return {
      category: 'Obese',
      healthStatus: 'poor',
      description: 'Above healthy range',
    }
  } else {
    if (bodyFatPercentage <= 13)
      return {
        category: 'Essential Fat',
        healthStatus: 'poor',
        description: 'Dangerously low - only essential fat',
      }
    if (bodyFatPercentage <= 20)
      return {
        category: 'Athletic',
        healthStatus: 'excellent',
        description: 'Very fit athletes',
      }
    if (bodyFatPercentage <= 24)
      return {
        category: 'Fitness',
        healthStatus: 'good',
        description: 'Fit and healthy',
      }
    if (bodyFatPercentage <= 32)
      return {
        category: 'Average',
        healthStatus: 'fair',
        description: 'Average for women',
      }
    return {
      category: 'Obese',
      healthStatus: 'poor',
      description: 'Above healthy range',
    }
  }
}

/**
 * Calculates lean body mass from body fat percentage
 */
export function calculateLeanBodyMass(
  weight: number,
  bodyFatPercentage: number,
): number {
  return weight * (1 - bodyFatPercentage / 100)
}

/**
 * Calculates fat mass from body fat percentage
 */
export function calculateFatMass(
  weight: number,
  bodyFatPercentage: number,
): number {
  return weight * (bodyFatPercentage / 100)
}
