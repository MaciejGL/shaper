export type HeightUnit = 'cm' | 'ft'

export interface HeightInFeet {
  feet: number
  inches: number
}

/**
 * Convert height from cm to feet/inches
 */
export function cmToFeetInches(heightCm: number): HeightInFeet {
  const totalInches = heightCm / 2.54
  const feet = Math.floor(totalInches / 12)
  const inches = Math.round(totalInches % 12)

  return { feet, inches }
}

/**
 * Convert height from feet/inches to cm
 */
export function feetInchesToCm(feet: number, inches: number): number {
  const totalInches = feet * 12 + inches
  return Math.round(totalInches * 2.54)
}

/**
 * Convert height between different units
 */
export function convertHeight(
  height: number,
  fromUnit: HeightUnit,
  toUnit: HeightUnit,
): number {
  if (fromUnit === toUnit) return height

  if (fromUnit === 'cm' && toUnit === 'ft') {
    // For 'ft' unit, we return the total inches (will be formatted separately)
    return Math.round(height / 2.54)
  }

  if (fromUnit === 'ft' && toUnit === 'cm') {
    // Assuming height is in total inches when unit is 'ft'
    return Math.round(height * 2.54)
  }

  return height
}

/**
 * Format height with the specified unit
 */
export function formatHeight(heightCm: number, unit: HeightUnit): string {
  if (unit === 'cm') {
    return `${heightCm} cm`
  }

  if (unit === 'ft') {
    const { feet, inches } = cmToFeetInches(heightCm)
    return `${feet}'${inches}"`
  }

  return `${heightCm} cm`
}

/**
 * Format height using user's preferred unit, converting from cm if necessary
 */
export function formatHeightWithPreference(
  heightInCm: number,
  preferredUnit: HeightUnit,
): string {
  return formatHeight(heightInCm, preferredUnit)
}

/**
 * Convert height from user's preferred unit to cm for storage
 */
export function convertToCm(
  feet: number,
  inches: number,
  fromUnit: HeightUnit,
): number {
  if (fromUnit === 'cm') {
    // If unit is cm, feet parameter actually contains the cm value
    return feet
  }

  return feetInchesToCm(feet, inches)
}

/**
 * Convert height from cm to user's preferred unit for display
 */
export function convertFromCm(
  heightInCm: number,
  toUnit: HeightUnit,
): HeightInFeet | number {
  if (toUnit === 'ft') {
    return cmToFeetInches(heightInCm)
  }

  return heightInCm
}

/**
 * Parse height input string and return cm value
 * Supports formats like "5'10", "5'10\"", "5 10", "175", "175cm"
 */
export function parseHeightInput(
  input: string,
  unit: HeightUnit,
): number | null {
  if (!input.trim()) return null

  if (unit === 'cm') {
    // Remove 'cm' suffix if present and parse as number
    const cleaned = input.replace(/cm$/i, '').trim()
    const parsed = parseFloat(cleaned)
    return isNaN(parsed) ? null : Math.round(parsed)
  }

  if (unit === 'ft') {
    // Handle various ft/in formats
    const cleaned = input.replace(/["']/g, ' ').trim()

    // Try to match patterns like "5 10", "5'10", etc.
    const matches = cleaned.match(/(\d+)\s*['']?\s*(\d+)?/)

    if (matches) {
      const feet = parseInt(matches[1]) || 0
      const inches = parseInt(matches[2]) || 0

      if (feet >= 0 && inches >= 0 && inches < 12) {
        return feetInchesToCm(feet, inches)
      }
    }

    // Try parsing as single number (assume feet)
    const singleNumber = parseFloat(cleaned)
    if (!isNaN(singleNumber)) {
      return feetInchesToCm(Math.floor(singleNumber), 0)
    }
  }

  return null
}
