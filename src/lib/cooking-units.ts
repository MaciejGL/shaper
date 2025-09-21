import { useUserPreferences } from '@/context/user-preferences-context'

/**
 * Common cooking measurement conversions and display
 * Smart ingredient formatting that uses appropriate cooking units
 */

export type CookingUnit =
  // Weight-based
  | 'g'
  | 'oz'
  | 'lb'
  // Volume-based
  | 'ml'
  | 'l'
  | 'cup'
  | 'fl-oz'
  | 'tbsp'
  | 'tsp'
  // Count-based
  | 'piece'
  | 'slice'
  | 'whole'

export interface CookingMeasurement {
  amount: number
  unit: CookingUnit
  display: string
}

// Conversion factors to grams (for weight) or ml (for volume)
const WEIGHT_CONVERSIONS = {
  g: 1,
  oz: 28.35,
  lb: 453.59,
}

const VOLUME_CONVERSIONS = {
  ml: 1,
  l: 1000,
  cup: 240, // US cup
  'fl-oz': 29.57, // US fluid ounce
  tbsp: 14.79, // US tablespoon
  tsp: 4.93, // US teaspoon
}

// Ingredient categories for smart unit selection
const INGREDIENT_CATEGORIES = {
  // Liquids - use volume units
  liquids: [
    'water',
    'milk',
    'cream',
    'oil',
    'vinegar',
    'wine',
    'broth',
    'stock',
    'juice',
    'sauce',
    'honey',
    'syrup',
    'vanilla extract',
    'lemon juice',
  ],

  // Spices & seasonings - use small weight units or teaspoons
  spices: [
    'salt',
    'pepper',
    'garlic powder',
    'onion powder',
    'paprika',
    'cumin',
    'oregano',
    'basil',
    'thyme',
    'rosemary',
    'cinnamon',
    'ginger',
    'turmeric',
    'cayenne',
    'chili powder',
    'bay leaves',
  ],

  // Baking ingredients - often measured by volume
  baking: [
    'flour',
    'sugar',
    'brown sugar',
    'baking powder',
    'baking soda',
    'cocoa powder',
    'vanilla',
    'yeast',
  ],

  // Produce - often by piece or weight
  produce: [
    'onion',
    'garlic',
    'tomato',
    'potato',
    'carrot',
    'celery',
    'bell pepper',
    'apple',
    'banana',
    'lemon',
    'lime',
    'orange',
  ],

  // Proteins - usually by weight
  proteins: [
    'chicken',
    'beef',
    'pork',
    'fish',
    'salmon',
    'tuna',
    'turkey',
    'tofu',
    'tempeh',
    'eggs',
  ],
}

/**
 * Detect ingredient category based on name
 */
function getIngredientCategory(
  ingredientName: string,
): keyof typeof INGREDIENT_CATEGORIES | null {
  const name = ingredientName.toLowerCase()

  for (const [category, items] of Object.entries(INGREDIENT_CATEGORIES)) {
    if (items.some((item) => name.includes(item))) {
      return category as keyof typeof INGREDIENT_CATEGORIES
    }
  }

  return null
}

/**
 * Smart ingredient formatting that chooses appropriate units
 */
export function formatIngredientAmount(
  grams: number,
  ingredientName: string,
  preferMetric: boolean = true,
): CookingMeasurement {
  const category = getIngredientCategory(ingredientName)

  // Handle spices and seasonings (very small amounts)
  if (category === 'spices' && grams <= 15) {
    if (grams <= 5) {
      // Convert to teaspoons for very small amounts
      const tsp = grams / 2.5 // rough conversion for dry spices
      return {
        amount: Math.round(tsp * 4) / 4, // quarter teaspoon precision
        unit: 'tsp',
        display: formatAmount(Math.round(tsp * 4) / 4, 'tsp'),
      }
    } else {
      // Use grams for small amounts
      return {
        amount: grams,
        unit: 'g',
        display: `${Math.round(grams)}g`,
      }
    }
  }

  // Handle liquids (use volume)
  if (category === 'liquids') {
    // Assume 1g = 1ml for most liquids (close enough for cooking)
    const ml = grams

    if (preferMetric) {
      if (ml >= 1000) {
        const liters = ml / 1000
        return {
          amount: Math.round(liters * 10) / 10,
          unit: 'l',
          display: `${Math.round(liters * 10) / 10}L`,
        }
      } else if (ml >= 100) {
        return {
          amount: Math.round(ml),
          unit: 'ml',
          display: `${Math.round(ml)}ml`,
        }
      } else {
        // Use tablespoons for smaller amounts
        const tbsp = ml / VOLUME_CONVERSIONS.tbsp
        if (tbsp >= 1) {
          return {
            amount: Math.round(tbsp * 2) / 2,
            unit: 'tbsp',
            display: formatAmount(Math.round(tbsp * 2) / 2, 'tbsp'),
          }
        } else {
          const tsp = ml / VOLUME_CONVERSIONS.tsp
          return {
            amount: Math.round(tsp * 4) / 4,
            unit: 'tsp',
            display: formatAmount(Math.round(tsp * 4) / 4, 'tsp'),
          }
        }
      }
    } else {
      // Imperial volume units
      if (ml >= 240) {
        const cups = ml / VOLUME_CONVERSIONS.cup
        return {
          amount: Math.round(cups * 4) / 4,
          unit: 'cup',
          display: formatAmount(Math.round(cups * 4) / 4, 'cup'),
        }
      } else if (ml >= 15) {
        const tbsp = ml / VOLUME_CONVERSIONS.tbsp
        return {
          amount: Math.round(tbsp * 2) / 2,
          unit: 'tbsp',
          display: formatAmount(Math.round(tbsp * 2) / 2, 'tbsp'),
        }
      } else {
        const tsp = ml / VOLUME_CONVERSIONS.tsp
        return {
          amount: Math.round(tsp * 4) / 4,
          unit: 'tsp',
          display: formatAmount(Math.round(tsp * 4) / 4, 'tsp'),
        }
      }
    }
  }

  // Handle everything else with weight units
  if (preferMetric) {
    if (grams >= 1000) {
      const kg = grams / 1000
      return {
        amount: Math.round(kg * 10) / 10,
        unit: 'g',
        display: `${Math.round(kg * 10) / 10}kg`,
      }
    } else {
      return {
        amount: Math.round(grams),
        unit: 'g',
        display: `${Math.round(grams)}g`,
      }
    }
  } else {
    // Imperial weight
    if (grams >= 454) {
      const lbs = grams / WEIGHT_CONVERSIONS.lb
      return {
        amount: Math.round(lbs * 10) / 10,
        unit: 'lb',
        display: `${Math.round(lbs * 10) / 10}lb`,
      }
    } else {
      const oz = grams / WEIGHT_CONVERSIONS.oz
      return {
        amount: Math.round(oz * 10) / 10,
        unit: 'oz',
        display: `${Math.round(oz * 10) / 10}oz`,
      }
    }
  }
}

/**
 * Format amount with proper fraction/decimal display
 */
function formatAmount(amount: number, unit: string): string {
  // For teaspoons and tablespoons, use fractions for common values
  if (unit === 'tsp' || unit === 'tbsp') {
    if (amount === 0.25) return `¼ ${unit}`
    if (amount === 0.5) return `½ ${unit}`
    if (amount === 0.75) return `¾ ${unit}`
    if (amount === 1.5) return `1½ ${unit}`
    if (amount === 2.5) return `2½ ${unit}`
  }

  // For cups, use fractions
  if (unit === 'cup') {
    if (amount === 0.25) return `¼ cup`
    if (amount === 0.33) return `⅓ cup`
    if (amount === 0.5) return `½ cup`
    if (amount === 0.67) return `⅔ cup`
    if (amount === 0.75) return `¾ cup`
    if (amount === 1.5) return `1½ cups`
    if (amount === 2.5) return `2½ cups`
  }

  // Default formatting
  if (amount === Math.floor(amount)) {
    return `${amount} ${unit}${amount !== 1 && (unit === 'cup' || unit === 'tbsp' || unit === 'tsp') ? 's' : ''}`
  } else {
    return `${amount} ${unit}${amount !== 1 && (unit === 'cup' || unit === 'tbsp' || unit === 'tsp') ? 's' : ''}`
  }
}

/**
 * Hook to format ingredients with user preferences
 */
export function useCookingUnits() {
  const { preferences } = useUserPreferences()

  const formatIngredient = (grams: number, ingredientName: string): string => {
    // Use metric system preference as indicator for cooking units
    const preferMetric = preferences.weightUnit === 'kg'
    const measurement = formatIngredientAmount(
      grams,
      ingredientName,
      preferMetric,
    )
    return measurement.display
  }

  return {
    formatIngredient,
  }
}
