export const macroCaloriesMultiplier = {
  protein: 4,
  carbs: 4,
  fat: 9,
}

export const calculateMacroPercentage = (
  macro: number,
  calories: number,
  macroType: 'protein' | 'carbs' | 'fat',
) => {
  // Handle division by zero - return 0 when calories is 0 or falsy
  if (!calories || calories === 0) {
    return '0'
  }

  return (
    ((macro * macroCaloriesMultiplier[macroType]) / calories) *
    100
  ).toFixed(0)
}

export const convertToGrams = (quantity: number, unit: string): number => {
  const unitLower = unit.toLowerCase()

  const conversions: Record<string, number> = {
    g: 1,
    grams: 1,
    gram: 1,
    kg: 1000,
    kilogram: 1000,
    kilograms: 1000,
    oz: 28.35,
    ounce: 28.35,
    ounces: 28.35,
    lb: 453.59,
    pound: 453.59,
    pounds: 453.59,
    cup: 240,
    cups: 240,
    tbsp: 15,
    tablespoon: 15,
    tablespoons: 15,
    tsp: 5,
    teaspoon: 5,
    teaspoons: 5,
    ml: 1,
    milliliter: 1,
    milliliters: 1,
    l: 1000,
    liter: 1000,
    liters: 1000,
    piece: 100,
    pieces: 100,
    slice: 30,
    slices: 30,
  }

  const conversionFactor = conversions[unitLower] || 1
  return quantity * conversionFactor
}

type Food = {
  caloriesPer100g?: number | null
  proteinPer100g?: number | null
  carbsPer100g?: number | null
  fatPer100g?: number | null
  fiberPer100g?: number | null
  quantity: number
  unit: string
}
export const calculateFoodNutrition = (food: Food) => {
  const grams = convertToGrams(food.quantity, food.unit)
  const factor = grams / 100 // Convert from per 100g to actual grams

  return {
    calories: Math.round((food.caloriesPer100g || 0) * factor * 100) / 100,
    protein: Math.round((food.proteinPer100g || 0) * factor * 100) / 100,
    carbs: Math.round((food.carbsPer100g || 0) * factor * 100) / 100,
    fat: Math.round((food.fatPer100g || 0) * factor * 100) / 100,
    fiber: Math.round((food.fiberPer100g || 0) * factor * 100) / 100,
  }
}

export const formatHour = (hour: number) => {
  return `${hour}:00`
}

export const getMealNutrients = (foods: Food[]) => {
  const mealNutrition = foods.reduce(
    (mealAcc, food) => {
      const foodNutrition = calculateFoodNutrition(food)

      return {
        kcal: mealAcc.kcal + foodNutrition.calories,
        protein: mealAcc.protein + foodNutrition.protein,
        carbs: mealAcc.carbs + foodNutrition.carbs,
        fat: mealAcc.fat + foodNutrition.fat,
        fiber: mealAcc.fiber + foodNutrition.fiber,
      }
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 },
  )

  return mealNutrition
}
