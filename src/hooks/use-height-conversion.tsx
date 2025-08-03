import { useUserPreferences } from '@/context/user-preferences-context'
import {
  type HeightInFeet,
  type HeightUnit,
  convertFromCm,
  feetInchesToCm,
  formatHeightWithPreference,
} from '@/lib/height-utils'

/**
 * Hook to handle height conversion and formatting based on user preferences
 */
export function useHeightConversion() {
  const { preferences } = useUserPreferences()

  const toDisplayHeight = (
    heightInCm: number | null | undefined,
  ): HeightInFeet | number | null => {
    if (heightInCm == null) return null
    return convertFromCm(heightInCm, preferences.heightUnit)
  }

  const toStorageHeight = (
    feet: number,
    inches: number = 0,
    unit: HeightUnit = preferences.heightUnit,
  ): number | null => {
    if (unit === 'cm') {
      // If unit is cm, feet parameter contains the cm value
      return feet || null
    }

    if (feet === 0 && inches === 0) return null
    return feetInchesToCm(feet, inches)
  }

  const formatDisplayHeight = (
    heightInCm: number | null | undefined,
  ): string => {
    if (heightInCm == null) return ''
    return formatHeightWithPreference(heightInCm, preferences.heightUnit)
  }

  const getHeightUnit = () => preferences.heightUnit

  const getHeightLabel = (includeUnit: boolean = true) => {
    const unit = preferences.heightUnit === 'cm' ? 'cm' : 'ft/in'
    return includeUnit ? `Height (${unit})` : 'Height'
  }

  const getHeightPlaceholder = () => {
    return preferences.heightUnit === 'cm' ? 'e.g. 175' : 'e.g. 5\'10"'
  }

  return {
    // Conversion functions
    toDisplayHeight,
    toStorageHeight,

    // Formatting functions
    formatDisplayHeight,

    // Utility functions
    getHeightUnit,
    getHeightLabel,
    getHeightPlaceholder,

    // Direct access to user preference
    heightUnit: preferences.heightUnit,
  }
}
