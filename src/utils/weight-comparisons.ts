import {
  WEIGHT_COMPARISONS,
  WeightComparison,
} from '@/config/weight-comparisons'

export type Gender = 'male' | 'female' | null | undefined

/**
 * Generates a fun weight comparison for gamification
 * @param weightKg - Total weight lifted in kilograms
 * @param previousComparisons - Array of recently used comparison names to avoid repetition
 * @param gender - User's gender for personalized messages
 * @returns Fun comparison string like "You lifted 3 elephants!" or "140 chickens"
 */
export function generateWeightComparison(
  weightKg: number,
  previousComparisons: string[] = [],
  gender?: Gender,
): {
  comparison: string
  comparisonName: string
} {
  if (weightKg <= 0) {
    return {
      comparison: "You're just getting started! 💪",
      comparisonName: 'getting-started',
    }
  }

  // Find suitable comparisons based on weight range
  const suitableComparisons = findSuitableComparisons(
    weightKg,
    previousComparisons,
  )

  if (suitableComparisons.length === 0) {
    // Fallback to any comparison if none suitable found
    const fallbackComparisons = WEIGHT_COMPARISONS.filter(
      (comp) => !previousComparisons.includes(comp.name),
    )
    if (fallbackComparisons.length > 0) {
      const randomComp =
        fallbackComparisons[
          Math.floor(Math.random() * fallbackComparisons.length)
        ]
      const quantity = Math.max(1, Math.round(weightKg / randomComp.weightKg))
      return {
        comparison: formatComparison(quantity, randomComp, gender),
        comparisonName: randomComp.name,
      }
    }
  }

  // Pick a random comparison from suitable ones
  const selectedComparison =
    suitableComparisons[Math.floor(Math.random() * suitableComparisons.length)]
  const quantity = Math.max(
    1,
    Math.round(weightKg / selectedComparison.weightKg),
  )

  return {
    comparison: formatComparison(quantity, selectedComparison, gender),
    comparisonName: selectedComparison.name,
  }
}

/**
 * Finds suitable weight comparisons based on the weight and previous selections
 */
function findSuitableComparisons(
  weightKg: number,
  previousComparisons: string[],
): WeightComparison[] {
  const availableComparisons = WEIGHT_COMPARISONS.filter(
    (comp) => !previousComparisons.includes(comp.name),
  )

  // For each comparison, calculate how many units it would be
  const suitableComparisons = availableComparisons.filter((comp) => {
    const quantity = weightKg / comp.weightKg

    // We want quantities between 0.5 and 500 for reasonable comparisons
    // This ensures we don't say "0.01 elephants" or "50,000 chickens"
    return quantity >= 0.5 && quantity <= 500
  })

  // Sort by how "reasonable" the quantity is (closer to 1-50 is more interesting)
  return suitableComparisons.sort((a, b) => {
    const qtyA = weightKg / a.weightKg
    const qtyB = weightKg / b.weightKg

    // Score based on how close to the "sweet spot" of 1-20
    const scoreA = getQuantityScore(qtyA)
    const scoreB = getQuantityScore(qtyB)

    return scoreB - scoreA // Higher score is better
  })
}

/**
 * Scores how "interesting" a quantity is for comparisons
 * Higher scores for quantities that sound more impressive/fun
 */
function getQuantityScore(quantity: number): number {
  if (quantity >= 1 && quantity <= 10) return 100 // Perfect range
  if (quantity >= 10 && quantity <= 50) return 80 // Good range
  if (quantity >= 50 && quantity <= 100) return 60 // Okay range
  if (quantity >= 0.5 && quantity < 1) return 40 // Fractional but interesting
  if (quantity >= 100 && quantity <= 200) return 30 // High but manageable
  return 10 // Too high or too low
}

/**
 * Formats the comparison string with proper grammar and emojis
 */
function formatComparison(
  quantity: number,
  comparison: WeightComparison,
  gender?: Gender,
): string {
  const emojiPrefix = comparison.emoji ? `${comparison.emoji} ` : ''
  const name = comparison.name

  // Handle fractional quantities
  if (quantity < 1) {
    const fraction = Math.round(quantity * 10) / 10
    if (fraction === 0.5) {
      return `${emojiPrefix}Half a ${name}!`
    }
    return `${emojiPrefix}${fraction} ${name}!`
  }

  // Handle plural vs singular
  const roundedQuantity = Math.round(quantity)
  const pluralName = getPluralForm(name)
  const displayName = roundedQuantity === 1 ? name : pluralName

  // Gender-specific formats
  const maleFormats = [
    `${emojiPrefix}Damn. That's ${roundedQuantity} ${displayName}. 🔥`,
    `${emojiPrefix}You're cooked… that's ${roundedQuantity} ${displayName}. 😮‍💨`,
    `${emojiPrefix}Bro. ${roundedQuantity} ${displayName}. Absolutely sickening. 🫡`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. We're all gonna make it. 🤝`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Light weight baby! 💪`,
    `${emojiPrefix}${roundedQuantity} ${displayName}. Time to hit the showers, king. ✨`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Now re-rack. 🏋️`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Put the dumbbells back. 😉`,
    `${emojiPrefix}Hold up… ${roundedQuantity} ${displayName}?! Bro's locked in. 🤯`,
    `${emojiPrefix}${roundedQuantity} ${displayName}. No days off mentality. 😎`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Gains goblin mode. 🦍`,
    `${emojiPrefix}Whoa. ${roundedQuantity} ${displayName}. Natty or not? 📈`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Solid pump. 🎯`,
    `${emojiPrefix}${roundedQuantity} ${displayName}. Absolute unit. 👑`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Sleep, eat, repeat. 😴`,
    `${emojiPrefix}${roundedQuantity} ${displayName}. The iron never lies. 🫠`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Go slam a shake. 🍗`,
    `${emojiPrefix}${roundedQuantity} ${displayName}. Anabolic window open. 🥛`,
  ]

  const femaleFormats = [
    `${emojiPrefix}Damn. That's ${roundedQuantity} ${displayName}. 🔥`,
    `${emojiPrefix}You're cooked… that's ${roundedQuantity} ${displayName}. 😮‍💨`,
    `${emojiPrefix}Girl. ${roundedQuantity} ${displayName}. Absolutely sickening. 🫡`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. We're all gonna make it. 🤝`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Light weight baby! 💪`,
    `${emojiPrefix}${roundedQuantity} ${displayName}. Time to hit the showers, queen. ✨`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Now re-rack. 🏋️`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Put the dumbbells back. 😉`,
    `${emojiPrefix}Hold up… ${roundedQuantity} ${displayName}?! She's locked in. 🤯`,
    `${emojiPrefix}${roundedQuantity} ${displayName}. No days off mentality. 😎`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Gains goblin mode. 🦍`,
    `${emojiPrefix}Whoa. ${roundedQuantity} ${displayName}. Strong girl era. 📈`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Solid pump. 🎯`,
    `${emojiPrefix}${roundedQuantity} ${displayName}. Absolute queen. 👑`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Sleep, eat, repeat. 😴`,
    `${emojiPrefix}${roundedQuantity} ${displayName}. The iron never lies. 🫠`,
    `${emojiPrefix}That's ${roundedQuantity} ${displayName}. Go slam a shake. 🍗`,
    `${emojiPrefix}${roundedQuantity} ${displayName}. Protein time. 🥛`,
  ]

  const formats =
    gender?.toLowerCase() === 'female' ? femaleFormats : maleFormats

  return formats[Math.floor(Math.random() * formats.length)]
}

/**
 * Simple plural form generator for common words
 */
function getPluralForm(word: string): string {
  // Handle special cases
  const specialPlurals: Record<string, string> = {
    'human adult': 'human adults',
    'small dog': 'small dogs',
    'medium dog': 'medium dogs',
    'large dog': 'large dogs',
    'baby elephant': 'baby elephants',
    'small car': 'small cars',
    'pickup truck': 'pickup trucks',
    'fire truck': 'fire trucks',
    'garbage truck': 'garbage trucks',
    'school bus': 'school buses',
    'small whale': 'small whales',
    'adult whale': 'adult whales',
    'blue whale': 'blue whales',
    'grizzly bear': 'grizzly bears',
    'polar bear': 'polar bears',
    'giant panda': 'giant pandas',
    'golden retriever': 'golden retrievers',
    'large turkey': 'large turkeys',
    'large pig': 'large pigs',
    'large wolf': 'large wolves',
    'large bull': 'large bulls',
    'office chair': 'office chairs',
    'large suitcase': 'large suitcases',
    'car tire': 'car tires',
    'bowling ball': 'bowling balls',
    'gallon of milk': 'gallons of milk',
    'bag of rice': 'bags of rice',
    'vending machine': 'vending machines',
    'washing machine': 'washing machines',
    'grand piano': 'grand pianos',
  }

  if (specialPlurals[word]) {
    return specialPlurals[word]
  }

  // Standard English plural rules
  if (
    word.endsWith('s') ||
    word.endsWith('sh') ||
    word.endsWith('ch') ||
    word.endsWith('x') ||
    word.endsWith('z')
  ) {
    return word + 'es'
  }
  if (
    word.endsWith('y') &&
    !['a', 'e', 'i', 'o', 'u'].includes(word[word.length - 2])
  ) {
    return word.slice(0, -1) + 'ies'
  }
  if (word.endsWith('f')) {
    return word.slice(0, -1) + 'ves'
  }
  if (word.endsWith('fe')) {
    return word.slice(0, -2) + 'ves'
  }

  return word + 's'
}

/**
 * Manages the history of used comparisons to ensure variety
 * This would typically be stored in localStorage or user preferences
 */
export class WeightComparisonHistory {
  private readonly maxHistorySize = 15 // Keep track of last 15 comparisons
  private history: string[] = []

  constructor(initialHistory: string[] = []) {
    this.history = initialHistory.slice(-this.maxHistorySize)
  }

  addComparison(comparisonName: string): void {
    this.history.push(comparisonName)
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize)
    }
  }

  getHistory(): string[] {
    return [...this.history]
  }

  generateComparison(
    weightKg: number,
    gender?: Gender,
  ): {
    comparison: string
    comparisonName: string
  } {
    const result = generateWeightComparison(weightKg, this.history, gender)
    this.addComparison(result.comparisonName)
    return result
  }
}
