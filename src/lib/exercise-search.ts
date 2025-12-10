import Fuse from 'fuse.js'

import {
  EQUIPMENT_SYNONYMS,
  expandSearchTerm,
} from '@/config/exercise-keywords'

/**
 * Exercise interface for search
 */
export interface SearchableExercise {
  id: string
  name: string
  description?: string | null
  equipment: string
  muscleGroups?: {
    id: string
    name: string
    alias?: string | null
    displayGroup: string
  }[]
  secondaryMuscleGroups?: {
    id: string
    name: string
    alias?: string | null
    displayGroup: string
  }[]
}

/**
 * Enhanced exercise search using Fuse.js with semantic keyword expansion
 */
export class ExerciseSearchEngine {
  private fuse: Fuse<SearchableExercise>
  private exercises: SearchableExercise[]

  constructor(exercises: SearchableExercise[]) {
    this.exercises = exercises
    this.fuse = new Fuse(exercises, {
      keys: [
        {
          name: 'name',
          weight: 0.8, // Highest weight for exercise name
        },
        {
          name: 'description',
          weight: 0.3,
        },
        {
          name: 'equipment',
          weight: 0.4,
        },
        {
          name: 'muscleGroups.name',
          weight: 0.6,
        },
        {
          name: 'muscleGroups.alias',
          weight: 0.6,
        },
        {
          name: 'muscleGroups.displayGroup',
          weight: 0.5,
        },
        {
          name: 'secondaryMuscleGroups.name',
          weight: 0.4,
        },
        {
          name: 'secondaryMuscleGroups.alias',
          weight: 0.4,
        },
        {
          name: 'secondaryMuscleGroups.displayGroup',
          weight: 0.3,
        },
      ],
      threshold: 0.4, // Lower = more strict, higher = more fuzzy
      distance: 100, // Maximum distance for fuzzy matching
      includeScore: true,
      includeMatches: true,
      ignoreLocation: true, // Don't care about position of match
      findAllMatches: true,
      minMatchCharLength: 2,
    })
  }

  /**
   * Enhanced search with semantic keyword expansion and fuzzy matching
   */
  search(
    searchTerm: string,
    options?: {
      limit?: number
      scoreThreshold?: number
    },
  ): SearchableExercise[] {
    const { limit = 50, scoreThreshold = 0.8 } = options || {}

    if (!searchTerm || searchTerm.trim().length === 0) {
      return this.exercises.slice(0, limit)
    }

    // Expand search term using semantic keywords
    const expandedTerms = expandSearchTerm(searchTerm.trim())

    // Perform multiple searches with different expanded terms
    const allResults = new Map<
      string,
      { exercise: SearchableExercise; score: number }
    >()

    expandedTerms.forEach((term, index) => {
      const results = this.fuse.search(term)

      results.forEach((result) => {
        if (result.score !== undefined && result.score <= scoreThreshold) {
          const exerciseId = result.item.id
          const currentScore = allResults.get(exerciseId)?.score ?? 1

          // Better score (lower number) wins, with slight boost for original term
          const adjustedScore = result.score - (index === 0 ? 0.1 : 0)

          if (adjustedScore < currentScore) {
            allResults.set(exerciseId, {
              exercise: result.item,
              score: adjustedScore,
            })
          }
        }
      })
    })

    // Also search for equipment matches
    this.searchByEquipment(searchTerm).forEach((exercise) => {
      if (!allResults.has(exercise.id)) {
        allResults.set(exercise.id, {
          exercise,
          score: 0.3, // Good score for equipment matches
        })
      }
    })

    // Sort by score and return
    return Array.from(allResults.values())
      .sort((a, b) => a.score - b.score)
      .slice(0, limit)
      .map((result) => result.exercise)
  }

  /**
   * Search by equipment with synonym matching
   */
  private searchByEquipment(searchTerm: string): SearchableExercise[] {
    const normalizedTerm = searchTerm.toLowerCase().trim()
    const matches: SearchableExercise[] = []

    // Check equipment synonyms
    Object.entries(EQUIPMENT_SYNONYMS).forEach(([equipmentType, synonyms]) => {
      if (
        synonyms.some(
          (synonym) =>
            synonym.includes(normalizedTerm) ||
            normalizedTerm.includes(synonym),
        )
      ) {
        const exercisesWithEquipment = this.exercises.filter(
          (ex) => ex.equipment === equipmentType,
        )
        matches.push(...exercisesWithEquipment)
      }
    })

    return matches
  }

  /**
   * Get search suggestions based on partial input
   */
  getSuggestions(partialTerm: string, limit = 5): string[] {
    if (partialTerm.length < 2) return []

    const suggestions = new Set<string>()

    // Add keyword suggestions
    const expandedTerms = expandSearchTerm(partialTerm)
    expandedTerms.slice(0, 3).forEach((term) => suggestions.add(term))

    // Add exercise name suggestions from fuzzy search
    const results = this.fuse.search(partialTerm).slice(0, 3)
    results.forEach((result) => {
      if (result.item.name.toLowerCase().includes(partialTerm.toLowerCase())) {
        suggestions.add(result.item.name)
      }
    })

    return Array.from(suggestions).slice(0, limit)
  }

  /**
   * Update the search index with new exercises
   */
  updateExercises(exercises: SearchableExercise[]) {
    this.exercises = exercises
    this.fuse.setCollection(exercises)
  }

  /**
   * Get total number of exercises in the search index
   */
  getTotalCount(): number {
    return this.exercises.length
  }
}

/**
 * Fallback search function for when Fuse.js search yields no results
 * Uses basic string matching with keyword expansion
 */
export function fallbackSearch(
  exercises: SearchableExercise[],
  searchTerm: string,
  limit = 20,
): SearchableExercise[] {
  if (!searchTerm || searchTerm.trim().length === 0) {
    return exercises.slice(0, limit)
  }

  const expandedTerms = expandSearchTerm(searchTerm.trim())
  const matches: { exercise: SearchableExercise; score: number }[] = []

  exercises.forEach((exercise) => {
    let score = 0
    const searchableText = [
      exercise.name,
      exercise.description || '',
      exercise.equipment,
      ...(exercise.muscleGroups?.map(
        (mg) => `${mg.name} ${mg.alias} ${mg.displayGroup}`,
      ) || []),
      ...(exercise.secondaryMuscleGroups?.map(
        (mg) => `${mg.name} ${mg.alias} ${mg.displayGroup}`,
      ) || []),
    ]
      .join(' ')
      .toLowerCase()

    expandedTerms.forEach((term, index) => {
      const termLower = term.toLowerCase()
      if (searchableText.includes(termLower)) {
        // Exact matches get higher scores, original term gets highest
        score += index === 0 ? 10 : 5

        // Bonus for matches in exercise name
        if (exercise.name.toLowerCase().includes(termLower)) {
          score += index === 0 ? 15 : 8
        }
      }
    })

    if (score > 0) {
      matches.push({ exercise, score })
    }
  })

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((match) => match.exercise)
}
