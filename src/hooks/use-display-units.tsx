import { useUserPreferences } from '@/context/user-preferences-context'

interface UnitConversion {
  quantity: number
  unit: string
}

/**
 * Hook to convert food units based on user preferences
 * Converts between metric/imperial weight units while preserving volume units
 */
export function useDisplayUnits() {
  const { preferences } = useUserPreferences()

  /**
   * Convert a food quantity and unit to display units based on user preferences
   */
  const convertToDisplayUnit = (
    quantity: number,
    unit: string,
  ): UnitConversion => {
    if (!quantity || !unit) {
      return { quantity, unit }
    }

    const unitLower = unit.toLowerCase()

    // If user prefers imperial (lbs), convert metric weight units to imperial
    if (preferences.weightUnit === 'lbs') {
      switch (unitLower) {
        case 'g':
        case 'gram':
        case 'grams':
          if (quantity >= 453.592) {
            // Convert to lbs if >= 1 lb
            return {
              quantity: Math.round(quantity * 0.00220462 * 100) / 100,
              unit: 'lbs',
            }
          } else {
            // Convert to oz for smaller amounts
            return {
              quantity: Math.round(quantity * 0.035274 * 100) / 100,
              unit: 'oz',
            }
          }
        case 'kg':
        case 'kilogram':
        case 'kilograms':
          return {
            quantity: Math.round(quantity * 2.20462 * 100) / 100,
            unit: 'lbs',
          }
      }
    }

    // If user prefers metric (kg), convert imperial weight units to metric
    if (preferences.weightUnit === 'kg') {
      switch (unitLower) {
        case 'oz':
        case 'ounce':
        case 'ounces':
          if (quantity >= 35.274) {
            // Convert to kg if >= 1 kg equivalent
            return {
              quantity: Math.round(quantity * 0.0283495 * 100) / 100,
              unit: 'kg',
            }
          } else {
            // Convert to grams for smaller amounts
            return {
              quantity: Math.round(quantity * 28.3495 * 100) / 100,
              unit: 'g',
            }
          }
        case 'lb':
        case 'lbs':
        case 'pound':
        case 'pounds':
          if (quantity < 2.20462) {
            // Convert to grams if < 1 kg
            return {
              quantity: Math.round(quantity * 453.592 * 100) / 100,
              unit: 'g',
            }
          } else {
            // Convert to kg for larger amounts
            return {
              quantity: Math.round(quantity * 0.453592 * 100) / 100,
              unit: 'kg',
            }
          }
      }
    }

    // Return unchanged for volume units (cups, tbsp, etc.) and piece-based units
    return { quantity, unit }
  }

  /**
   * Convert display units back to storage units (reverse conversion)
   * This is used when saving user input back to the database
   */
  const convertFromDisplayUnit = (
    displayQuantity: number,
    displayUnit: string,
    originalUnit: string,
  ): number => {
    if (!displayQuantity || !displayUnit || !originalUnit) {
      return displayQuantity
    }

    const displayUnitLower = displayUnit.toLowerCase()
    const originalUnitLower = originalUnit.toLowerCase()

    // If original was metric and display is imperial, convert back
    if (
      ['g', 'gram', 'grams'].includes(originalUnitLower) &&
      displayUnitLower === 'oz'
    ) {
      return Math.round(displayQuantity * 28.3495 * 100) / 100
    }

    if (
      ['g', 'gram', 'grams'].includes(originalUnitLower) &&
      displayUnitLower === 'lbs'
    ) {
      return Math.round(displayQuantity * 453.592 * 100) / 100
    }

    if (
      ['kg', 'kilogram', 'kilograms'].includes(originalUnitLower) &&
      displayUnitLower === 'lbs'
    ) {
      return Math.round(displayQuantity * 0.453592 * 100) / 100
    }

    // If original was imperial and display is metric, convert back
    if (
      ['oz', 'ounce', 'ounces'].includes(originalUnitLower) &&
      displayUnitLower === 'g'
    ) {
      return Math.round(displayQuantity * 0.035274 * 100) / 100
    }

    if (
      ['oz', 'ounce', 'ounces'].includes(originalUnitLower) &&
      displayUnitLower === 'kg'
    ) {
      return Math.round(displayQuantity * 0.0283495 * 100) / 100
    }

    if (
      ['lb', 'lbs', 'pound', 'pounds'].includes(originalUnitLower) &&
      (displayUnitLower === 'g' || displayUnitLower === 'kg')
    ) {
      const kgValue =
        displayUnitLower === 'g' ? displayQuantity / 1000 : displayQuantity
      return Math.round(kgValue * 2.20462 * 100) / 100
    }

    // No conversion needed - same unit or non-weight unit
    return displayQuantity
  }

  /**
   * Get the appropriate step value for increment/decrement based on unit
   */
  const getStepForUnit = (unit: string): number => {
    const unitLower = unit.toLowerCase()

    // Weight units - smaller steps for precision
    if (['g', 'gram', 'grams'].includes(unitLower)) return 5
    if (['oz', 'ounce', 'ounces'].includes(unitLower)) return 0.25
    if (
      ['kg', 'kilogram', 'kilograms', 'lb', 'lbs', 'pound', 'pounds'].includes(
        unitLower,
      )
    )
      return 0.1

    // Volume units - standard steps
    if (['ml', 'milliliter', 'milliliters'].includes(unitLower)) return 10
    if (['cup', 'cups'].includes(unitLower)) return 0.25
    if (['tbsp', 'tablespoon', 'tablespoons'].includes(unitLower)) return 0.5
    if (['tsp', 'teaspoon', 'teaspoons'].includes(unitLower)) return 0.25

    // Default step
    return 1
  }

  return {
    convertToDisplayUnit,
    convertFromDisplayUnit,
    getStepForUnit,
  }
}
