import { useUserPreferences } from '@/context/user-preferences-context'
import {
  type CircumferenceUnit,
  convertFromCm,
  convertToCm,
  formatCircumferenceWithPreference,
} from '@/lib/circumference-utils'

/**
 * Hook to handle circumference conversion and formatting based on height unit preference
 * Body circumferences (chest, waist, biceps, etc.) follow the height unit preference:
 * - cm preference → circumferences in cm
 * - ft preference → circumferences in inches
 */
export function useCircumferenceConversion() {
  const { preferences } = useUserPreferences()

  // Body circumferences follow height unit preference
  const circumferenceUnit: CircumferenceUnit =
    preferences.heightUnit === 'cm' ? 'cm' : 'in'

  const toDisplayCircumference = (
    circumferenceInCm: number | null | undefined,
  ): number | null => {
    if (circumferenceInCm == null) return null
    return convertFromCm(circumferenceInCm, circumferenceUnit)
  }

  const toStorageCircumference = (
    value: number,
    unit: CircumferenceUnit = circumferenceUnit,
  ): number | null => {
    if (!value) return null
    return convertToCm(value, unit)
  }

  const formatDisplayCircumference = (
    circumferenceInCm: number | null | undefined,
  ): string => {
    if (circumferenceInCm == null) return ''
    return formatCircumferenceWithPreference(
      circumferenceInCm,
      circumferenceUnit,
    )
  }

  const getCircumferenceUnit = () => circumferenceUnit

  const getCircumferenceLabel = (
    baseLabel: string,
    includeUnit: boolean = true,
  ) => {
    const unit = circumferenceUnit === 'cm' ? 'cm' : 'in'
    return includeUnit ? `${baseLabel} (${unit})` : baseLabel
  }

  const getCircumferencePlaceholder = () => {
    return circumferenceUnit === 'cm' ? 'e.g. 35.5' : 'e.g. 14.0'
  }

  return {
    // Conversion functions
    toDisplayCircumference,
    toStorageCircumference,

    // Formatting functions
    formatDisplayCircumference,

    // Utility functions
    getCircumferenceUnit,
    getCircumferenceLabel,
    getCircumferencePlaceholder,

    // Direct access to unit
    circumferenceUnit,
  }
}
