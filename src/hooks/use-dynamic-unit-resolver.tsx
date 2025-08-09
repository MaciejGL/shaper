import { useCircumferenceConversion } from './use-circumference-conversion'
import { useWeightConversion } from './use-weight-conversion'

/**
 * Hook to resolve dynamic units to actual user preference units
 * Maps measurement fields to their appropriate unit based on user preferences
 */
export function useDynamicUnitResolver() {
  const { weightUnit } = useWeightConversion()
  const { circumferenceUnit } = useCircumferenceConversion()

  const resolveUnit = (field: string, unit: string): string => {
    // If unit is not dynamic, return as is
    if (unit !== 'dynamic') {
      return unit
    }

    // Resolve dynamic units based on field type
    switch (field) {
      case 'weight':
        return weightUnit

      case 'chest':
      case 'waist':
      case 'hips':
      case 'neck':
      case 'bicepsLeft':
      case 'bicepsRight':
      case 'thighLeft':
      case 'thighRight':
      case 'calfLeft':
      case 'calfRight':
        return circumferenceUnit

      default:
        return unit
    }
  }

  return { resolveUnit }
}
