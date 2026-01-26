import {
  calculateEstimated1RM,
  calculateImprovementPercentage,
  isPersonalRecord,
} from '../one-rm-calculator'

describe('one-rm-calculator', () => {
  describe('calculateEstimated1RM', () => {
    it('should calculate 1RM using Brzycki formula for reps <= 10', () => {
      // Test case: 100kg x 5 reps
      const result = calculateEstimated1RM(100, 5)
      const expected = 100 / (1.0278 - 0.0278 * 5) // ≈ 112.8kg
      expect(result).toBeCloseTo(expected, 1)
    })

    it('should calculate 1RM using Epley formula for reps 11-15', () => {
      // Test case: 80kg x 12 reps
      const result = calculateEstimated1RM(80, 12)
      const expected = 80 * (1 + 12 / 30) // = 80 * 1.4 = 112kg
      expect(result).toBe(expected)
    })

    it('should calculate 1RM using Epley formula for 13 reps', () => {
      // Regression: 17.5kg x 13 reps ≈ 25.08kg
      const result = calculateEstimated1RM(17.5, 13)
      const expected = 17.5 * (1 + 13 / 30)
      expect(result).toBeCloseTo(expected, 5)
    })

    it('should calculate 1RM using conservative estimate for reps > 15', () => {
      // Test case: 60kg x 20 reps
      const result = calculateEstimated1RM(60, 20)
      const expected = 60 * 1.5 // = 90kg
      expect(result).toBe(expected)
    })

    it('should return 0 for invalid inputs', () => {
      expect(calculateEstimated1RM(0, 5)).toBe(0)
      expect(calculateEstimated1RM(100, 0)).toBe(0)
      expect(calculateEstimated1RM(-50, 5)).toBe(0)
    })
  })

  describe('isPersonalRecord', () => {
    it('should return true for meaningful improvements under 50%', () => {
      const currentWeight = 110
      const currentReps = 5
      const previousBest1RM = 100 // ~10% improvement

      const result = isPersonalRecord(
        currentWeight,
        currentReps,
        previousBest1RM,
      )
      expect(result).toBe(true)
    })

    it('should return false for unrealistic improvements over 50%', () => {
      const currentWeight = 200
      const currentReps = 5
      const previousBest1RM = 100 // ~125% improvement - too much!

      const result = isPersonalRecord(
        currentWeight,
        currentReps,
        previousBest1RM,
      )
      expect(result).toBe(false)
    })

    it('should return false for first-time logging (previousBest1RM = 0)', () => {
      const currentWeight = 100
      const currentReps = 5
      const previousBest1RM = 0

      const result = isPersonalRecord(
        currentWeight,
        currentReps,
        previousBest1RM,
      )
      expect(result).toBe(false)
    })

    it('should return false for improvements below threshold', () => {
      const currentWeight = 100
      const currentReps = 5
      const previousBest1RM = 115 // Current would be ~112.8kg, which is less

      const result = isPersonalRecord(
        currentWeight,
        currentReps,
        previousBest1RM,
      )
      expect(result).toBe(false)
    })

    it('should respect custom thresholds', () => {
      const currentWeight = 101
      const currentReps = 5
      const previousBest1RM = 110 // Small improvement
      const customThreshold = 1.15 // 15% threshold (much higher than default 1%)
      const customMaxImprovement = 10 // 10% max instead of default 50%

      // Should be false due to higher threshold (improvement is ~3% but threshold is 15%)
      const result1 = isPersonalRecord(
        currentWeight,
        currentReps,
        previousBest1RM,
        customThreshold,
      )
      expect(result1).toBe(false)

      // Should be false if improvement exceeds custom max (30%+ improvement > 10% max)
      const result2 = isPersonalRecord(
        125,
        5,
        previousBest1RM,
        1.01,
        customMaxImprovement,
      )
      expect(result2).toBe(false)
    })
  })

  describe('calculateImprovementPercentage', () => {
    it('should calculate improvement percentage correctly', () => {
      const currentWeight = 110
      const currentReps = 5
      const previousBest1RM = 100

      const result = calculateImprovementPercentage(
        currentWeight,
        currentReps,
        previousBest1RM,
      )
      // 110kg x 5 reps = ~123.76kg, vs 100kg = ~23.8% improvement
      expect(result).toBeCloseTo(23.8, 0)
    })

    it('should return 100% for first-time logging', () => {
      const currentWeight = 100
      const currentReps = 5
      const previousBest1RM = 0

      const result = calculateImprovementPercentage(
        currentWeight,
        currentReps,
        previousBest1RM,
      )
      expect(result).toBe(100)
    })
  })
})
