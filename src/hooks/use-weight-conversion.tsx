import { useUserPreferences } from '@/context/user-preferences-context'
import {
  convertFromKg,
  convertToKg,
  formatWeightWithPreference,
} from '@/lib/weight-utils'

/**
 * Hook to handle weight conversion and formatting based on user preferences
 */
export function useWeightConversion() {
  const { preferences } = useUserPreferences()

  const toDisplayWeight = (
    weightInKg: number | null | undefined,
  ): number | null => {
    if (weightInKg == null) return null
    return Number(convertFromKg(weightInKg, preferences.weightUnit).toFixed(2))
  }

  const toStorageWeight = (
    displayWeight: number | null | undefined,
  ): number | null => {
    if (displayWeight == null) return null
    return convertToKg(displayWeight, preferences.weightUnit)
  }

  const formatDisplayWeight = (
    weightInKg: number | null | undefined,
    decimals: number = 1,
  ): string => {
    if (weightInKg == null) return ''
    return formatWeightWithPreference(
      weightInKg,
      preferences.weightUnit,
      decimals,
    )
  }

  const formatInputWeight = (
    weightInKg: number | null | undefined,
    decimals: number = 1,
  ): string => {
    if (weightInKg == null) return ''
    const displayWeight = toDisplayWeight(weightInKg)
    return displayWeight?.toFixed(decimals) || ''
  }

  const getWeightUnit = () => preferences.weightUnit

  const getWeightLabel = (includeUnit: boolean = true) => {
    const unit = preferences.weightUnit
    return includeUnit ? `Weight (${unit})` : 'Weight'
  }

  return {
    // Conversion functions
    toDisplayWeight,
    toStorageWeight,

    // Formatting functions
    formatDisplayWeight,
    formatInputWeight,

    // Utility functions
    getWeightUnit,
    getWeightLabel,

    // Direct access to user preference
    weightUnit: preferences.weightUnit,
  }
}
