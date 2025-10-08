import { existsSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

import { GQLEquipment } from '@/generated/graphql-client'

import type {
  OpenAITrainingExample,
  TrainingExample,
  TrainingStats,
} from './types'

const TRAINING_DATA_PATH = path.join(
  process.cwd(),
  'src/lib/ai-training/training-data.json',
)

/**
 * Load all training examples from storage
 */
export function loadTrainingExamples(): TrainingExample[] {
  if (!existsSync(TRAINING_DATA_PATH)) {
    return []
  }

  try {
    const data = readFileSync(TRAINING_DATA_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading training examples:', error)
    return []
  }
}

/**
 * Save a training example
 */
export function saveTrainingExample(example: TrainingExample): void {
  const examples = loadTrainingExamples()

  // Check if example already exists and update it
  const existingIndex = examples.findIndex((e) => e.id === example.id)
  if (existingIndex >= 0) {
    examples[existingIndex] = example
  } else {
    examples.push(example)
  }

  writeFileSync(TRAINING_DATA_PATH, JSON.stringify(examples, null, 2), 'utf-8')
}

/**
 * Get training progress stats
 */
export function getTrainingStats(): TrainingStats {
  const examples = loadTrainingExamples()
  const approved = examples.filter((e) => e.approved).length

  return {
    total: examples.length,
    approved,
    pending: examples.length - approved,
    targetCount: 50,
  }
}

/**
 * Convert training examples to OpenAI JSONL format
 */
export function exportToOpenAIFormat(
  examples: TrainingExample[],
): OpenAITrainingExample[] {
  const systemMessage = `You are a professional fitness trainer with expertise in exercise programming and workout design. Your role is to create effective, safe, and well-structured workout programs based on user requirements.

When creating workouts, you must:
1. Select exercises that match the requested muscle groups and equipment
2. Order exercises properly (compound movements first, then isolation)
3. Use appropriate rep ranges for the training goal (strength: 3-6 reps, hypertrophy: 8-15 reps, endurance: 15-20 reps)
4. Assign realistic RPE values based on exercise type and training goal
5. Ensure variety and balance in exercise selection
6. Only select exercises from the available exercise database by their ID

Always respond with valid JSON in this exact format:
{
  "exercises": [
    {
      "id": "exercise-id-from-database",
      "createdBy": "trainer-id-or-system",
      "sets": number,
      "minReps": number,
      "maxReps": number,
      "rpe": number,
      "explanation": "Brief rationale for this exercise"
    }
  ],
  "summary": "Brief workout overview",
  "reasoning": "Explanation of exercise selection and programming logic"
}`

  return examples
    .filter((e) => e.approved)
    .map((example) => {
      const userMessage = formatWorkoutRequest(example.input)
      const assistantMessage = JSON.stringify(example.output, null, 2)

      return {
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage },
          { role: 'assistant', content: assistantMessage },
        ],
      }
    })
}

/**
 * Format workout input as a user request message
 */
function formatWorkoutRequest(input: {
  selectedMuscleGroups: string[]
  selectedEquipment: GQLEquipment[]
  exerciseCount: number
  maxSetsPerExercise: number
  rpeRange: string
  repFocus: string
}): string {
  const muscleGroupsText =
    input.selectedMuscleGroups.length > 0
      ? `Target muscle groups: ${input.selectedMuscleGroups.join(', ')}`
      : 'Full-body workout with balanced muscle coverage'

  const equipmentText =
    input.selectedEquipment.length > 0
      ? `Available equipment: ${input.selectedEquipment.join(', ')}${input.selectedEquipment.includes(GQLEquipment.Bodyweight) ? '' : ' (avoid bodyweight exercises)'}`
      : 'Use any available equipment (Barbell, Dumbbell, Cable, Machine, Kettlebell, Band, EZ Bar, Smith Machine, Trap Bar, Bench) - avoid bodyweight-only exercises'

  const rpeText = input.rpeRange.replace('RPE_', '').replace('_', '-')

  return `Create a workout with the following requirements:

${muscleGroupsText}
${equipmentText}
Exercise count: ${input.exerciseCount}
Max sets per exercise: ${input.maxSetsPerExercise}
RPE range: ${rpeText}
Training focus: ${input.repFocus}

Provide a professional workout program with exercise selection, sets, reps, and RPE values.`
}

/**
 * Generate JSONL string for download
 */
export function generateJSONL(examples: TrainingExample[]): string {
  const openAIExamples = exportToOpenAIFormat(examples)
  return openAIExamples.map((ex) => JSON.stringify(ex)).join('\n')
}
