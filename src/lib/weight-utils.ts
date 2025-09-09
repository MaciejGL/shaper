import { WeightUnit } from '@/context/user-preferences-context'
import { GQLWeightUnit } from '@/generated/graphql-client'

/**
 * Convert weight between kg and lbs
 */
export function convertWeight(
  weight: number,
  fromUnit: WeightUnit,
  toUnit: WeightUnit,
): number {
  if (fromUnit === toUnit) return weight

  if (fromUnit === 'kg' && toUnit === 'lbs') {
    return weight * 2.20462
  }

  if (fromUnit === 'lbs' && toUnit === 'kg') {
    return weight / 2.20462
  }

  return weight
}

/**
 * Format weight with the specified unit
 */
export function formatWeight(
  weight: number,
  unit: WeightUnit,
  decimals: number = 1,
): string {
  const formatted = weight.toFixed(decimals)
  return `${formatted} ${unit}`
}

/**
 * Format weight using user's preferred unit, converting from kg if necessary
 */
export function formatWeightWithPreference(
  weightInKg: number,
  preferredUnit: WeightUnit,
  decimals: number = 1,
): string {
  const convertedWeight = convertWeight(
    weightInKg,
    GQLWeightUnit.Kg,
    preferredUnit,
  )
  return formatWeight(convertedWeight, preferredUnit, decimals)
}

/**
 * Convert weight from user's preferred unit to kg for storage
 */
export function convertToKg(weight: number, fromUnit: WeightUnit): number {
  return convertWeight(weight, fromUnit, GQLWeightUnit.Kg)
}

/**
 * Convert weight from kg to user's preferred unit for display
 */
export function convertFromKg(weightInKg: number, toUnit: WeightUnit): number {
  return convertWeight(weightInKg, GQLWeightUnit.Kg, toUnit)
}
