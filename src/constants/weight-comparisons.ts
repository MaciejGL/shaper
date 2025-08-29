/**
 * Weight comparisons for gamification in workout summaries
 * All weights are in kilograms for consistency
 */

export interface WeightComparison {
  name: string
  weightKg: number
  emoji?: string
}

export const WEIGHT_COMPARISONS: WeightComparison[] = [
  // Small animals and objects (1-50kg)
  { name: 'chicken', weightKg: 2, emoji: '🐔' },
  { name: 'cat', weightKg: 4.5, emoji: '🐱' },
  { name: 'bowling ball', weightKg: 7, emoji: '🎳' },
  { name: 'gallon of milk', weightKg: 3.8, emoji: '🥛' },
  { name: 'small dog', weightKg: 8, emoji: '🐕' },
  { name: 'watermelon', weightKg: 6, emoji: '🍉' },
  { name: 'laptop', weightKg: 2.5, emoji: '💻' },
  { name: 'brick', weightKg: 3, emoji: '🧱' },
  { name: 'bag of rice', weightKg: 5, emoji: '🍚' },
  { name: 'toddler', weightKg: 12, emoji: '👶' },
  { name: 'medium dog', weightKg: 25, emoji: '🐶' },
  { name: 'bicycle', weightKg: 15, emoji: '🚲' },
  { name: 'car tire', weightKg: 20, emoji: '🛞' },
  { name: 'microwave', weightKg: 18, emoji: '🤖' },
  { name: 'large suitcase', weightKg: 30, emoji: '🧳' },
  { name: 'golden retriever', weightKg: 32, emoji: '🐕‍🦺' },
  { name: 'large turkey', weightKg: 8, emoji: '🦃' },
  { name: 'office chair', weightKg: 22, emoji: '🪑' },

  // Medium objects and animals (50-200kg)
  { name: 'human adult', weightKg: 70, emoji: '🧑' },
  { name: 'washing machine', weightKg: 85, emoji: '🌊' },
  { name: 'large pig', weightKg: 120, emoji: '🐷' },
  { name: 'refrigerator', weightKg: 125, emoji: '🧊' },
  { name: 'motorcycle', weightKg: 180, emoji: '🏍️' },
  { name: 'piano', weightKg: 200, emoji: '🎹' },
  { name: 'large wolf', weightKg: 50, emoji: '🐺' },
  { name: 'giant panda', weightKg: 100, emoji: '🐼' },
  { name: 'vending machine', weightKg: 400, emoji: '🥤' },
  { name: 'baby elephant', weightKg: 120, emoji: '🐘' },

  // Large animals and objects (200-1000kg)
  { name: 'cow', weightKg: 500, emoji: '🐄' },
  { name: 'horse', weightKg: 450, emoji: '🐎' },
  { name: 'small car', weightKg: 1200, emoji: '🚗' },
  { name: 'grand piano', weightKg: 480, emoji: '🎼' },
  { name: 'polar bear', weightKg: 350, emoji: '🐻‍❄️' },
  { name: 'moose', weightKg: 700, emoji: '🫎' },
  { name: 'grizzly bear', weightKg: 300, emoji: '🐻' },
  { name: 'large bull', weightKg: 800, emoji: '🐂' },

  // Very large objects and animals (1000kg+)
  { name: 'elephant', weightKg: 4000, emoji: '🐘' },
  { name: 'SUV', weightKg: 2500, emoji: '🚙' },
  { name: 'pickup truck', weightKg: 2200, emoji: '🛻' },
  { name: 'rhinoceros', weightKg: 2300, emoji: '🦏' },
  { name: 'hippopotamus', weightKg: 2000, emoji: '🦛' },
  { name: 'giraffe', weightKg: 1200, emoji: '🦒' },
  { name: 'walrus', weightKg: 1500, emoji: '🦭' },
  { name: 'yacht', weightKg: 5000, emoji: '🛥️' },
  { name: 'small whale', weightKg: 8000, emoji: '🐋' },
  { name: 'school bus', weightKg: 7000, emoji: '🚌' },
  { name: 'fire truck', weightKg: 12000, emoji: '🚒' },
  { name: 'garbage truck', weightKg: 15000, emoji: '🗑️' },

  // Massive objects (10000kg+)
  { name: 'adult whale', weightKg: 25000, emoji: '🐳' },
  { name: 'bulldozer', weightKg: 18000, emoji: '🚜' },
  { name: 'tank', weightKg: 60000, emoji: '🎯' },
  { name: 'airplane', weightKg: 80000, emoji: '✈️' },
  { name: 'blue whale', weightKg: 150000, emoji: '🐋' },
]
