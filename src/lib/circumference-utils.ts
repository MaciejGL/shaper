export type CircumferenceUnit = 'cm' | 'in'

/**
 * Convert circumference from cm to inches
 */
export function cmToInches(cm: number): number {
  return cm / 2.54
}

/**
 * Convert circumference from inches to cm
 */
export function inchesToCm(inches: number): number {
  return inches * 2.54
}

/**
 * Convert circumference between different units
 */
export function convertCircumference(
  value: number,
  fromUnit: CircumferenceUnit,
  toUnit: CircumferenceUnit,
): number {
  if (fromUnit === toUnit) return value

  if (fromUnit === 'cm' && toUnit === 'in') {
    return cmToInches(value)
  }

  if (fromUnit === 'in' && toUnit === 'cm') {
    return inchesToCm(value)
  }

  return value
}

/**
 * Format circumference with the specified unit
 */
export function formatCircumference(
  value: number,
  unit: CircumferenceUnit,
): string {
  if (unit === 'cm') {
    return `${value.toFixed(1)} cm`
  }

  if (unit === 'in') {
    return `${value.toFixed(1)} in`
  }

  return `${value.toFixed(1)} cm`
}

/**
 * Format circumference using user's preferred unit, converting from cm if necessary
 */
export function formatCircumferenceWithPreference(
  valueInCm: number,
  preferredUnit: CircumferenceUnit,
): string {
  if (preferredUnit === 'in') {
    const inches = cmToInches(valueInCm)
    return formatCircumference(inches, 'in')
  }

  return formatCircumference(valueInCm, 'cm')
}

/**
 * Convert circumference from user's preferred unit to cm for storage
 */
export function convertToCm(
  value: number,
  fromUnit: CircumferenceUnit,
): number {
  if (fromUnit === 'in') {
    return inchesToCm(value)
  }

  return value
}

/**
 * Convert circumference from cm to user's preferred unit for display
 */
export function convertFromCm(
  valueInCm: number,
  toUnit: CircumferenceUnit,
): number {
  if (toUnit === 'in') {
    return cmToInches(valueInCm)
  }

  return valueInCm
}
