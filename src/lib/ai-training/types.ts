/**
 * Types for AI workout fine-tuning training data
 */
import type { GQLEquipment } from '@/generated/graphql-client'

export type RepFocus = 'STRENGTH' | 'HYPERTROPHY' | 'ENDURANCE'

/**
 * Input parameters for generating a workout
 */
export interface WorkoutInput {
  selectedMuscleGroups: string[]
  selectedEquipment: GQLEquipment[]
  exerciseCount: number
  maxSetsPerExercise: number
  repFocus: RepFocus
}

/**
 * Single exercise in a workout
 */
export interface TrainingExercise {
  id: string
  name: string
  createdBy: string
  sets: number
  minReps: number
  maxReps: number
  explanation: string
  equipment?: string
  muscleGroups?: string[]
}

/**
 * Complete workout output from AI
 */
export interface WorkoutOutput {
  exercises: TrainingExercise[]
  summary: string
  reasoning: string
}

/**
 * A complete training example (input + ideal output)
 */
export interface TrainingExample {
  id: string
  createdAt: string
  input: WorkoutInput
  output: WorkoutOutput
  notes?: string
  approved: boolean
}

/**
 * OpenAI fine-tuning message format
 */
export interface OpenAIMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

/**
 * OpenAI fine-tuning JSONL format
 */
export interface OpenAITrainingExample {
  messages: OpenAIMessage[]
}

/**
 * Training progress stats
 */
export interface TrainingStats {
  total: number
  approved: number
  pending: number
  targetCount: number
}
