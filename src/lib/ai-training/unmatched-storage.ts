import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

const UNMATCHED_PATH = path.join(
  process.cwd(),
  'src/lib/ai-training/unmatched-exercises.json',
)

export interface UnmatchedExercise {
  id: string
  name: string
  suggestedEquipment?: string
  suggestedMuscleGroups?: string[]
  parsedFrom: string // e.g., "Push #1 - Week 1"
  timestamp: string
  sets?: number
  reps?: string
  rpe?: number
}

/**
 * Load all unmatched exercises
 */
export function loadUnmatchedExercises(): UnmatchedExercise[] {
  if (!existsSync(UNMATCHED_PATH)) {
    return []
  }

  try {
    const data = readFileSync(UNMATCHED_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading unmatched exercises:', error)
    return []
  }
}

/**
 * Save unmatched exercises
 */
export function saveUnmatchedExercise(exercise: UnmatchedExercise): void {
  const exercises = loadUnmatchedExercises()

  // Check if exercise already exists (by name)
  const existing = exercises.find(
    (e) => e.name.toLowerCase() === exercise.name.toLowerCase(),
  )

  if (!existing) {
    exercises.push(exercise)
    writeFileSync(UNMATCHED_PATH, JSON.stringify(exercises, null, 2), 'utf-8')
  }
}

/**
 * Remove an unmatched exercise (after adding to database)
 */
export function removeUnmatchedExercise(id: string): void {
  const exercises = loadUnmatchedExercises()
  const filtered = exercises.filter((e) => e.id !== id)
  writeFileSync(UNMATCHED_PATH, JSON.stringify(filtered, null, 2), 'utf-8')
}

/**
 * Get stats
 */
export function getUnmatchedStats() {
  const exercises = loadUnmatchedExercises()
  return {
    total: exercises.length,
    recentCount: exercises.filter(
      (e) =>
        new Date(e.timestamp) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    ).length,
  }
}
